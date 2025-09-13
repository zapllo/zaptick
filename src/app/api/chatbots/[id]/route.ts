import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Chatbot from '@/models/Chatbot';

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
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const chatbot = await Chatbot.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      chatbot
    });

  } catch (error) {
    console.error('Error fetching chatbot:', error);
    return NextResponse.json({
      error: 'Failed to fetch chatbot'
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
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const updateData = await req.json();

    const chatbot = await Chatbot.findOneAndUpdate(
      {
        _id: params.id,
        userId: decoded.id
      },
      updateData,
      { new: true }
    );

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      chatbot
    });

  } catch (error) {
    console.error('Error updating chatbot:', error);
    return NextResponse.json({
      error: 'Failed to update chatbot'
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
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    const chatbot = await Chatbot.findOneAndDelete({
      _id: params.id,
      userId: decoded.id
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Chatbot deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chatbot:', error);
    return NextResponse.json({
      error: 'Failed to delete chatbot'
    }, { status: 500 });
  }
}