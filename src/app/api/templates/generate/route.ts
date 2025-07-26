import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
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
      // If parsing fails, try to extract JSON from the response
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
      prompt: prompt
    });

  } catch (error) {
    console.error('AI template generation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('insufficient_quota') || error.message.includes('rate_limit')) {
        return NextResponse.json({
          error: 'AI service temporarily unavailable. Please try again later.'
        }, { status: 429 });
      }
      
      if (error.message.includes('Invalid JSON')) {
        return NextResponse.json({
          error: 'Failed to generate valid template. Please try rephrasing your request.'
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      error: 'Failed to generate template. Please try again.'
    }, { status: 500 });
  }
}