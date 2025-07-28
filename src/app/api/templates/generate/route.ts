import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import OpenAI from 'openai';
import WalletTransaction from '@/models/WalletTransaction';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AI_CREDITS_PER_GENERATION = 5;

const TEMPLATE_GENERATION_PROMPT = `
You are an expert WhatsApp Business template creator. Based on the user's description, create a professional WhatsApp Business message template.

Guidelines:
1. WhatsApp templates must follow specific formatting rules
2. Variables are denoted as {{1}}, {{2}}, etc.
3. Keep messages concise but engaging
4. Use appropriate emojis sparingly
5. Include clear call-to-action when needed
6. Consider the business use case and tone

Template Structure:
- Header (optional): Text or media
- Body (required): Main message content
- Footer (optional): Additional info
- Buttons (optional): Call-to-action buttons

Return a JSON response with this exact structure:
{
  "name": "template_name_lowercase_with_underscores",
  "title": "Human Readable Title",
  "description": "Brief description of the template",
  "category": "MARKETING" | "UTILITY" | "AUTHENTICATION",
  "language": "en",
  "components": [
    {
      "type": "HEADER",
      "format": "TEXT",
      "text": "Header text with variables like {{1}}"
    },
    {
      "type": "BODY", 
      "text": "Main message body with variables like {{1}}, {{2}}"
    },
    {
      "type": "FOOTER",
      "text": "Footer text (optional)"
    }
  ],
  "variables": [
    {"name": "Variable Name", "example": "Example Value", "position": 1},
    {"name": "Another Variable", "example": "Another Example", "position": 2}
  ],
  "buttons": [
    {
      "type": "URL",
      "text": "Button Text",
      "url": "https://example.com"
    }
  ],
  "useCase": "When and how to use this template"
}

User Request: {USER_PROMPT}

Create a template that perfectly matches their needs.
`;

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

    // Get user and company
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const company = await Company.findById(user.companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check if company has enough AI credits
    if (company.aiCredits < AI_CREDITS_PER_GENERATION) {
      return NextResponse.json({
        error: 'Insufficient AI credits',
        message: `You need ${AI_CREDITS_PER_GENERATION} AI credits to generate a template. Current balance: ${company.aiCredits} credits.`,
        currentCredits: company.aiCredits,
        requiredCredits: AI_CREDITS_PER_GENERATION
      }, { status: 402 }); // 402 Payment Required
    }

    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length < 10) {
      return NextResponse.json({ 
        error: 'Please provide a detailed description of your template needs (minimum 10 characters)' 
      }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'AI template generation is not available. Please contact your administrator.' 
      }, { status: 503 });
    }

    // Deduct AI credits before making the API call
    company.aiCredits -= AI_CREDITS_PER_GENERATION;
    await company.save();

    // Record the transaction
    const transaction = new WalletTransaction({
      companyId: company._id,
      amount: AI_CREDITS_PER_GENERATION,
      type: "debit",
      status: "completed",
      description: "AI Template Generation",
      referenceType: "ai_generation",
      metadata: {
        userId: user._id,
        prompt: prompt.substring(0, 100), // Store first 100 chars of prompt
        creditsUsed: AI_CREDITS_PER_GENERATION
      }
    });
    await transaction.save();

    try {
      // Generate template using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: TEMPLATE_GENERATION_PROMPT.replace('{USER_PROMPT}', prompt)
          },
          {
            role: "user",
            content: `Create a WhatsApp Business template for: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Parse the JSON response
      let template;
      try {
        template = JSON.parse(response);
      } catch (parseError) {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          template = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid JSON response from AI');
        }
      }

      // Validate the template structure
      if (!template.name || !template.components || !Array.isArray(template.components)) {
        throw new Error('Invalid template structure generated');
      }

      // Ensure template name follows WhatsApp rules
      template.name = template.name.toLowerCase().replace(/[^a-z0-9_]/g, '_');

      // Add generated timestamp and ID
      template.id = `ai_generated_${Date.now()}`;
      template.generatedAt = new Date().toISOString();
      template.source = 'ai_generated';

      return NextResponse.json({
        success: true,
        template,
        prompt: prompt,
        creditsUsed: AI_CREDITS_PER_GENERATION,
        remainingCredits: company.aiCredits
      });

    } catch (aiError) {
      // If AI generation fails, refund the credits
      company.aiCredits += AI_CREDITS_PER_GENERATION;
      await company.save();

      // Update transaction status to failed
      transaction.status = 'failed';
      transaction.metadata.error = aiError instanceof Error ? aiError.message : 'Unknown error';
      await transaction.save();

      console.error('AI template generation error:', aiError);
      
      if (aiError instanceof Error) {
        if (aiError.message.includes('insufficient_quota') || aiError.message.includes('rate_limit')) {
          return NextResponse.json({
            error: 'AI service temporarily unavailable. Your credits have been refunded.'
          }, { status: 429 });
        }
        
        if (aiError.message.includes('Invalid JSON')) {
          return NextResponse.json({
            error: 'Failed to generate valid template. Your credits have been refunded. Please try rephrasing your request.'
          }, { status: 400 });
        }
      }

      return NextResponse.json({
        error: 'Failed to generate template. Your credits have been refunded. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('AI template generation error:', error);
    return NextResponse.json({
      error: 'Failed to generate template. Please try again.'
    }, { status: 500 });
  }
}