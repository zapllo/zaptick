import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import ContactGroup from '@/models/ContactGroup';
import Contact from '@/models/Contact';

// Add contacts to a contact group
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { contactIds } = await req.json();

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({
        error: 'Contact IDs are required'
      }, { status: 400 });
    }

    // Find the contact group
    const contactGroup = await ContactGroup.findOne({
      _id: params.id,
      userId: decoded.id,
      companyId: user.companyId,
      isActive: true
    });

    if (!contactGroup) {
      return NextResponse.json({
        error: 'Contact group not found'
      }, { status: 404 });
    }

    // Validate that all contacts exist and belong to the user
    const validContacts = await Contact.find({
      _id: { $in: contactIds },
      userId: decoded.id,
      companyId: user.companyId,
      isActive: true
    });

    if (validContacts.length !== contactIds.length) {
      return NextResponse.json({
        error: 'Some contacts were not found or do not belong to you'
      }, { status: 400 });
    }

    // Get the IDs of valid contacts
    const validContactIds = validContacts.map(contact => contact._id);

    // Filter out contacts that are already in the group
    const newContactIds = validContactIds.filter(
      contactId => !contactGroup.contacts.some(existingId => 
        existingId.toString() === contactId.toString()
      )
    );

    if (newContactIds.length === 0) {
      return NextResponse.json({
        error: 'All selected contacts are already in this group'
      }, { status: 400 });
    }

    // Add the new contacts to the group
    contactGroup.contacts.push(...newContactIds);
    await contactGroup.save();

    // Populate the contacts for response
    await contactGroup.populate({
      path: 'contacts',
      select: 'name phone email whatsappOptIn tags'
    });

    return NextResponse.json({
      success: true,
      message: `${newContactIds.length} contact${newContactIds.length > 1 ? 's' : ''} added to group`,
      group: {
        id: contactGroup._id,
        name: contactGroup.name,
        description: contactGroup.description,
        contacts: contactGroup.contacts,
        contactCount: contactGroup.contacts.length,
        color: contactGroup.color,
        createdAt: contactGroup.createdAt,
        updatedAt: contactGroup.updatedAt
      },
      addedCount: newContactIds.length,
      skippedCount: contactIds.length - newContactIds.length
    });

  } catch (error) {
    console.error('Add contacts to group error:', error);
    return NextResponse.json({
      error: 'Failed to add contacts to group',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Remove contacts from a contact group
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { contactIds } = await req.json();

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({
        error: 'Contact IDs are required'
      }, { status: 400 });
    }

    // Find the contact group
    const contactGroup = await ContactGroup.findOne({
      _id: params.id,
      userId: decoded.id,
      companyId: user.companyId,
      isActive: true
    });

    if (!contactGroup) {
      return NextResponse.json({
        error: 'Contact group not found'
      }, { status: 404 });
    }

    // Remove contacts from the group
    const originalCount = contactGroup.contacts.length;
    contactGroup.contacts = contactGroup.contacts.filter(
      contactId => !contactIds.includes(contactId.toString())
    );
    
    const removedCount = originalCount - contactGroup.contacts.length;
    
    if (removedCount === 0) {
      return NextResponse.json({
        error: 'No contacts were removed (they may not have been in the group)'
      }, { status: 400 });
    }

    await contactGroup.save();

    // Populate the contacts for response
    await contactGroup.populate({
      path: 'contacts',
      select: 'name phone email whatsappOptIn tags'
    });

    return NextResponse.json({
      success: true,
      message: `${removedCount} contact${removedCount > 1 ? 's' : ''} removed from group`,
      group: {
        id: contactGroup._id,
        name: contactGroup.name,
        description: contactGroup.description,
        contacts: contactGroup.contacts,
        contactCount: contactGroup.contacts.length,
        color: contactGroup.color,
        createdAt: contactGroup.createdAt,
        updatedAt: contactGroup.updatedAt
      },
      removedCount
    });

  } catch (error) {
    console.error('Remove contacts from group error:', error);
    return NextResponse.json({
      error: 'Failed to remove contacts from group',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}