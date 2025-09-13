import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import SupportTicket from '@/models/SupportTicket';
import { nanoid } from 'nanoid';

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

const ticket = await SupportTicket.findOne({
  _id: params.id,
  companyId: user.companyId
})
  .populate('userId', 'name email')
  .populate('assignedTo', 'name email')
  .populate('messages.sender', 'name email')
  .lean() as any;

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

return NextResponse.json({
      success: true,
      ticket: {
        id: String(ticket._id || ''),
        ticketId: ticket.ticketId,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        status: ticket.status,
        user: ticket.userId,
        assignedTo: ticket.assignedTo,
        attachments: ticket.attachments || [],
        messages: ticket.messages || [],
        resolution: ticket.resolution,
        resolvedAt: ticket.resolvedAt,
        closedAt: ticket.closedAt,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    });

  } catch (error) {
    console.error('Ticket fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch ticket'
    }, { status: 500 });
  }
}

export async function PATCH(
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

    const { message, attachments } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({
        error: 'Message is required'
      }, { status: 400 });
    }

    const ticket = await SupportTicket.findOne({
      _id: params.id,
      companyId: user.companyId
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Add new message
    const newMessage = {
      id: nanoid(),
      sender: decoded.id,
      senderType: 'user',
      message: message.trim(),
      timestamp: new Date(),
      attachments: attachments || []
    };

    ticket.messages.push(newMessage);
    
    // Update ticket status if it was resolved/closed
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      ticket.status = 'in_progress';
      ticket.resolvedAt = undefined;
      ticket.closedAt = undefined;
    }

    await ticket.save();

    // Populate the sender info for the response
    await ticket.populate('messages.sender', 'name email');

return NextResponse.json({
      success: true,
      message: 'Message added successfully',
      ticket: {
        id: String(ticket._id || ''),
        messages: ticket.messages
      }
    });

  } catch (error) {
    console.error('Message add error:', error);
    return NextResponse.json({
      error: 'Failed to add message'
    }, { status: 500 });
  }
}