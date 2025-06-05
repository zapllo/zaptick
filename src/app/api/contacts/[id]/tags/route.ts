import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function POST(
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

    await dbConnect();
    const body = await req.json();
    const { tag } = body;

    if (!tag) {
      return NextResponse.json({ error: 'Tag is required' }, { status: 400 });
    }

    const contact = await Contact.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Add tag if it doesn't already exist
    if (!contact.tags.includes(tag)) {
      contact.tags.push(tag);
      await contact.save();
    }

    return NextResponse.json({
      success: true,
      contact: {
        id: contact._id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        whatsappOptIn: contact.whatsappOptIn,
        tags: contact.tags,
        notes: contact.notes
      }
    });
  } catch (error) {
    console.error('Add tag error:', error);
    return NextResponse.json({
      error: 'Failed to add tag'
    }, { status: 500 });
  }
}
