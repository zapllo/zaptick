import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import Conversation from '@/models/Conversation';
import { v4 as uuidv4 } from 'uuid';
import { renderTemplateBody, extractHeaderMedia } from '@/lib/renderTemplate'
import Template from '@/models/Template';
import { WalletService } from '@/lib/wallet-service';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

// Helper function to build template components from template structure
function buildTemplateComponents(template: any, variables: any = {}) {
  console.log('🔧 buildTemplateComponents called with variables:', variables);
  console.log('🔧 Template components:', JSON.stringify(template.components, null, 2));

  const components = [];

  if (!template.components) return components;

  for (const component of template.components) {
    console.log('🔧 Processing component:', component.type, component.format);

    if (component.type === 'HEADER') {
      if (component.format === 'TEXT' && component.text?.includes('{{')) {
        // Handle TEXT headers with variables
        const headerParams = [];
        const matches = component.text.match(/\{\{[^}]+\}\}/g) || [];
        matches.forEach((match: string, index: number) => {
          const varName = match.replace(/\{\{|\}\}/g, '').trim();
          const paramIndex = (index + 1).toString();
          headerParams.push({
            type: 'text',
            text: variables[paramIndex] || variables[varName] || `[${varName}]`
          });
        });

        if (headerParams.length > 0) {
          components.push({
            type: 'header',
            parameters: headerParams
          });
        }
      } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(component.format)) {
        // Handle media headers - use mediaUrl from template
        console.log('🔧 Found media header:', component.format, 'mediaUrl:', component.mediaUrl);

        if (component.mediaUrl) {
          let mediaParam;

          if (component.format === 'IMAGE') {
            mediaParam = {
              type: 'image',
              image: {
                link: component.mediaUrl
              }
            };
          } else if (component.format === 'VIDEO') {
            mediaParam = {
              type: 'video',
              video: {
                link: component.mediaUrl
              }
            };
          } else if (component.format === 'DOCUMENT') {
            mediaParam = {
              type: 'document',
              document: {
                link: component.mediaUrl,
                filename: component.text || 'document.pdf'
              }
            };
          }

          if (mediaParam) {
            console.log('🔧 Adding media parameter:', JSON.stringify(mediaParam, null, 2));
            components.push({
              type: 'header',
              parameters: [mediaParam]
            });
          }
        } else {
          console.log('⚠️ Media header found but no mediaUrl available');
        }
      }
    } else if (component.type === 'BODY' && component.text?.includes('{{')) {
      // Handle BODY with variables
      const bodyParams = [];
      const matches = component.text.match(/\{\{[^}]+\}\}/g) || [];
      matches.forEach((match: string, index: number) => {
        const varName = match.replace(/\{\{|\}\}/g, '').trim();
        const paramIndex = (index + 1).toString();
        bodyParams.push({
          type: 'text',
          text: variables[paramIndex] || variables[varName] || `[${varName}]`
        });
      });

      if (bodyParams.length > 0) {
        components.push({
          type: 'body',
          parameters: bodyParams
        });
      }
    } else if (component.type === 'BUTTONS' && component.buttons) {
      // Handle BUTTONS with URL variables
      const buttonComponents = [];

      component.buttons.forEach((button: any, buttonIndex: number) => {
        if (button.type === 'URL' && button.url?.includes('{{')) {
          const matches = button.url.match(/\{\{[^}]+\}\}/g) || [];
          const buttonParams: any[] = [];

          matches.forEach((match: string, index: number) => {
            const varName = match.replace(/\{\{|\}\}/g, '').trim();
            const paramIndex = (index + 1).toString();
            buttonParams.push({
              type: 'text',
              text: variables[paramIndex] || variables[varName] || `[${varName}]`
            });
          });

          if (buttonParams.length > 0) {
            buttonComponents.push({
              type: 'button',
              sub_type: 'url',
              index: buttonIndex,
              parameters: buttonParams
            });
          }
        }
      });

      // Add all button components
      buttonComponents.forEach(buttonComp => {
        components.push(buttonComp);
      });
    }
  }

  console.log('🔧 buildTemplateComponents returning:', JSON.stringify(components, null, 2));
  return components;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const requestData = await req.json();
    const {
      contactId,
      message,
      messageType = 'text',
      senderName,
      templateId,
      language = 'en',
      templateComponents,
      templateData,
      variables = {},
      mediaUrl,
      mediaCaption
    } = requestData;

    console.log('🔍 Request data received:', JSON.stringify(requestData, null, 2));
    console.log('🔍 Variables received:', JSON.stringify(variables, null, 2));

    if (!contactId) {
      return NextResponse.json({
        error: 'Missing required field: contactId'
      }, { status: 400 });
    }

    if (messageType === 'text' && !message) {
      return NextResponse.json({
        error: 'Missing required field: message for text message'
      }, { status: 400 });
    }

    if (messageType === 'template' && !templateId) {
      return NextResponse.json({
        error: 'Missing required field: templateId for template message'
      }, { status: 400 });
    }

    // Add validation for media messages
    if (['image', 'video', 'document'].includes(messageType) && !mediaUrl) {
      return NextResponse.json({
        error: `Missing required field: mediaUrl for ${messageType} message`
      }, { status: 400 });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Get template if this is a template message
    let template = null;
    if (messageType === 'template') {
      template = await Template.findById(templateId);
      if (!template) {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }

      // Check if template is approved
      if (template.status !== 'APPROVED') {
        return NextResponse.json({
          error: 'Template not approved',
          message: 'Only approved templates can be sent to contacts.'
        }, { status: 400 });
      }

      // Check if template was approved less than 10 minutes ago
      if (template.approvedAt) {
        const approvalTime = new Date(template.approvedAt).getTime();
        const currentTime = new Date().getTime();
        const tenMinutesInMs = 10 * 60 * 1000;
        const timeSinceApproval = currentTime - approvalTime;

        if (timeSinceApproval < tenMinutesInMs) {
          const remainingMinutes = Math.ceil((tenMinutesInMs - timeSinceApproval) / (60 * 1000));

          return NextResponse.json({
            error: 'Template recently approved, ',
            message: `This template was recently approved and needs to settle in WhatsApp's system. Please wait ${remainingMinutes} more minute(s) before sending.`,
            remainingMinutes,
            approvedAt: template.approvedAt
          }, { status: 429 });
        }
      }

      // ** NEW: Deduct template cost before sending **
      if (user.companyId) {
        const companyId = typeof user.companyId === 'object' ? user.companyId._id.toString() : user.companyId.toString();
        
        // Determine template type from template category
        const templateType = (template.category?.toLowerCase() || 'utility') as 'marketing' | 'authentication' | 'utility';
        
        console.log(`💰 Deducting template cost for: ${template.name} (${templateType}) to ${contact.phone}`);

        const costResult = await WalletService.deductForTemplateMessage(
          companyId,
          templateType,
          contact.phone,
          template.name,
          undefined, // No campaign ID for individual messages
          uuidv4()   // Generate message ID for tracking
        );

        if (!costResult.success) {
          console.error(`❌ Template cost deduction failed: ${costResult.error}`);
          return NextResponse.json({
            error: 'Insufficient wallet balance',
            message: costResult.error,
            cost: costResult.cost,
            countryCode: costResult.countryCode
          }, { status: 400 });
        }

        console.log(`✅ Template cost deducted: ₹${costResult.cost} for ${costResult.countryCode}`);
        console.log(`💰 Remaining balance: ₹${costResult.balance?.toFixed(4)}`);
      }
    }

    const wabaAccounts = user.wabaAccounts || [];
    const wabaAccount = wabaAccounts.find((account: any) => account.wabaId === contact.wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: 'WABA account not found' }, { status: 404 });
    }

    let phoneNumber = contact.phone;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }

    let whatsappPayload;
    let renderedBody = message;
    let headerMedia = {};

    if (messageType === 'template' && template) {
      console.log('🔧 Building template components with variables:', variables);

      const finalComponents = templateComponents || buildTemplateComponents(template, variables);
      console.log('🔧 Final components built:', JSON.stringify(finalComponents, null, 2));

      whatsappPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "template",
        template: {
          name: template.name,
          language: {
            code: template.language || language
          }
        }
      };

      if (finalComponents && finalComponents.length > 0) {
        whatsappPayload.template.components = finalComponents;
      }

      renderedBody = renderTemplateBody(template, whatsappPayload.template.components, variables);
      headerMedia = extractHeaderMedia(template, whatsappPayload.template.components);

    } else if (messageType === 'image') {
      whatsappPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "image",
        image: {
          link: mediaUrl
        }
      };
      
      if (mediaCaption) {
        whatsappPayload.image.caption = mediaCaption;
      }
      
      renderedBody = mediaCaption || 'Image';

    } else if (messageType === 'video') {
      whatsappPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "video",
        video: {
          link: mediaUrl
        }
      };
      
      if (mediaCaption) {
        whatsappPayload.video.caption = mediaCaption;
      }
      
      renderedBody = mediaCaption || 'Video';

    } else if (messageType === 'document') {
      // Extract filename from URL or use default
      const urlParts = mediaUrl.split('/');
      const filename = urlParts[urlParts.length - 1] || 'document.pdf';
      
      whatsappPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "document",
        document: {
          link: mediaUrl,
          filename: filename
        }
      };
      
      if (mediaCaption) {
        whatsappPayload.document.caption = mediaCaption;
      }
      
      renderedBody = mediaCaption || 'Document';

    } else {
      // Regular text message
      whatsappPayload = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phoneNumber,
        type: "text",
        text: {
          preview_url: false,
          body: message
        }
      };
    }

    console.log('Final WhatsApp payload:', JSON.stringify(whatsappPayload, null, 2));

    if (!INT_TOKEN) {
      console.error('INTERAKT_API_TOKEN is not set');
      return NextResponse.json({
        error: 'Server configuration error: Missing API token'
      }, { status: 500 });
    }

    const interaktResponse = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${wabaAccount.phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'x-access-token': INT_TOKEN,
          'x-waba-id': contact.wabaId,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(whatsappPayload)
      }
    );

    console.log('Interakt response status:', interaktResponse.status);

    const responseText = await interaktResponse.text();
    console.log('WhatsApp API response:', responseText);

    let interaktData;

    if (!responseText || responseText === 'Invalid request' || responseText.startsWith('<!DOCTYPE')) {
      console.error('Invalid response from WhatsApp API:', responseText);
      
      // ** NEW: Refund template cost if sending failed **
      if (messageType === 'template' && user.companyId && template) {
        await refundTemplateMessageCost(
          user.companyId,
          template.name,
          contact.phone,
          `Invalid WhatsApp API response: ${responseText}`
        );
      }
      
      return NextResponse.json({
        error: 'Invalid response from WhatsApp API',
        details: `Status: ${interaktResponse.status}, Response: ${responseText}`,
        phoneNumberId: wabaAccount.phoneNumberId,
        wabaId: contact.wabaId
      }, { status: 400 });
    }

    try {
      interaktData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse WhatsApp response:', parseError);
      
      // ** NEW: Refund template cost if parsing failed **
      if (messageType === 'template' && user.companyId && template) {
        await refundTemplateMessageCost(
          user.companyId,
          template.name,
          contact.phone,
          `JSON parse error: ${parseError}`
        );
      }
      
      return NextResponse.json({
        error: 'Invalid JSON response from WhatsApp API',
        details: responseText,
        status: interaktResponse.status
      }, { status: 400 });
    }

    if (!interaktResponse.ok) {
      console.error('WhatsApp API error:', interaktData);

      // ** NEW: Refund template cost if API returned error **
      if (messageType === 'template' && user.companyId && template) {
        await refundTemplateMessageCost(
          user.companyId,
          template.name,
          contact.phone,
          `WhatsApp API error: ${JSON.stringify(interaktData)}`
        );
      }

      let errorMessage = 'Failed to send message';
      if (interaktData.error?.message) {
        errorMessage = interaktData.error.message;
      } else if (interaktData.error?.error_data?.details) {
        errorMessage = interaktData.error.error_data.details;
      } else if (typeof interaktData.error === 'string') {
        errorMessage = interaktData.error;
      }

      return NextResponse.json({
        error: errorMessage,
        details: interaktData,
        status: interaktResponse.status
      }, { status: 400 });
    }

    // Create or update conversation
    let conversation = await Conversation.findOne({ contactId: contact._id });

    const messageContent = messageType === 'template'
      ? renderedBody
      : renderedBody; // This now handles all message types properly

    const newMessage = {
      id: uuidv4(),
      senderId: 'agent' as const,
      content: messageContent,
      messageType: messageType,
      timestamp: new Date(),
      status: 'sent' as const,
      whatsappMessageId: interaktData.messages?.[0]?.id,
      senderName: senderName || user.name || 'Agent',
      templateName: messageType === 'template' ? template?.name : undefined,
      mediaUrl: ['image', 'video', 'document'].includes(messageType) ? mediaUrl : undefined,
      mediaCaption: ['image', 'video', 'document'].includes(messageType) ? mediaCaption : undefined
    };

    if (conversation) {
      conversation.messages.push(newMessage);
      conversation.lastMessage = messageContent;
      conversation.lastMessageType = messageType;
      conversation.lastMessageAt = new Date();
      conversation.status = 'active';

      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      conversation.isWithin24Hours = conversation.lastMessageAt > last24Hours;
    } else {
      conversation = new Conversation({
        contactId: contact._id,
        wabaId: contact.wabaId,
        phoneNumberId: contact.phoneNumberId,
        userId: decoded.id,
        messages: [newMessage],
        lastMessage: messageContent,
        lastMessageType: messageType,
        lastMessageAt: new Date(),
        isWithin24Hours: true
      });
    }

    await conversation.save();

    contact.lastMessageAt = new Date();
    await contact.save();

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        content: newMessage.content,
        timestamp: newMessage.timestamp,
        status: newMessage.status,
        whatsappMessageId: newMessage.whatsappMessageId,
        senderName: newMessage.senderName,
        templateName: newMessage.templateName,
        mediaUrl: newMessage.mediaUrl,
        mediaCaption: newMessage.mediaCaption
      },
      conversationId: conversation._id
    });

  } catch (error) {
    console.error('Message sending error:', error);
    return NextResponse.json({
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ** NEW: Helper function to refund template cost when sending fails **
async function refundTemplateMessageCost(
  companyId: string | any,
  templateName: string,
  recipientPhone: string,
  errorDetails: string
) {
  try {
    const companyIdStr = typeof companyId === 'object' ? companyId._id.toString() : companyId.toString();
    
    // Calculate what the cost would have been
    const templateType = 'utility'; // Default fallback
    const costResult = await WalletService.calculateTemplateMessageCost(
      companyIdStr,
      templateType,
      recipientPhone
    );

    if (costResult.success && costResult.cost > 0) {
      console.log(`🔄 Refunding template cost: ₹${costResult.cost}`);

      await WalletService.addToWallet(
        companyIdStr,
        costResult.cost,
        `Refund: Template send failed - ${templateName} to ${recipientPhone}`,
        'refund',
        undefined,
        {
          templateName,
          recipientPhone,
          errorDetails: errorDetails.substring(0, 500),
          refundReason: 'template_send_failed'
        }
      );

      console.log(`✅ Template cost refunded: ₹${costResult.cost}`);
    }

  } catch (refundError) {
    console.error('❌ Error refunding template cost:', refundError);
  }
}