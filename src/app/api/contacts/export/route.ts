import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Contact from '@/models/Contact';
import Papa from 'papaparse'; // Import the entire Papa object

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

    if (!wabaId) {
      return NextResponse.json({ error: 'WABA ID is required' }, { status: 400 });
    }

    // Build query
    const query: any = {
      userId: decoded.id,
      wabaId,
      isActive: true
    };

    // Get contacts
    const contacts = await Contact.find(query).lean();

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts found to export' }, { status: 404 });
    }

    // Transform contacts for CSV
    const contactsForExport = contacts.map(contact => ({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      whatsappOptIn: contact.whatsappOptIn,
      tags: contact.tags.join(','),
      notes: contact.notes || '',
      createdAt: new Date(contact.createdAt).toISOString().split('T')[0],
      lastMessageAt: contact.lastMessageAt ? new Date(contact.lastMessageAt).toISOString().split('T')[0] : ''
    }));

    // Generate CSV using unparse instead of stringify
    const csv = Papa.unparse(contactsForExport, {
      header: true
    });

    // Create filename based on date
    const date = new Date().toISOString().split('T')[0];
    const filename = `contacts_export_${date}.csv`;

    // Set headers for file download
    const headers = {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    };

    return new NextResponse(csv, { headers });

  } catch (error) {
    console.error('Contact export error:', error);
    return NextResponse.json({
      error: 'Failed to export contacts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
