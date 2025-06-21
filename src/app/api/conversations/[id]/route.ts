import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Contact from '@/models/Contact';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching conversation with ID:', params.id);

    const token = req.cookies.get('token')?.value;
    console.log('Has Token:', !!token);

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // Find the conversation and populate the contact data
    const conversation = await Conversation.findById(params.id);
    if (!conversation) {
      console.error('Conversation not found with ID:', params.id);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get the associated contact
    const contact = await Contact.findById(conversation.contactId);
    if (!contact) {
      console.error('Contact not found for conversation:', params.id);
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Format the response
    const formattedConversation = {
      id: conversation._id.toString(),
      contact: {
        id: contact._id.toString(),
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        whatsappOptIn: contact.whatsappOptIn,
        tags: contact.tags || [],
        notes: contact.notes,
        wabaId: contact.wabaId,
        phoneNumberId: contact.phoneNumberId,
        userId: contact.userId.toString(),
        isActive: contact.isActive,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      },
      messages: conversation.messages || [],
      lastMessage: conversation.lastMessage,
      lastMessageType: conversation.lastMessageType,
      lastMessageAt: conversation.lastMessageAt,
      status: conversation.status,
      assignedTo: conversation.assignedTo,
      unreadCount: conversation.unreadCount || 0,
      tags: conversation.tags || [],
      labels: conversation.labels || [],
      isWithin24Hours: conversation.isWithin24Hours,
      messageCount: conversation.messages ? conversation.messages.length : 0,
      wabaId: conversation.wabaId,
      phoneNumberId: conversation.phoneNumberId,
      userId: conversation.userId.toString(),
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    };

    return NextResponse.json({
      success: true,
      conversation: formattedConversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json({
      error: 'Failed to fetch conversation',
      details: error instanceof Error ? error.message : 'Unknown error'
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

    // Find and delete the conversation
    const conversation = await Conversation.findOneAndDelete({
      _id: params.id,
      userId: decoded.id
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json({
      error: 'Failed to delete conversation'
    }, { status: 500 });
  }
}
