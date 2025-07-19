import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import ContactGroup from '@/models/ContactGroup';
import Contact from '@/models/Contact';

// Get a specific contact group
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

    await dbConnect();

    const group = await ContactGroup.findOne({
      _id: params.id,
      userId: decoded.id,
      isActive: true
    }).populate({
      path: 'contacts',
      select: 'name phone email whatsappOptIn tags customFields createdAt'
    });

    if (!group) {
      return NextResponse.json({ error: 'Contact group not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        contacts: group.contacts,
        contactCount: group.contacts.length,
        color: group.color,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
      }
    });

  } catch (error) {
    console.error('Contact group fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch contact group'
    }, { status: 500 });
  }
}

// Update a contact group
export async function PUT(
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { name, description, contacts, color } = await req.json();

    const group = await ContactGroup.findOne({
      _id: params.id,
      userId: decoded.id,
      isActive: true
    });

    if (!group) {
      return NextResponse.json({ error: 'Contact group not found' }, { status: 404 });
    }

    // Check if another group with same name exists (excluding current group)
    if (name && name.trim() !== group.name) {
      const existingGroup = await ContactGroup.findOne({
        name: name.trim(),
        companyId: user.companyId,
        isActive: true,
        _id: { $ne: params.id }
      });

      if (existingGroup) {
        return NextResponse.json({
          error: 'A contact group with this name already exists'
        }, { status: 409 });
      }
    }

    // Validate contacts if provided
    let validatedContacts = group.contacts;
    if (contacts !== undefined) {
      if (contacts.length > 0) {
        const contactsInDb = await Contact.find({
          _id: { $in: contacts },
          userId: decoded.id,
          companyId: user.companyId,
          isActive: true
        });
        validatedContacts = contactsInDb.map(c => c._id);
      } else {
        validatedContacts = [];
      }
    }

    // Update group
    group.name = name?.trim() || group.name;
    group.description = description?.trim() || group.description;
    group.contacts = validatedContacts;
    group.color = color || group.color;

    await group.save();

    // Populate contacts for response
    await group.populate({
      path: 'contacts',
      select: 'name phone email whatsappOptIn tags'
    });

    return NextResponse.json({
      success: true,
      group: {
        id: group._id,
        name: group.name,
        description: group.description,
        contacts: group.contacts,
        contactCount: group.contacts.length,
        color: group.color,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
      }
    });

  } catch (error) {
    console.error('Contact group update error:', error);
    return NextResponse.json({
      error: 'Failed to update contact group',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Delete a contact group
export async function DELETE(
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

    const group = await ContactGroup.findOne({
      _id: params.id,
      userId: decoded.id,
      isActive: true
    });

    if (!group) {
      return NextResponse.json({ error: 'Contact group not found' }, { status: 404 });
    }

    // Soft delete
    group.isActive = false;
    await group.save();

    return NextResponse.json({
      success: true,
      message: 'Contact group deleted successfully'
    });

  } catch (error) {
    console.error('Contact group deletion error:', error);
    return NextResponse.json({
      error: 'Failed to delete contact group'
    }, { status: 500 });
  }
}