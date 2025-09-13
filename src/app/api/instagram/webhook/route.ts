import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import InstagramAccount from '@/models/InstagramAccount';
import InstagramConversation from '@/models/InstagramConversation';
import InstagramComment from '@/models/InstagramComment';
import { v4 as uuidv4 } from 'uuid';
import { InstagramService } from '@/lib/instagram';

const VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Instagram webhook verified');
      return new Response(challenge, { status: 200 });
    } else {
      return new Response('Forbidden', { status: 403 });
    }
  }

  return new Response('Bad Request', { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    console.log('Instagram webhook received:', JSON.stringify(body, null, 2));

    if (body.object === 'instagram') {
      for (const entry of body.entry) {
        await processInstagramEntry(entry);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Instagram webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function processInstagramEntry(entry: any) {
  const { id, time, messaging, comments } = entry;

  // Process direct messages
  if (messaging) {
    for (const message of messaging) {
      await processDirectMessage(message);
    }
  }

  // Process comments
  if (comments) {
    for (const comment of comments) {
      await processComment(comment);
    }
  }
}

async function processDirectMessage(message: any) {
  try {
    const { sender, recipient, timestamp, message: messageData } = message;

    // Find the Instagram account
    const instagramAccount = await InstagramAccount.findOne({
      instagramAccountId: recipient.id
    });

    if (!instagramAccount) {
      console.log('Instagram account not found:', recipient.id);
      return;
    }

    // Create or find conversation
    let conversation = await InstagramConversation.findOne({
      instagramUserId: sender.id,
      instagramAccountId: recipient.id
    });

    if (!conversation) {
      // Get user profile info
      const profileResult = await InstagramService.getUserProfile(
        sender.id,
        instagramAccount.accessToken
      );

      conversation = new InstagramConversation({
        instagramUserId: sender.id,
        instagramUsername: profileResult.success ? profileResult.profile.username : sender.id,
        instagramAccountId: recipient.id,
        userId: instagramAccount.userId,
        companyId: instagramAccount.companyId,
        messages: [],
        unreadCount: 0,
        status: 'active',
        isWithin24Hours: true,
        customerInfo: profileResult.success ? {
          profilePictureUrl: profileResult.profile.profile_picture_url,
          followerCount: profileResult.profile.followers_count,
          isVerified: profileResult.profile.account_type === 'BUSINESS'
        } : undefined
      });
    }

    // Process message content
    let messageContent = '';
    let messageType: 'text' | 'image' | 'story_reply' | 'story_mention' | 'media_share' = 'text';
    let mediaUrl = '';

    if (messageData.text) {
      messageContent = messageData.text;
      messageType = 'text';
    } else if (messageData.attachments) {
      const attachment = messageData.attachments[0];
      if (attachment.type === 'image') {
        messageType = 'image';
        mediaUrl = attachment.payload.url;
        messageContent = 'Image received';
      } else if (attachment.type === 'template') {
        // Story reply or mention
        const payload = attachment.payload;
        if (payload.is_echo) return; // Skip echo messages
        
        messageType = payload.template_type === 'story_reply' ? 'story_reply' : 'story_mention';
        messageContent = payload.text || 'Story interaction';
      }
    }

    // Create message object
    const newMessage = {
      id: uuidv4(),
      senderId: 'customer' as const,
      content: messageContent,
      messageType,
      timestamp: new Date(timestamp * 1000),
      status: 'delivered' as const,
      instagramMessageId: messageData.mid,
      senderName: conversation.instagramUsername || sender.id,
      mediaUrl: mediaUrl || undefined
    };

    // Add message to conversation
    conversation.messages.push(newMessage);
    conversation.lastMessage = messageContent;
    conversation.lastMessageType = messageType;
    conversation.lastMessageAt = new Date();
    conversation.unreadCount = (conversation.unreadCount || 0) + 1;

    // Update 24-hour window
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    conversation.isWithin24Hours = new Date() > twentyFourHoursAgo;

    await conversation.save();

    console.log(`Instagram message processed: ${messageContent}`);

    // TODO: Trigger automation (similar to WhatsApp)
    // await processInstagramAutomations(conversation, newMessage);

  } catch (error) {
    console.error('Error processing Instagram direct message:', error);
  }
}

async function processComment(commentData: any) {
  try {
    const { value } = commentData;
    const { id, from, media, text, created_time, parent_id } = value;

    // Find the Instagram account
    const instagramAccount = await InstagramAccount.findOne({
      instagramAccountId: media.media_product_type === 'REELS' ? media.id : media.ig_id
    });

    if (!instagramAccount) {
      console.log('Instagram account not found for media:', media.id);
      return;
    }

    // Check if comment already exists
    const existingComment = await InstagramComment.findOne({ commentId: id });
    if (existingComment) {
      console.log('Comment already processed:', id);
      return;
    }

    // Get user profile
    const profileResult = await InstagramService.getUserProfile(
      from.id,
      instagramAccount.accessToken
    );

    // Create comment record
    const comment = new InstagramComment({
      commentId: id,
      parentId: parent_id,
      mediaId: media.id,
      mediaUrl: media.media_url,
      mediaType: media.media_type?.toLowerCase() || 'image',
      instagramAccountId: instagramAccount.instagramAccountId,
      userId: instagramAccount.userId,
      companyId: instagramAccount.companyId,
      authorId: from.id,
      authorUsername: from.username,
      authorProfilePic: profileResult.success ? profileResult.profile.profile_picture_url : undefined,
      text,
      timestamp: new Date(created_time),
      isHidden: false,
      status: 'new',
      priority: detectPriority(text),
      sentiment: detectSentiment(text)
    });

    await comment.save();

    console.log(`Instagram comment processed: ${text}`);

    // TODO: Trigger comment automation
    // await processCommentAutomations(comment);

  } catch (error) {
    console.error('Error processing Instagram comment:', error);
  }
}

// Helper functions
function detectPriority(text: string): 'low' | 'medium' | 'high' {
  const urgentKeywords = ['urgent', 'emergency', 'help', 'problem', 'issue', 'complaint'];
  const textLower = text.toLowerCase();
  
  if (urgentKeywords.some(keyword => textLower.includes(keyword))) {
    return 'high';
  }
  
  return 'medium';
}

// ... existing code ...

function detectSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const positiveKeywords = ['love', 'great', 'awesome', 'amazing', 'excellent', 'good', '👍', '❤️', '🔥'];
  const negativeKeywords = ['hate', 'bad', 'terrible', 'awful', 'worst', 'horrible', '👎', '😞', '😡'];
  
  const textLower = text.toLowerCase();
  
  const positiveCount = positiveKeywords.filter(keyword => textLower.includes(keyword)).length;
  const negativeCount = negativeKeywords.filter(keyword => textLower.includes(keyword)).length;
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}