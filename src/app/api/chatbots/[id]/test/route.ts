import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Chatbot from '@/models/Chatbot';
import { generateChatbotResponse } from '@/lib/openai';

export async function POST(
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

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const chatbot = await Chatbot.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // Generate AI response
    const messages = [
      { role: 'system' as const, content: chatbot.systemPrompt },
      { role: 'user' as const, content: message }
    ];

    const aiResponse = await generateChatbotResponse(
      messages,
      chatbot.aiModel,
      chatbot.temperature,
      chatbot.maxTokens
    );

    return NextResponse.json({
      success: true,
      response: aiResponse.content,
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.cost,
      model: aiResponse.model
    });

  } catch (error) {
    console.error('Error testing chatbot:', error);
    return NextResponse.json({
      error: 'Failed to test chatbot'
    }, { status: 500 });
  }
}