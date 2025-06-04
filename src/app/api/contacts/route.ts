import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';

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

    const { name, phone, email, wabaId, tags, notes } = await req.json();

    if (!name || !phone || !wabaId) {
      return NextResponse.json({
        error: 'Missing required fields: name, phone, wabaId'
      }, { status: 400 });
    }

    // Find the WABA account
    const wabaAccount = user.wabaAccounts.find((account: any) => account.wabaId === wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: 'WABA account not found' }, { status: 404 });
    }

    // Check if contact already exists
    const existingContact = await Contact.findOne({
      phone: phone.trim(),
      wabaId
    });

    if (existingContact) {
      return NextResponse.json({
        error: 'Contact with this phone number already exists'
      }, { status: 409 });
    }

    const contact = new Contact({
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim(),
      wabaId,
      phoneNumberId: wabaAccount.phoneNumberId,
      userId: decoded.id,
      tags: tags || [],
      notes: notes?.trim()
    });

    await contact.save();

    return NextResponse.json({
      success: true,
      contact: {
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        whatsappOptIn: contact.whatsappOptIn,
        tags: contact.tags,
        notes: contact.notes,
        isActive: contact.isActive,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact creation error:', error);
    return NextResponse.json({
      error: 'Failed to create contact',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const wabaId = searchParams.get('wabaId');
    const search = searchParams.get('search');

    // Build query
    const query: any = { userId: decoded.id, isActive: true };
    if (wabaId) query.wabaId = wabaId;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      contacts: contacts.map(contact => ({
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        whatsappOptIn: contact.whatsappOptIn,
        tags: contact.tags,
        notes: contact.notes,
        lastMessageAt: contact.lastMessageAt,
        isActive: contact.isActive,
        createdAt: contact.createdAt
      }))
    });

  } catch (error) {
    console.error('Contacts fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch contacts'
    }, { status: 500 });
  }
}
