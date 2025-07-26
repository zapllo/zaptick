import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Pre-made template library
const TEMPLATE_LIBRARY = {
  marketing: [
    {
      id: 'marketing_welcome',
      name: 'welcome_new_customer',
      title: 'Welcome New Customer',
      description: 'Greet new customers and introduce your business',
      category: 'MARKETING',
      language: 'en',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: 'Welcome to {{1}}! 🎉'
        },
        {
          type: 'BODY',
          text: 'Hi {{2}},\n\nThank you for choosing {{1}}! We\'re excited to have you as part of our community.\n\nHere\'s what you can expect:\n• Quality products and services\n• Excellent customer support\n• Exclusive offers and updates\n\nFeel free to reach out if you have any questions!'
        },
        {
          type: 'FOOTER',
          text: 'Welcome aboard! 🚀'
        }
      ],
      variables: [
        { name: 'Business Name', example: 'TechCorp Solutions', position: 1 },
        { name: 'Customer Name', example: 'John', position: 2 }
      ],
      buttons: [
        {
          type: 'URL',
          text: 'Visit Website',
          url: 'https://example.com'
        },
        {
          type: 'QUICK_REPLY',
          text: 'Get Support'
        }
      ],
      tags: ['welcome', 'onboarding', 'greeting'],
      useCase: 'Send to new customers after registration or first purchase'
    },
    {
      id: 'marketing_flash_sale',
      name: 'flash_sale_alert',
      title: 'Flash Sale Alert',
      description: 'Announce limited-time sales and promotions',
      category: 'MARKETING',
      language: 'en',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: '🔥 FLASH SALE ALERT! 🔥'
        },
        {
          type: 'BODY',
          text: 'Hey {{1}}!\n\n*{{2}}% OFF* on all {{3}} items! ⚡\n\n💰 Save big on your favorite products\n⏰ Limited time offer - ends {{4}}\n🎯 Use code: *{{5}}*\n\nDon\'t miss out on these incredible deals!'
        },
        {
          type: 'FOOTER',
          text: 'Hurry! Limited stock available'
        }
      ],
      variables: [
        { name: 'Customer Name', example: 'Sarah', position: 1 },
        { name: 'Discount Percentage', example: '30', position: 2 },
        { name: 'Product Category', example: 'electronics', position: 3 },
        { name: 'End Date', example: 'tonight at midnight', position: 4 },
        { name: 'Coupon Code', example: 'FLASH30', position: 5 }
      ],
      buttons: [
        {
          type: 'URL',
          text: 'Shop Now',
          url: 'https://example.com/sale'
        },
        {
          type: 'COPY_CODE',
          text: 'Copy Code',
          copy_code: '{{5}}'
        }
      ],
      tags: ['sale', 'promotion', 'discount', 'urgent'],
      useCase: 'Promote flash sales and time-sensitive offers'
    },
    {
      id: 'marketing_product_launch',
      name: 'new_product_launch',
      title: 'New Product Launch',
      description: 'Announce new products or services',
      category: 'MARKETING',
      language: 'en',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: '🚀 New Product Launch!'
        },
        {
          type: 'BODY',
          text: 'Hi {{1}}!\n\nWe\'re thrilled to introduce our latest product: *{{2}}*\n\n✨ Key Features:\n• {{3}}\n• {{4}}\n• {{5}}\n\n🎉 *Launch Special*: Get {{6}}% off for the first 100 customers!\n\nBe among the first to experience {{2}}.'
        }
      ],
      variables: [
        { name: 'Customer Name', example: 'Alex', position: 1 },
        { name: 'Product Name', example: 'SmartWatch Pro', position: 2 },
        { name: 'Feature 1', example: 'Heart rate monitoring', position: 3 },
        { name: 'Feature 2', example: 'GPS tracking', position: 4 },
        { name: 'Feature 3', example: 'Waterproof design', position: 5 },
        { name: 'Discount', example: '20', position: 6 }
      ],
      buttons: [
        {
          type: 'URL',
          text: 'Learn More',
          url: 'https://example.com/product'
        },
        {
          type: 'URL',
          text: 'Pre-Order Now',
          url: 'https://example.com/preorder'
        }
      ],
      tags: ['launch', 'product', 'announcement', 'new'],
      useCase: 'Announce new products or services to your customer base'
    }
  ],
  utility: [
    {
      id: 'utility_order_confirmation',
      name: 'order_confirmation',
      title: 'Order Confirmation',
      description: 'Confirm customer orders with details',
      category: 'UTILITY',
      language: 'en',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: 'Order Confirmed ✅'
        },
        {
          type: 'BODY',
          text: 'Hi {{1}},\n\nYour order has been confirmed!\n\n📦 *Order Details:*\nOrder ID: {{2}}\nItems: {{3}}\nTotal: ${{4}}\n\n🚚 *Delivery Information:*\nEstimated delivery: {{5}}\nDelivery address: {{6}}\n\nWe\'ll send you updates as your order progresses.'
        },
        {
          type: 'FOOTER',
          text: 'Thank you for your purchase!'
        }
      ],
      variables: [
        { name: 'Customer Name', example: 'Emma', position: 1 },
        { name: 'Order ID', example: 'ORD-12345', position: 2 },
        { name: 'Items', example: '2x Wireless Headphones', position: 3 },
        { name: 'Total Amount', example: '149.99', position: 4 },
        { name: 'Delivery Date', example: '3-5 business days', position: 5 },
        { name: 'Address', example: '123 Main St, City', position: 6 }
      ],
      buttons: [
        {
          type: 'URL',
          text: 'Track Order',
          url: 'https://example.com/track'
        },
        {
          type: 'QUICK_REPLY',
          text: 'Contact Support'
        }
      ],
      tags: ['order', 'confirmation', 'purchase', 'ecommerce'],
      useCase: 'Send order confirmations to customers after purchase'
    },
    {
      id: 'utility_appointment_reminder',
      name: 'appointment_reminder',
      title: 'Appointment Reminder',
      description: 'Remind customers about upcoming appointments',
      category: 'UTILITY',
      language: 'en',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: '📅 Appointment Reminder'
        },
        {
          type: 'BODY',
          text: 'Hi {{1}},\n\nThis is a friendly reminder about your upcoming appointment:\n\n🕐 *Date & Time:* {{2}}\n📍 *Location:* {{3}}\n👨‍⚕️ *With:* {{4}}\n\n*Important:*\n• Please arrive 15 minutes early\n• Bring a valid ID\n• {{5}}\n\nNeed to reschedule? Just reply to this message.'
        },
        {
          type: 'FOOTER',
          text: 'We look forward to seeing you!'
        }
      ],
      variables: [
        { name: 'Customer Name', example: 'Michael', position: 1 },
        { name: 'Date and Time', example: 'Tomorrow at 2:00 PM', position: 2 },
        { name: 'Location', example: 'Main Office, Room 205', position: 3 },
        { name: 'Provider Name', example: 'Dr. Smith', position: 4 },
        { name: 'Special Instructions', example: 'Bring insurance card', position: 5 }
      ],
      buttons: [
        {
          type: 'QUICK_REPLY',
          text: 'Confirm'
        },
        {
          type: 'QUICK_REPLY',
          text: 'Reschedule'
        }
      ],
      tags: ['appointment', 'reminder', 'booking', 'healthcare'],
      useCase: 'Send appointment reminders to reduce no-shows'
    },
    {
      id: 'utility_payment_reminder',
      name: 'payment_reminder',
      title: 'Payment Reminder',
      description: 'Remind customers about pending payments',
      category: 'UTILITY',
      language: 'en',
      components: [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: '💳 Payment Reminder'
        },
        {
          type: 'BODY',
          text: 'Hi {{1}},\n\nWe hope you\'re doing well. This is a gentle reminder about your pending payment:\n\n📋 *Payment Details:*\nInvoice: {{2}}\nAmount: ${{3}}\nDue Date: {{4}}\n\n💡 *Payment Options:*\n• Online payment portal\n• Bank transfer\n• Visit our office\n\nIf you\'ve already made the payment, please ignore this message.'
        },
        {
          type: 'FOOTER',
          text: 'Questions? Contact our billing team'
        }
      ],
      variables: [
        { name: 'Customer Name', example: 'Lisa', position: 1 },
        { name: 'Invoice Number', example: 'INV-2024-001', position: 2 },
        { name: 'Amount', example: '299.00', position: 3 },
        { name: 'Due Date', example: 'March 15, 2024', position: 4 }
      ],
      buttons: [
        {
          type: 'URL',
          text: 'Pay Now',
          url: 'https://example.com/pay'
        },
        {
          type: 'QUICK_REPLY',
          text: 'Payment Made'
        },
        {
          type: 'QUICK_REPLY',
          text: 'Need Help'
        }
      ],
      tags: ['payment', 'billing', 'reminder', 'invoice'],
      useCase: 'Send payment reminders for overdue invoices'
    }
  ],
  authentication: [
    {
      id: 'auth_otp_verification',
      name: 'otp_verification',
      title: 'OTP Verification',
      description: 'Send one-time passwords for verification',
      category: 'AUTHENTICATION',
      language: 'en',
      components: [
        {
          type: 'BODY',
          text: 'Your verification code for {{1}} is: *{{2}}*\n\nThis code will expire in {{3}} minutes.\n\nDo not share this code with anyone.'
        }
      ],
      variables: [
        { name: 'Service Name', example: 'MyApp Login', position: 1 },
        { name: 'OTP Code', example: '123456', position: 2 },
        { name: 'Expiry Minutes', example: '10', position: 3 }
      ],
      authSettings: {
        codeExpirationMinutes: 10,
        codeLength: 6,
        addCodeEntryOption: true
      },
      tags: ['otp', 'verification', 'security', 'login'],
      useCase: 'Send OTP codes for user authentication'
    }
  ]
};

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category')?.toLowerCase();
    const search = searchParams.get('search')?.toLowerCase();

    let templates: any[] = [];

    // Get templates by category or all
    if (category && category !== 'all') {
      templates = TEMPLATE_LIBRARY[category as keyof typeof TEMPLATE_LIBRARY] || [];
    } else {
      // Get all templates
      templates = [
        ...TEMPLATE_LIBRARY.marketing,
        ...TEMPLATE_LIBRARY.utility,
        ...TEMPLATE_LIBRARY.authentication
      ];
    }

    // Filter by search query
    if (search) {
      templates = templates.filter(template =>
        template.title.toLowerCase().includes(search) ||
        template.description.toLowerCase().includes(search) ||
        template.tags.some((tag: string) => tag.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      templates,
      categories: Object.keys(TEMPLATE_LIBRARY)
    });

  } catch (error) {
    console.error('Library templates fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch library templates'
    }, { status: 500 });
  }
}