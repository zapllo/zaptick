import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import WebhookConfig from "@/models/WebhookConfig";
import { sendWebhook, WebhookPayload } from "@/lib/webhookUtils";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const { wabaId, eventType } = await req.json();

    if (!wabaId || !eventType) {
      return NextResponse.json(
        { error: "wabaId and eventType are required" }, 
        { status: 400 }
      );
    }

    // Verify user has access to this WABA
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wabaAccount = user.wabaAccounts?.find((acc: any) => acc.wabaId === wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: "WABA not found" }, { status: 404 });
    }

    // Get webhook configuration
    const webhookConfig = await WebhookConfig.findOne({
      userId: decoded.id,
      wabaId: wabaId,
      isActive: true
    });

    if (!webhookConfig) {
      return NextResponse.json({ 
        error: "No active webhook configuration found. Please configure your webhook first." 
      }, { status: 404 });
    }

    // Generate test data based on event type
    const testData = generateTestData(eventType, wabaAccount);

    // Prepare webhook payload
    const payload: WebhookPayload = {
      event: eventType,
      timestamp: Date.now(),
      data: testData,
      wabaId: wabaId,
      userId: decoded.id
    };

    console.log(`🧪 Sending test webhook for event: ${eventType}`);
    console.log(`📡 Webhook URL: ${webhookConfig.webhookUrl}`);

    // Send test webhook
    const success = await sendWebhook(webhookConfig.webhookUrl, payload, webhookConfig.secretKey);

    if (success) {
      // Update webhook stats
      await WebhookConfig.findByIdAndUpdate(webhookConfig._id, {
        $inc: { totalEvents: 1 },
        lastTriggered: new Date()
      });

      return NextResponse.json({
        success: true,
        message: `Test webhook sent successfully for event: ${eventType}`,
        testData: testData,
        webhookUrl: webhookConfig.webhookUrl
      });
    } else {
      return NextResponse.json({
        error: "Failed to deliver webhook. Please check your webhook URL and ensure it's accessible.",
        testData: testData,
        webhookUrl: webhookConfig.webhookUrl
      }, { status: 500 });
    }

  } catch (error) {
    console.error("Test webhook error:", error);
    return NextResponse.json(
      { error: "Failed to send test webhook" },
      { status: 500 }
    );
  }
}

