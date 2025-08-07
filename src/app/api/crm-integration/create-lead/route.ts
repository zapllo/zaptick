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

    const { contactId, leadData, pipelineData, wabaId } = await req.json();

    // Debug: Log the received data
    console.log('Received data:', {
      contactId: contactId ? 'present' : 'missing',
      leadData: leadData ? Object.keys(leadData) : 'missing',
      pipelineData: pipelineData ? Object.keys(pipelineData) : 'missing',
      wabaId: wabaId ? 'present' : 'missing'
    });

    if (!contactId || !leadData || !pipelineData || !wabaId) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          details: {
            contactId: !contactId ? 'missing' : 'present',
            leadData: !leadData ? 'missing' : 'present',
            pipelineData: !pipelineData ? 'missing' : 'present',
            wabaId: !wabaId ? 'missing' : 'present'
          }
        },
        { status: 400 }
      );
    }

    // Validate leadData required fields
    if (!leadData.title || !leadData.stage) {
      return NextResponse.json(
        { 
          error: "Missing required lead fields",
          details: {
            title: !leadData.title ? 'missing' : 'present',
            stage: !leadData.stage ? 'missing' : 'present'
          }
        },
        { status: 400 }
      );
    }

    // Validate pipelineData required fields
    if (!pipelineData.name) {
      return NextResponse.json(
        { 
          error: "Missing pipeline name",
          received: pipelineData
        },
        { status: 400 }
      );
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

    // Ensure we have a valid closeDate
    let closeDate = leadData.closeDate;
    if (!closeDate) {
      // Default to 30 days from now
      closeDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    } else if (typeof closeDate === 'string' && !closeDate.includes('T')) {
      // If it's just a date string, convert to full ISO string
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
        source: leadData.source || 'WhatsApp - Zaptick',
        // Add any other fields that might be required by the CRM
        assignedTo: null, // Will be handled by CRM to assign to admin user
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
      // Add metadata about the source
      sourceMetadata: {
        platform: 'Zaptick',
        wabaId: wabaId,
        contactId: contactId,
        createdBy: decoded.id
      }
    };

    console.log('Sending to CRM:', {
      url: `${integration.crmBaseUrl}/api/webhooks/zaptick-leads`,
      hasApiKey: !!integration.crmApiKey,
      leadTitle: crmData.leadData.title,
      contactName: crmData.contactData.name,
      pipelineName: crmData.pipelineData.name
    });

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
    console.log('CRM Response:', response.status, responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { error: responseText };
      }
      
      console.error('CRM Error:', errorData);
      return NextResponse.json(
        { 
          error: errorData.error || "Failed to create lead in CRM",
          details: errorData.details || responseText,
          status: response.status
        },
        { status: response.status }
      );
    }

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { message: 'Lead created but response parsing failed' };
    }

    // Update integration last sync time
    await CrmIntegration.findByIdAndUpdate(integration._id, {
      lastSyncAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: "Lead created successfully in CRM",
      leadDetails: result.lead,
      contactDetails: result.contact
    });
    
  } catch (error: any) {
    console.error('Error creating lead in CRM:', error);
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