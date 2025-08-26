import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import CrmIntegration from '@/models/crmIntegrationModel';
import Contact from '@/models/Contact';
import User from '@/models/User';

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    console.log('=== ZAPTICK CREATE LEAD REQUEST ===');
    console.log('Full request body:', JSON.stringify(body, null, 2));

    const { contactId, leadData, pipelineData, wabaId } = body;

    // Detailed validation with logging
    console.log('Field validation:');
    console.log('- contactId:', contactId ? `present (${contactId})` : 'MISSING');
    console.log('- leadData:', leadData ? `present (${JSON.stringify(leadData)})` : 'MISSING');
    console.log('- pipelineData:', pipelineData ? `present (${JSON.stringify(pipelineData)})` : 'MISSING');
    console.log('- wabaId:', wabaId ? `present (${wabaId})` : 'MISSING');

    if (!contactId || !leadData || !pipelineData || !wabaId) {
      const error = {
        error: "Missing required fields in Zaptick",
        details: {
          contactId: !contactId ? 'missing' : 'present',
          leadData: !leadData ? 'missing' : 'present',
          pipelineData: !pipelineData ? 'missing' : 'present',
          wabaId: !wabaId ? 'missing' : 'present'
        },
        receivedBody: body
      };
      console.log('VALIDATION FAILED:', error);
      return NextResponse.json(error, { status: 400 });
    }

    // Validate leadData required fields
    if (!leadData.title || !leadData.stage) {
      const error = {
        error: "Missing required lead fields in Zaptick",
        details: {
          title: !leadData.title ? 'missing' : `present (${leadData.title})`,
          stage: !leadData.stage ? 'missing' : `present (${leadData.stage})`
        },
        receivedLeadData: leadData
      };
      console.log('LEAD DATA VALIDATION FAILED:', error);
      return NextResponse.json(error, { status: 400 });
    }

    // Validate pipelineData required fields
    if (!pipelineData.name) {
      const error = {
        error: "Missing pipeline name in Zaptick",
        receivedPipelineData: pipelineData
      };
      console.log('PIPELINE DATA VALIDATION FAILED:', error);
      return NextResponse.json(error, { status: 400 });
    }

    // Verify user has access to this WABA
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasWabaAccess = user.wabaAccounts?.some((account: any) => account.wabaId === wabaId);
    if (!hasWabaAccess) {
      return NextResponse.json({ error: 'Access denied to this WABA' }, { status: 403 });
    }

    // Get CRM integration
    const integration = await CrmIntegration.findOne({
      userId: decoded.id,
      wabaId,
      isActive: true
    });

    if (!integration) {
      return NextResponse.json(
        { error: "CRM integration not configured" },
        { status: 404 }
      );
    }

    console.log('Integration found:', {
      id: integration._id,
      crmBaseUrl: integration.crmBaseUrl,
      hasApiKey: !!integration.crmApiKey
    });

    // Get contact details
    const contact = await Contact.findOne({
      _id: contactId,
      userId: decoded.id,
      wabaId: wabaId
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contact not found" },
        { status: 404 }
      );
    }

    console.log('Contact found:', {
      id: contact._id,
      name: contact.name,
      phone: contact.phone,
      email: contact.email
    });

    // Ensure we have a valid closeDate
    let closeDate = leadData.closeDate;
    if (!closeDate) {
      closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (typeof closeDate === 'string' && !closeDate.includes('T')) {
      closeDate = new Date(closeDate + 'T12:00:00.000Z').toISOString();
    }

    // Prepare data for CRM - ensure all required fields are present
    const crmData = {
      leadData: {
        title: leadData.title,
        description: leadData.description || `Lead created from Zaptick WhatsApp conversation with ${contact.name}`,
        amount: leadData.amount || 0,
        stage: leadData.stage,
        closeDate: closeDate,
        remarks: leadData.remarks || `Lead created from Zaptick WhatsApp conversation with ${contact.name}. Original contact phone: ${contact.phone}`,
        // Remove the source field entirely - let CRM handle it or set it to null
        source: null, // Changed from leadData.source || 'Zaptick'
        assignedTo: null,
        customFieldValues: {}
      },
      contactData: {
        name: contact.name,
        phone: contact.phone,
        email: contact.email || '',
        countryCode: contact.countryCode || '',
        customFields: contact.customFields || {},
        tags: contact.tags || []
      },
      pipelineData: {
        name: pipelineData.name,
        openStages: pipelineData.openStages || [],
        closeStages: pipelineData.closeStages || []
      },
      sourceMetadata: {
        platform: 'Zaptick',
        wabaId: wabaId,
        contactId: contactId,
        createdBy: decoded.id,
        // Add source information here instead
        sourceName: 'Zaptick'
      }
    };

    console.log('=== SENDING TO CRM ===');
    console.log('URL:', `${integration.crmBaseUrl}/api/webhooks/zaptick-leads`);
    console.log('Data being sent:', JSON.stringify(crmData, null, 2));

    // Send to CRM
    const response = await fetch(`${integration.crmBaseUrl}/api/webhooks/zaptick-leads`, {
      method: 'POST',
      headers: {
        'x-api-key': integration.crmApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(crmData)
    });

    const responseText = await response.text();
    console.log('=== CRM RESPONSE ===');
    console.log('Status:', response.status);
    console.log('Response text:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: responseText };
      }

      console.error('CRM Error Response:', errorData);
      return NextResponse.json(
        {
          error: errorData.error || "Failed to create lead in CRM",
          details: errorData.details || errorData,
          crmResponse: responseText,
          status: response.status
        },
        { status: response.status }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { message: 'Lead created but response parsing failed', rawResponse: responseText };
    }

    // Update integration last sync time
    await CrmIntegration.findByIdAndUpdate(integration._id, {
      lastSyncAt: new Date()
    });

    console.log('=== SUCCESS ===');
    console.log('Lead created successfully');

    return NextResponse.json({
      success: true,
      message: "Lead created successfully in CRM",
      leadDetails: result.lead,
      contactDetails: result.contact
    });

  } catch (error: any) {
    console.error('=== ERROR IN ZAPTICK CREATE LEAD ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    return NextResponse.json(
      {
        error: "Failed to create lead in CRM",
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}