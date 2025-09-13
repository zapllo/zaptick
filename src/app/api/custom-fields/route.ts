import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import ContactCustomField from '@/models/ContactCustomField';
import User from '@/models/User';

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

    const fields = await ContactCustomField.find({
      companyId: user.companyId,
      active: true
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      fields: fields.map(field => ({
        id: field._id,
        name: field.name,
        key: field.key,
        type: field.type,
        required: field.required,
        options: field.options,
        defaultValue: field.defaultValue,
        active: field.active,
        createdAt: field.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching custom fields:', error);
    return NextResponse.json({
      error: 'Failed to fetch custom fields'
    }, { status: 500 });
  }
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

    // Only admins can create custom fields
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { name, type, required = false, options = [], defaultValue = null } = await req.json();

    if (!name || !type) {
      return NextResponse.json({
        error: 'Name and type are required'
      }, { status: 400 });
    }

    // Generate a key from the name (lowercase, replace spaces with underscores)
    const key = name.toLowerCase().replace(/\s+/g, '_');

    // Check if field with same key already exists for this company
    const existingField = await ContactCustomField.findOne({
      companyId: user.companyId,
      key: key
    });

    if (existingField) {
      return NextResponse.json({
        error: 'A field with a similar name already exists'
      }, { status: 409 });
    }

    const field = await ContactCustomField.create({
      name,
      key,
      type,
      companyId: user.companyId,
      required,
      options: type === 'Dropdown' ? options : undefined,
      defaultValue,
      active: true
    });

    return NextResponse.json({
      success: true,
      field: {
        id: field._id,
        name: field.name,
        key: field.key,
        type: field.type,
        required: field.required,
        options: field.options,
        defaultValue: field.defaultValue,
        active: field.active,
        createdAt: field.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating custom field:', error);
    return NextResponse.json({
      error: 'Failed to create custom field'
    }, { status: 500 });
  }
}
