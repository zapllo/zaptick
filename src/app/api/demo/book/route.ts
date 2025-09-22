import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Demo from '@/models/Demo';
import { sendEmail } from '@/lib/sendEmail';

// Function to generate a 6-character booking ID
function generateBookingId(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month with leading zero
  const day = now.getDate().toString().padStart(2, '0'); // Day with leading zero

  // Generate 2 random alphanumeric characters
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Excluding O and 0 for clarity
  let randomChars = '';
  for (let i = 0; i < 2; i++) {
    randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Format: YYMMDD + 2 random chars = 6 characters total
  // But we want only 6 chars, so let's use YYMM + 2 random chars
  return year + month + randomChars;
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const demoData = await req.json();

    console.log('Received demo data:', demoData);

    // Extract UTM parameters if available
    const { searchParams } = new URL(req.url);
    const utmData = {
      source: searchParams.get('utm_source') || undefined,
      campaign: searchParams.get('utm_campaign') || undefined,
      referrer: req.headers.get('referer') || undefined,
    };

    console.log('UTM data:', utmData);

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'company', 'jobTitle', 'industry', 'companySize', 'preferredDate', 'preferredTime'];
    const missingFields = requiredFields.filter(field => !demoData[field]);

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate unique booking ID
    let bookingId = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      bookingId = generateBookingId();

      // Check if this booking ID already exists
      const existingBooking = await Demo.findOne({ bookingId });
      if (!existingBooking) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      console.error('Failed to generate unique booking ID after', maxAttempts, 'attempts');
      return NextResponse.json(
        { error: 'Unable to generate booking ID. Please try again.' },
        { status: 500 }
      );
    }

    // Create new demo booking
    const demo = new Demo({
      bookingId, // Add the custom booking ID
      firstName: demoData.firstName,
      lastName: demoData.lastName,
      email: demoData.email,
      phone: demoData.phone,
      countryCode: demoData.countryCode || '+91',
      company: demoData.company,
      jobTitle: demoData.jobTitle,
      website: demoData.website || undefined,
      industry: demoData.industry,
      companySize: demoData.companySize,
      currentSolution: demoData.currentSolution || undefined,
      interests: demoData.interests || [],
      preferredDate: new Date(demoData.preferredDate),
      preferredTime: demoData.preferredTime,
      additionalInfo: demoData.additionalInfo || undefined,
      status: 'pending',
      bookedAt: new Date(),
      ...utmData
    });

    console.log('About to save demo:', demo.toObject());

    const savedDemo = await demo.save();
    console.log('Demo saved successfully with booking ID:', savedDemo.bookingId);

    // Send confirmation email to the user
    try {
      await sendEmail({
        to: demoData.email,
        subject: 'Demo Booking Confirmed - Zaptick WhatsApp Business Solutions',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Demo Confirmed!</h1>
              <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Your Zaptick demo has been successfully booked</p>
            </div>

            <div style="background: white; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hi ${demoData.firstName}!</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.5;">
                Thank you for booking a demo with Zaptick! We're excited to show you how our WhatsApp Business solutions can transform your customer communication.
              </p>

              <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">Demo Details:</h3>
                <div style="color: #4b5563;">
                  <p><strong>Booking ID:</strong> <span style="background: #dbeafe; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold;">${savedDemo.bookingId}</span></p>
                  <p><strong>Date:</strong> ${new Date(demoData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Time:</strong> ${demoData.preferredTime}</p>
                  <p><strong>Duration:</strong> 30 minutes</p>
                  <p><strong>Company:</strong> ${demoData.company}</p>
                  <p><strong>Industry:</strong> ${demoData.industry}</p>
                </div>
              </div>

              <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">What happens next?</h4>
                <ol style="margin: 0; padding-left: 20px; color: #1e3a8a;">
                  <li>You'll receive a calendar invitation within 15 minutes</li>
                  <li>Our WhatsApp expert will call you at the scheduled time</li>
                  <li>We'll show you a personalized demo based on your needs</li>
                </ol>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://wa.me/919836630366?text=Hi%20Zaptick%20team%2C%20I%20just%20booked%20a%20demo%20(ID:%20${savedDemo.bookingId})%20and%20wanted%20to%20confirm%20the%20details."
                   style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Contact Us on WhatsApp
                </a>
              </div>

              <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 30px 0 0 0;">
                Need to reschedule? Just reply to this email or contact us on WhatsApp with your booking ID: <strong>${savedDemo.bookingId}</strong>
              </p>
            </div>

            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>This email was sent by Zaptick - WhatsApp Business Solutions</p>
              <p>Need help? Contact us at support@zaptick.com</p>
            </div>
          </div>
        `
      });
      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    // Send notification to the team
    try {
      await sendEmail({
        to: 'sales@zaptick.com', // Replace with your sales team email
        subject: `🔥 New Demo Booking - ${demoData.company} (${savedDemo.bookingId})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #ef4444; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">🔥 New Demo Booking Alert</h2>
              <p style="color: white; margin: 5px 0 0 0;">Booking ID: <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-family: monospace; font-weight: bold;">${savedDemo.bookingId}</span></p>
            </div>

            <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: 0;">
              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">👤 Contact Information</h3>
                <p><strong>Name:</strong> ${demoData.firstName} ${demoData.lastName}</p>
                <p><strong>Email:</strong> <a href="mailto:${demoData.email}">${demoData.email}</a></p>
                <p><strong>Phone:</strong> <a href="tel:+${demoData.countryCode || '91'}${demoData.phone}">+${demoData.countryCode || '91'} ${demoData.phone}</a></p>
                <p><strong>Job Title:</strong> ${demoData.jobTitle}</p>
              </div>

              <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">🏢 Company Information</h3>
                <p><strong>Company:</strong> ${demoData.company}</p>
                <p><strong>Website:</strong> ${demoData.website ? `<a href="${demoData.website}" target="_blank">${demoData.website}</a>` : 'Not provided'}</p>
                <p><strong>Industry:</strong> <span style="background: #dbeafe; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${demoData.industry}</span></p>
                <p><strong>Company Size:</strong> ${demoData.companySize}</p>
                <p><strong>Current Solution:</strong> ${demoData.currentSolution || 'Not specified'}</p>
              </div>

              <div style="background: #f0fdf4; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10b981;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">📅 Demo Schedule</h3>
                <p><strong>Booking ID:</strong> <span style="background: #dcfce7; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-weight: bold;">${savedDemo.bookingId}</span></p>
                <p><strong>Date:</strong> ${new Date(demoData.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Time:</strong> ${demoData.preferredTime}</p>
                <p><strong>Interests:</strong> ${demoData.interests && demoData.interests.length > 0 ? demoData.interests.map((interest: string) => {
          const interestLabels: Record<string, string> = {
            'whatsapp-api': 'WhatsApp API Setup',
            'automation': 'Message Automation',
            'broadcasting': 'Bulk Messaging',
            'analytics': 'Analytics & Reporting',
            'integrations': 'CRM Integrations',
            'team-features': 'Team Features'
          };
          return interestLabels[interest] || interest;
        }).join(', ') : 'Not specified'}</p>
              </div>

              ${demoData.additionalInfo ? `
              <div style="background: #fffbeb; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 10px 0; color: #1f2937;">💡 Additional Information</h3>
                <p style="font-style: italic;">"${demoData.additionalInfo}"</p>
              </div>
              ` : ''}
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0 0 15px 0; font-weight: bold; color: #ef4444;">⚡ Action Required:</p>
              <div style="display: inline-block;">
                <a href="mailto:${demoData.email}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 5px; display: inline-block;">Send Calendar Invite</a>
                <a href="https://wa.me/${demoData.countryCode || '91'}${demoData.phone}" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 5px; display: inline-block;">WhatsApp Contact</a>
              </div>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #6b7280;">
                Please prepare personalized demo content for ${demoData.industry} industry
              </p>
            </div>
          </div>
        `
      });
      console.log('Team notification email sent successfully');
    } catch (emailError) {
      console.error('Error sending team notification:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Demo booking confirmed successfully',
      bookingId: savedDemo.bookingId // Return the custom booking ID instead of MongoDB _id
    });

  } catch (error: any) {
    console.error('Demo booking error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate booking error
    if (error.message.includes('pending demo booking')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    // Handle mongoose errors
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return NextResponse.json(
        { error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to book demo. Please try again.' },
      { status: 500 }
    );
  }
}
