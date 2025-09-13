import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import ContactGroup from '@/models/ContactGroup';
import Contact from '@/models/Contact';

// Create a new contact group
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

    const { name, description, contacts, color } = await req.json();

    if (!name) {
      return NextResponse.json({
        error: 'Name is required'
      }, { status: 400 });
    }

    // Check if group with same name exists
    const existingGroup = await ContactGroup.findOne({
      name: name.trim(),
      companyId: user.companyId,
      isActive: true
    });

    if (existingGroup) {
      return NextResponse.json({
        error: 'A contact group with this name already exists'
      }, { status: 409 });
    }

    // Validate contacts exist and belong to the user
    let validatedContacts = [];
    if (contacts && contacts.length > 0) {
      const contactsInDb = await Contact.find({
        _id: { $in: contacts },
        userId: decoded.id,
        companyId: user.companyId,
        isActive: true
      });
      validatedContacts = contactsInDb.map(c => c._id);
    }

    const contactGroup = new ContactGroup({
      name: name.trim(),
      description: description?.trim(),
      companyId: user.companyId,
      userId: decoded.id,
      contacts: validatedContacts,
      color: color || '#3B82F6'
    });

    await contactGroup.save();

    // Populate the contacts for response
    await contactGroup.populate({
      path: 'contacts',
      select: 'name phone email'
    });

    return NextResponse.json({
      success: true,
      group: {
        id: contactGroup._id,
        name: contactGroup.name,
        description: contactGroup.description,
        contacts: contactGroup.contacts,
        color: contactGroup.color,
        contactCount: contactGroup.contacts.length,
        createdAt: contactGroup.createdAt
      }
    });

  } catch (error) {
    console.error('Contact group creation error:', error);
    return NextResponse.json({
      error: 'Failed to create contact group',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ... existing imports ...

// Update the GET function to optionally include full contact details
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

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const includeContacts = searchParams.get('includeContacts') === 'true';
    const includeContactDetails = searchParams.get('includeContactDetails') === 'true';

    // Build query
    const query: any = { 
      userId: decoded.id,
      companyId: user.companyId,
      isActive: true 
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let groupsQuery = ContactGroup.find(query).sort({ createdAt: -1 });

    if (includeContacts || includeContactDetails) {
      const selectFields = includeContactDetails 
        ? 'name phone email whatsappOptIn tags customFields lastMessageAt createdAt'
        : 'name phone email whatsappOptIn tags';
        
      groupsQuery = groupsQuery.populate({
        path: 'contacts',
        select: selectFields
      });
    }

    const groups = await groupsQuery.lean();

    return NextResponse.json({
      success: true,
      groups: groups.map(group => ({
        id: group._id,
        name: group.name,
        description: group.description,
        contacts: (includeContacts || includeContactDetails) ? (group.contacts || []).map((contact: any) => ({
          id: contact._id,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          whatsappOptIn: contact.whatsappOptIn,
          tags: contact.tags || [],
          ...(includeContactDetails && {
            customFields: contact.customFields || {},
            lastMessageAt: contact.lastMessageAt,
            createdAt: contact.createdAt
          })
        })) : group.contacts?.map((id: any) => id.toString()) || [],
        contactCount: group.contacts?.length || 0,
        color: group.color,
        createdAt: group.createdAt,
        updatedAt: group.updatedAt
      }))
    });

  } catch (error) {
    console.error('Contact groups fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch contact groups'
    }, { status: 500 });
  }
}

// ... rest of existing code ...