function generateTestData(eventType: string, wabaAccount: any) {
  const timestamp = new Date().toISOString();
  const testContact = {
    id: "test_contact_" + Date.now(),
    name: "Test Customer",
    phone: "+1234567890"
  };

  switch (eventType) {
    case 'customer.message':
      return {
        test: true,
        message: {
          id: "test_msg_" + Date.now(),
          whatsappMessageId: "wamid.test_" + Date.now(),
          type: "text",
          content: "Hello! This is a test message from the Zaptick webhook configuration. If you're seeing this, your webhook is working correctly! 🎉",
          timestamp: timestamp
        },
        contact: testContact,
        conversation: {
          id: "test_conv_" + Date.now()
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };

    case 'message.sent':
    case 'message.delivered':
    case 'message.read':
    case 'message.failed':
      const status = eventType.split('.')[1];
      return {
        test: true,
        message: {
          id: "test_msg_" + Date.now(),
          whatsappMessageId: "wamid.test_" + Date.now(),
          status: status,
          contact: testContact,
          timestamp: timestamp,
          template: {
            name: "test_template",
            language: "en"
          },
          ...(status === 'failed' && {
            error: {
              message: "Test error: Simulated message delivery failure for testing purposes",
              code: "test_error_130429",
              details: "This is a test error to demonstrate webhook error handling"
            }
          })
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };

    case 'campaign.sent':
    case 'campaign.delivered':
    case 'campaign.read':
    case 'campaign.failed':
      const campaignStatus = eventType.split('.')[1];
      return {
        test: true,
        campaign: {
          id: "test_campaign_" + Date.now(),
          name: "Test Marketing Campaign",
          status: campaignStatus,
          recipient: testContact,
          timestamp: timestamp,
          template: {
            name: "welcome_message",
            language: "en",
            category: "marketing"
          },
          stats: {
            sent: 1,
            delivered: campaignStatus === 'delivered' ? 1 : 0,
            read: campaignStatus === 'read' ? 1 : 0,
            failed: campaignStatus === 'failed' ? 1 : 0
          }
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };

    case 'message.button_click':
      return {
        test: true,
        message: {
          id: "test_msg_" + Date.now(),
          whatsappMessageId: "wamid.test_" + Date.now(),
          type: "interactive",
          contact: testContact,
          timestamp: timestamp,
          interaction: {
            type: "button_reply",
            button: {
              text: "Get Started",
              payload: "get_started_payload"
            }
          }
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };

    case 'workflow.response':
      return {
        test: true,
        workflow: {
          id: "test_workflow_" + Date.now(),
          name: "Customer Onboarding Flow",
          step: "welcome_step",
          step_name: "Welcome Message",
          response: {
            type: "text",
            content: "Yes, I'm interested in learning more!"
          },
          contact: testContact,
          timestamp: timestamp,
          next_step: "product_demo"
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };

    case 'commerce.cart_order':
      return {
        test: true,
        order: {
          id: "test_order_" + Date.now(),
          status: "created",
          customer: testContact,
          items: [
            {
              id: "test_item_1",
              name: "Premium WhatsApp Package",
              description: "1 month subscription",
              quantity: 1,
              price: 99.99,
              currency: "USD",
              sku: "WHATSAPP_PREMIUM_1M"
            },
            {
              id: "test_item_2", 
              name: "Setup Fee",
              description: "One-time setup and configuration",
              quantity: 1,
              price: 49.99,
              currency: "USD",
              sku: "SETUP_FEE"
            }
          ],
          subtotal: 149.98,
          tax: 12.00,
          total: 161.98,
          currency: "USD",
          timestamp: timestamp,
          payment_method: "whatsapp_pay"
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };

    case 'payment.confirmation':
    case 'payment.failure':
      const paymentStatus = eventType.split('.')[1];
      return {
        test: true,
        payment: {
          id: "test_payment_" + Date.now(),
          status: paymentStatus === 'confirmation' ? 'completed' : 'failed',
          amount: 161.98,
          currency: "USD",
          customer: testContact,
          order_id: "test_order_" + (Date.now() - 1000),
          timestamp: timestamp,
          payment_method: "whatsapp_pay",
          transaction_id: paymentStatus === 'confirmation' ? "txn_" + Date.now() : null,
          ...(paymentStatus === 'failure' && {
            error: {
              message: "Test payment failure: Insufficient funds",
              code: "insufficient_funds",
              details: "This is a simulated payment failure for testing purposes"
            }
          })
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };

    case 'account.alert':
      return {
        test: true,
        alert: {
          id: "test_alert_" + Date.now(),
          type: "quality_rating_warning",
          severity: "warning",
          title: "Quality Rating Decreased",
          message: "Your WhatsApp Business account quality rating has decreased to Medium. This is a test alert to demonstrate webhook functionality.",
          account: {
            wabaId: wabaAccount.wabaId,
            businessName: wabaAccount.businessName,
            phoneNumber: wabaAccount.phoneNumber
          },
          timestamp: timestamp,
          action_required: true,
          recommendations: [
            "Review message templates for compliance",
            "Monitor user feedback and complaints",
            "Ensure opt-in consent for marketing messages"
          ]
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };

    case 'template.status_update':
      return {
        test: true,
        template: {
          id: "test_template_" + Date.now(),
          name: "welcome_new_customer",
          status: "approved",
          language: "en",
          category: "utility",
          previous_status: "pending",
          reason: "Template has been approved and is now available for use",
          timestamp: timestamp,
          content: {
            header: {
              type: "text",
              text: "Welcome to {{1}}!"
            },
            body: {
              text: "Hi {{1}}, welcome to our service! We're excited to have you on board. If you have any questions, feel free to reach out."
            },
            footer: {
              text: "Thank you for choosing us!"
            }
          }
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };

    default:
      return {
        test: true,
        event: eventType,
        message: `Test webhook for event type: ${eventType}. This is a generic test payload.`,
        timestamp: timestamp,
        account: {
          wabaId: wabaAccount.wabaId,
          businessName: wabaAccount.businessName,
          phoneNumber: wabaAccount.phoneNumber
        },
        metadata: {
          source: "webhook_test",
          platform: "zaptick"
        }
      };
  }
}