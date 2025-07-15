import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Contact from "@/models/Contact";
import ContactCustomField from "@/models/ContactCustomField";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

// Update the PUT method to include whatsappOptIn
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const { name, phone, email, countryCode, whatsappOptIn, tags, notes, customFields } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({
        error: 'Missing required fields: name, phone'
      }, { status: 400 });
    }

    // Validate custom fields
    if (customFields) {
      // Get company's custom fields
      const companyCustomFields = await ContactCustomField.find({
        companyId: user.companyId,
        active: true
      });

      // Check required fields
      const missingRequiredFields = companyCustomFields
        .filter(field => field.required)
        .filter(field => {
          const fieldValue = customFields[field.key];
          return fieldValue === undefined || fieldValue === null || fieldValue === '';
        });

      if (missingRequiredFields.length > 0) {
        return NextResponse.json({
          error: `Missing required custom fields: ${missingRequiredFields.map(f => f.name).join(', ')}`
        }, { status: 400 });
      }
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      params.id,
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim(),
        countryCode: countryCode?.trim(),
        whatsappOptIn: whatsappOptIn !== undefined ? whatsappOptIn : true, // Add this
        tags: tags || [],
        notes: notes?.trim(),
        customFields: customFields || {}
      },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contact: {
        id: updatedContact._id,
        name: updatedContact.name,
        phone: updatedContact.phone,
        email: updatedContact.email,
        countryCode: updatedContact.countryCode,
        whatsappOptIn: updatedContact.whatsappOptIn,
        tags: updatedContact.tags,
        notes: updatedContact.notes,
        customFields: updatedContact.customFields || {},
        isActive: updatedContact.isActive,
        createdAt: updatedContact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact update error:', error);
    return NextResponse.json({
      error: 'Failed to update contact',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}