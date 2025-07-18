import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import SupportTicket from '@/models/SupportTicket';
import { nanoid } from 'nanoid';

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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    // Build query
    const query: any = {
      companyId: user.companyId
    };

    if (status && status !== 'all') query.status = status;
    if (category && category !== 'all') query.category = category;
    if (priority && priority !== 'all') query.priority = priority;

    const tickets = await SupportTicket.find(query)
      .populate('userId', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      tickets: tickets.map(ticket => ({
        id: ticket._id,
        ticketId: ticket.ticketId,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        status: ticket.status,
        user: ticket.userId,
        assignedTo: ticket.assignedTo,
        attachments: ticket.attachments || [],
        messageCount: ticket.messages?.length || 0,
        resolution: ticket.resolution,
        resolvedAt: ticket.resolvedAt,
        closedAt: ticket.closedAt,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }))
    });

  } catch (error) {
    console.error('Tickets fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch tickets'
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

    const { title, description, priority, category, attachments } = await req.json();

    if (!title || !description || !category) {
      return NextResponse.json({
        error: 'Missing required fields: title, description, category'
      }, { status: 400 });
    }

    // Generate short ticket ID - TKT-12, TKT-13, etc.
    const ticketCount = await SupportTicket.countDocuments({});
    const ticketId = `TKT-${ticketCount + 1}`;

    // Create initial message
    const initialMessage = {
      id: nanoid(),
      sender: decoded.id,
      senderType: 'user' as const,
      message: description,
      timestamp: new Date(),
      attachments: attachments || []
    };

    const ticket = new SupportTicket({
      ticketId,
      title: title.trim(),
      description: description.trim(),
      priority: priority || 'medium',
      category,
      userId: decoded.id,
      companyId: user.companyId,
      status: 'open',
      attachments: attachments || [],
      messages: [initialMessage]
    });

    await ticket.save();

    // Populate user data for response
    await ticket.populate('userId', 'name email');

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        status: ticket.status,
        user: ticket.userId,
        attachments: ticket.attachments || [],
        messageCount: ticket.messages?.length || 0,
        createdAt: ticket.createdAt
      }
    });

  } catch (error) {
    console.error('Ticket creation error:', error);
    return NextResponse.json({
      error: 'Failed to create ticket',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}