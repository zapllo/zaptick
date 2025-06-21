import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import ContactCustomField from '@/models/ContactCustomField';
import User from '@/models/User';

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

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const field = await ContactCustomField.findOne({
      _id: params.id,
      companyId: user.companyId
    });

    if (!field) {
      return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
    }

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
    console.error('Error fetching custom field:', error);
    return NextResponse.json({
      error: 'Failed to fetch custom field'
    }, { status: 500 });
  }
}

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

    // Only admins can update custom fields
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const { name, type, required = false, options = [], defaultValue = null } = await req.json();

    if (!name || !type) {
      return NextResponse.json({
        error: 'Name and type are required'
      }, { status: 400 });
    }

    const field = await ContactCustomField.findOne({
      _id: params.id,
      companyId: user.companyId
    });

    if (!field) {
      return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
    }

    // Update the field
    field.name = name;
    field.type = type;
    field.required = required;
    field.options = type === 'Dropdown' ? options : undefined;
    field.defaultValue = defaultValue;

    await field.save();

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
    console.error('Error updating custom field:', error);
    return NextResponse.json({
      error: 'Failed to update custom field'
    }, { status: 500 });
  }
}

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

    // Only admins can delete custom fields
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    const field = await ContactCustomField.findOne({
      _id: params.id,
      companyId: user.companyId
    });

    if (!field) {
      return NextResponse.json({ error: 'Custom field not found' }, { status: 404 });
    }

    // Instead of deleting, mark as inactive
    field.active = false;
    await field.save();

    return NextResponse.json({
      success: true,
      message: 'Custom field deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom field:', error);
    return NextResponse.json({
      error: 'Failed to delete custom field'
    }, { status: 500 });
  }
}
