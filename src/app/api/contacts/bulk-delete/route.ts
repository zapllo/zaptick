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

    const { contactIds } = await req.json();

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json({
        error: 'Contact IDs are required and must be a non-empty array'
      }, { status: 400 });
    }

    // Validate that all contact IDs are strings
    if (!contactIds.every(id => typeof id === 'string' && id.trim().length > 0)) {
      return NextResponse.json({
        error: 'All contact IDs must be valid strings'
      }, { status: 400 });
    }

    // Find contacts that belong to the user and company
    const contactsToDelete = await Contact.find({
      _id: { $in: contactIds },
      userId: decoded.id,
      companyId: user.companyId
    });

    if (contactsToDelete.length === 0) {
      return NextResponse.json({
        error: 'No contacts found or you do not have permission to delete these contacts'
      }, { status: 404 });
    }

    // Check if all requested contacts were found
    if (contactsToDelete.length !== contactIds.length) {
      const foundIds = contactsToDelete.map(contact => contact._id.toString());
      const notFoundIds = contactIds.filter(id => !foundIds.includes(id));
      
      console.warn(`Some contacts not found or not accessible: ${notFoundIds.join(', ')}`);
    }

    // Delete the contacts
    const deleteResult = await Contact.deleteMany({
      _id: { $in: contactsToDelete.map(c => c._id) },
      userId: decoded.id,
      companyId: user.companyId
    });

    console.log(`Bulk delete completed: ${deleteResult.deletedCount} contacts deleted`);

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.deletedCount,
      requestedCount: contactIds.length,
      message: deleteResult.deletedCount === 1 
        ? '1 contact deleted successfully'
        : `${deleteResult.deletedCount} contacts deleted successfully`
    });

  } catch (error) {
    console.error('Bulk contact deletion error:', error);
    return NextResponse.json({
      error: 'Failed to delete contacts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}