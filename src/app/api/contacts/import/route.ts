import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Contact from '@/models/Contact';
import ContactCustomField from '@/models/ContactCustomField';
import { parse } from 'papaparse';
import { sendContactImportNotification } from '@/lib/notifications';

// Helper function to format phone number with country code
function formatPhoneWithCountryCode(phone: string, countryCode?: string): { formattedPhone: string; finalCountryCode: string } {
  // Clean the phone number
  let cleanPhone = phone.replace(/\D/g, ''); // Remove all non-digits
  
  // Default country code
  let finalCountryCode = countryCode || '91'; // Default to India (+91)
  
  // Remove + from country code if present
  if (finalCountryCode.startsWith('+')) {
    finalCountryCode = finalCountryCode.substring(1);
  }
  
  // Check if phone already has a country code
  if (phone.startsWith('+')) {
    // Phone already has country code, extract it
    const match = phone.match(/^\+(\d{1,4})/);
    if (match) {
      finalCountryCode = match[1];
      cleanPhone = phone.replace(/^\+\d{1,4}/, '').replace(/\D/g, '');
    }
  } else if (cleanPhone.length > 10) {
    // Phone might already include country code without +
    // Common country codes and their lengths
    const countryCodes = [
      { code: '1', length: 11 }, // US/Canada: 1 + 10 digits
      { code: '91', length: 12 }, // India: 91 + 10 digits
      { code: '44', length: 12 }, // UK: 44 + 10 digits
      { code: '86', length: 13 }, // China: 86 + 11 digits
    ];
    
    for (const cc of countryCodes) {
      if (cleanPhone.length === cc.length && cleanPhone.startsWith(cc.code)) {
        finalCountryCode = cc.code;
        cleanPhone = cleanPhone.substring(cc.code.length);
        break;
      }
    }
  }
  
  // Format the final phone number
  const formattedPhone = `+${finalCountryCode}${cleanPhone}`;
  
  return { formattedPhone, finalCountryCode: `+${finalCountryCode}` };
}

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
    const fieldMappings = formData.get('fieldMappings') as string;
    const skipFirstRow = formData.get('skipFirstRow') === 'true';

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

    // Get company's custom fields
    const customFields = await ContactCustomField.find({
      companyId: user.companyId,
      active: true
    });

    // Parse CSV content
    const { data, errors, meta } = parse(fileContent, {
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

    // If we're just analyzing the file to get headers
    const isAnalyze = formData.get('analyze') === 'true';
    if (isAnalyze) {
      // Return the headers and a sample of the data
      return NextResponse.json({
        success: true,
        headers: meta.fields || [],
        sampleData: data.slice(0, 3),
        totalRows: data.length
      });
    }

    // Parse field mappings JSON
    let mappings: Record<string, string> = {};
    try {
      mappings = fieldMappings ? JSON.parse(fieldMappings) : {};
    } catch (error) {
      return NextResponse.json({
        error: 'Invalid field mappings format',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }

    // Check for required fields mapping
    if (!mappings.name || !mappings.phone) {
      return NextResponse.json({
        error: 'Required field mappings missing',
        details: 'Name and phone field mappings are required'
      }, { status: 400 });
    }

    // Process contacts
    const importResults = {
      total: data.length,
      imported: 0,
      skipped: 0,
      errors: 0,
      errorDetails: [] as { row: number; error: string }[]
    };

    // Skip first row if requested (in case headers were included even with header:true)
    const rowsToProcess = skipFirstRow ? data.slice(1) : data;

    for (let i = 0; i < rowsToProcess.length; i++) {
      try {
        const row = rowsToProcess[i] as Record<string, string>;

        // Apply field mappings
        const name = row[mappings.name]?.trim();
        const rawPhone = row[mappings.phone]?.trim();
        const email = mappings.email ? row[mappings.email]?.trim() : undefined;
        const rawCountryCode = mappings.countryCode ? row[mappings.countryCode]?.trim() : undefined;
        const notes = mappings.notes ? row[mappings.notes]?.trim() : undefined;

        // Validate required fields
        if (!name || !rawPhone) {
          importResults.errors++;
          importResults.errorDetails.push({
            row: i + (skipFirstRow ? 2 : 1), // Add 1 for 0-index, add another 1 if skipping first row
            error: `Missing required fields (name: ${name}, phone: ${rawPhone})`
          });
          continue;
        }

        // Format phone number with country code
        const { formattedPhone, finalCountryCode } = formatPhoneWithCountryCode(rawPhone, rawCountryCode);
        
        console.log(`Row ${i + 1}: Raw phone: ${rawPhone}, Country code: ${rawCountryCode}, Formatted: ${formattedPhone}, Final CC: ${finalCountryCode}`);

        // Get whatsappOptIn value (default to true if not specified)
        let whatsappOptIn = true;
        if (mappings.whatsappOptIn && row[mappings.whatsappOptIn]) {
          const optInValue = row[mappings.whatsappOptIn].toLowerCase();
          whatsappOptIn = !(optInValue === 'false' || optInValue === 'no' || optInValue === '0' || optInValue === 'n');
        }

        // Get tags
        let tags: string[] = [];
        if (mappings.tags && row[mappings.tags]) {
          tags = row[mappings.tags].split(',').map((tag: string) => tag.trim()).filter(Boolean);
        }

        // Extract custom fields from mappings
        const customFieldsData: Record<string, any> = {};
        Object.entries(mappings).forEach(([targetField, sourceField]) => {
          if (targetField.startsWith('customField.')) {
            const fieldKey = targetField.replace('customField.', '');
            const customField = customFields.find(cf => cf.key === fieldKey);

            if (customField && sourceField && row[sourceField]) {
              let value = row[sourceField].trim();

              // Convert types based on custom field definition
              if (customField.type === 'Number' && value) {
                value = Number(value);
              }

              customFieldsData[fieldKey] = value;
            }
          }
        });

        // Check if contact already exists (using formatted phone)
        const existingContact = await Contact.findOne({
          phone: formattedPhone,
          wabaId,
          companyId: user.companyId
        });

        if (existingContact) {
          importResults.skipped++;
          continue;
        }

        // Create new contact with formatted phone number
        const contact = new Contact({
          name,
          phone: formattedPhone,
          email,
          countryCode: finalCountryCode,
          wabaId,
          phoneNumberId: wabaAccount.phoneNumberId,
          userId: decoded.id,
          companyId: user.companyId,
          tags,
          notes,
          whatsappOptIn,
          customFields: Object.keys(customFieldsData).length > 0 ? customFieldsData : undefined
        });

        await contact.save();
        importResults.imported++;
      } catch (error) {
        console.error('Error importing contact:', error);
        importResults.errors++;
        importResults.errorDetails.push({
          row: i + (skipFirstRow ? 2 : 1),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Send email notification (async, don't wait for it)
    sendContactImportNotification(decoded.id, {
      total: importResults.total,
      imported: importResults.imported,
      skipped: importResults.skipped,
      errors: importResults.errors,
      wabaId
    }).catch(error => {
      console.error('Email notification failed:', error);
    });

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

// New endpoint to get available fields for mapping
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

    // Get custom fields
    const customFields = await ContactCustomField.find({
      companyId: user.companyId,
      active: true
    });

    // Prepare available fields for mapping
    const availableFields = [
      { key: 'name', label: 'Name', required: true },
      { key: 'phone', label: 'Phone Number', required: true },
      { key: 'email', label: 'Email Address', required: false },
      { key: 'countryCode', label: 'Country Code', required: false },
      { key: 'tags', label: 'Tags (comma separated)', required: false },
      { key: 'notes', label: 'Notes', required: false },
      { key: 'whatsappOptIn', label: 'WhatsApp Opt-In (true/false)', required: false },
      // Add custom fields
      ...customFields.map(field => ({
        key: `customField.${field.key}`,
        label: field.name,
        required: field.required,
        type: field.type
      }))
    ];

    return NextResponse.json({
      success: true,
      fields: availableFields
    });

  } catch (error) {
    console.error('Error fetching import fields:', error);
    return NextResponse.json({
      error: 'Failed to fetch import fields',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}