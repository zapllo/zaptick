import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import { parse } from 'papaparse';

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

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const wabaId = formData.get('wabaId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!wabaId) {
      return NextResponse.json({ error: 'WABA ID is required' }, { status: 400 });
    }

    // Find the WABA account
    const wabaAccount = user.wabaAccounts.find((account: any) => account.wabaId === wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: 'WABA account not found' }, { status: 404 });
    }

    // Read file content as text
    const fileContent = await file.text();

    // Parse CSV content
    const { data, errors } = parse(fileContent, {
      header: true,
      skipEmptyLines: true
    });

    if (errors.length > 0) {
      return NextResponse.json({
        error: 'CSV parsing error',
        details: errors
      }, { status: 400 });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json({ error: 'No contacts found in file' }, { status: 400 });
    }

    // Validate required fields
    const invalidRows = data.filter((row: unknown) => {
      const typedRow = row as { [key: string]: string };
      return !typedRow.name || !typedRow.phone;
    });
    if (invalidRows.length > 0) {
      return NextResponse.json({
        error: 'Invalid data in CSV',
        details: `${invalidRows.length} rows missing required fields (name, phone)`
      }, { status: 400 });
    }

    // Process contacts
    const importResults = {
      total: data.length,
      imported: 0,
      skipped: 0,
      errors: 0
    };

    for (const row of data as Array<{ [key: string]: string }>) {
      try {
        // Check if contact already exists
        const existingContact = await Contact.findOne({
          phone: row.phone.trim(),
          wabaId
        });

        if (existingContact) {
          importResults.skipped++;
          continue;
        }

        // Prepare tags
        let tags: string[] = [];
        if (row.tags) {
          tags = row.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
        }

        // Create new contact
        const contact = new Contact({
          name: row.name.trim(),
          phone: row.phone.trim(),
          email: row.email?.trim(),
          wabaId,
          phoneNumberId: wabaAccount.phoneNumberId,
          userId: decoded.id,
          tags,
          notes: row.notes?.trim(),
          whatsappOptIn: row.whatsappOptIn === 'false' ? false : true
        });

        await contact.save();
        importResults.imported++;
      } catch (error) {
        console.error('Error importing contact:', error);
        importResults.errors++;
      }
    }

    return NextResponse.json({
      success: true,
      results: importResults
    });

  } catch (error) {
    console.error('Contact import error:', error);
    return NextResponse.json({
      error: 'Failed to import contacts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
