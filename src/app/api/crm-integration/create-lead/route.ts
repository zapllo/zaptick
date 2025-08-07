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

    if (!contactId || !leadData || !pipelineData || !wabaId) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Prepare data for CRM
    const crmData = {
      leadData: {
        title: leadData.title,
        description: leadData.description,
        amount: leadData.amount,
        stage: leadData.stage,
        closeDate: leadData.closeDate,
        remarks: leadData.remarks || `Lead created from Zaptick WhatsApp conversation with ${contact.name}`,
        source: leadData.source || 'WhatsApp - Zaptick'
      },
      contactData: {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        countryCode: contact.countryCode,
        customFields: contact.customFields,
        tags: contact.tags
      },
      pipelineData: {
        name: pipelineData.name,
        openStages: pipelineData.openStages,
        closeStages: pipelineData.closeStages
      }
    };

    // Send to CRM
    const response = await fetch(`${integration.crmBaseUrl}/api/webhooks/zaptick-leads`, {
      method: 'POST',
      headers: {
        'x-api-key': integration.crmApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(crmData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error || "Failed to create lead in CRM" },
        { status: response.status }
      );
    }

    const result = await response.json();

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
      { error: "Failed to create lead in CRM" },
      { status: 500 }
    );
  }
}