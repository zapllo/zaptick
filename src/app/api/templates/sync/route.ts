import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Template from '@/models/Template';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;


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

    const body = await req.json();
    const { wabaId } = body;

    // Find the WABA account
    const wabaAccount = user.wabaAccounts.find((account: any) => account.wabaId === wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: 'WABA account not found' }, { status: 404 });
    }





    // Get templates from WhatsApp API
    const whatsappResponse = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${wabaId}/message_templates?fields=id,name,status,category,language,quality_score,rejection_reason`,
      {
        method: 'GET',
        headers: {
          'x-access-token': INT_TOKEN || '',
          'x-waba-id': wabaId,
          'Content-Type': 'application/json'
        } as HeadersInit
      }
    );

    const responseText = await whatsappResponse.text();
    console.log('WhatsApp templates response:', responseText);

    let whatsappData;
    try {
      whatsappData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse WhatsApp response as JSON:', parseError);
      return NextResponse.json({
        error: 'Invalid response from WhatsApp API',
        details: responseText
      }, { status: 400 });
    }

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', whatsappData);
      return NextResponse.json({
        error: 'Failed to fetch templates from WhatsApp',
        details: whatsappData
      }, { status: 400 });
    }

    // Update local templates with WhatsApp status
    const updatedTemplates = [];
    const whatsappTemplates = whatsappData.data || [];

    for (const whatsappTemplate of whatsappTemplates) {
      const localTemplate = await Template.findOne({
        whatsappTemplateId: whatsappTemplate.id,
        userId: decoded.id,
        wabaId: wabaId
      });

      if (localTemplate) {
        const oldStatus = localTemplate.status;
        const newStatus = whatsappTemplate.status.toUpperCase();

        // Update template status and other fields
        localTemplate.status = newStatus;

        if (newStatus === 'APPROVED' && oldStatus !== 'APPROVED') {
          localTemplate.approvedAt = new Date();
        }

        if (newStatus === 'REJECTED') {
          localTemplate.rejectionReason = whatsappTemplate.rejection_reason || 'Template was rejected by WhatsApp';
        }

        await localTemplate.save();

        updatedTemplates.push({
          id: localTemplate._id,
          name: localTemplate.name,
          oldStatus: oldStatus.toLowerCase(),
          newStatus: newStatus.toLowerCase(),
          whatsappTemplateId: whatsappTemplate.id
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updatedTemplates.length} templates`,
      updatedTemplates
    });

  } catch (error) {
    console.error('Template sync error:', error);
    return NextResponse.json({
      error: 'Failed to sync templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
