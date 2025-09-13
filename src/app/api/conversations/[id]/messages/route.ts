import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Template from '@/models/Template'; // Add this import

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const conversation = await Conversation.findOne({
      _id: id,
      userId: decoded.id
    }).populate('contactId', 'name phone email whatsappOptIn tags notes');

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Enhanced message processing to include template data and interactive data
    const enhancedMessages = await Promise.all(
      conversation.messages.map(async (message: any) => {
        // Create a base message object with all properties
        const baseMessage = {
          ...message.toObject(),
          // Ensure interactiveData is explicitly included
          interactiveData: message.interactiveData || null
        };

        // For template messages, add additional template data
        if (message.messageType === 'template' && message.templateName) {
          try {
            // console.log('Processing template message with templateName:', message.templateName);

            // Find template by name and user ID
            const template = await Template.findOne({
              name: message.templateName,
              userId: decoded.id
            });

            if (template && template.components) {
              // console.log('Template found:', template.name);
              // console.log('Template components:', template.components.length);

              // Extract mediaUrl from HEADER component with IMAGE format
              const headerComponent = template.components.find(
                (comp: any) => comp.type === 'HEADER' && comp.format === 'IMAGE'
              );

              // Extract buttons from BUTTONS component
              const buttonsComponent = template.components.find(
                (comp: any) => comp.type === 'BUTTONS'
              );

              // console.log('Header component found:', !!headerComponent);
              // console.log('MediaUrl:', headerComponent?.mediaUrl);
              // console.log('Buttons component found:', !!buttonsComponent);
              // console.log('Buttons count:', buttonsComponent?.buttons?.length || 0);

              // Return enhanced message with template data
              return {
                ...baseMessage,
                mediaUrl: headerComponent?.mediaUrl || baseMessage.mediaUrl || null,
                templateButtons: buttonsComponent?.buttons || [],
                templateComponents: template.components
              };
            } else {
              console.log('Template not found for name:', message.templateName);
            }
          } catch (error) {
            console.error('Error fetching template data for message:', message._id, error);
          }
        }

        // If it's an interactive message, ensure the data is included
        // if (message.messageType === 'interactive') {
        //   console.log('Processing interactive message:', message._id);
        //   console.log('Interactive data:', message.interactiveData);
        // }

        return baseMessage;
      })
    );
    // Mark as read and reset unread count
    if (conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
      await conversation.save();
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id,
        contact: conversation.contactId,
        messages: enhancedMessages,
        status: conversation.status,
        assignedTo: conversation.assignedTo,
        tags: conversation.tags,
        isWithin24Hours: conversation.isWithin24Hours,
        lastMessageAt: conversation.lastMessageAt,
        createdAt: conversation.createdAt
      }
    });

  } catch (error) {
    console.error('Conversation messages fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch conversation messages'
    }, { status: 500 });
  }
}