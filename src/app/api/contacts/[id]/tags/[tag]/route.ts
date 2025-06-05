import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; tag: string } }
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
    const decodedTag = decodeURIComponent(params.tag);

    const contact = await Contact.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Remove the tag
    contact.tags = contact.tags.filter(tag => tag !== decodedTag);
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
        notes: contact.notes
      }
    });
  } catch (error) {
    console.error('Remove tag error:', error);
    return NextResponse.json({
      error: 'Failed to remove tag'
    }, { status: 500 });
  }
}
