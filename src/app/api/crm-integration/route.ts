import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import CrmIntegration from '@/models/crmIntegrationModel';
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

    const { crmApiKey, wabaId } = await req.json();

    if (!crmApiKey || !wabaId) {
      return NextResponse.json(
        { error: "CRM API Key and WABA ID are required" },
        { status: 400 }
      );
    }

    // Get user and company info
    const user = await User.findById(decoded.id).populate('companyId');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user has access to this WABA
    const hasWabaAccess = user.wabaAccounts?.some((account: any) => account.wabaId === wabaId);
    if (!hasWabaAccess) {
      return NextResponse.json({ error: 'Access denied to this WABA' }, { status: 403 });
    }

    // Test the API key by making a request to CRM
    try {
      const testResponse = await fetch('https://crm.zapllo.com/api/integrations/zaptick/pipelines', {
        headers: {
          'x-api-key': crmApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!testResponse.ok) {
        return NextResponse.json(
          { error: "Invalid CRM API Key" },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to connect to CRM. Please check your API key." },
        { status: 400 }
      );
    }

    // Save or update integration
    const integration = await CrmIntegration.findOneAndUpdate(
      { userId: decoded.id, wabaId },
      {
        userId: decoded.id,
        companyId: user.companyId,
        wabaId,
        crmApiKey,
        crmBaseUrl: 'https://crm.zapllo.com',
        isActive: true
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "CRM integration configured successfully",
      integration: {
        id: integration._id,
        isActive: integration.isActive
      }
    });
  } catch (error: any) {
    console.error('Error configuring CRM integration:', error);
    return NextResponse.json(
      { error: "Failed to configure CRM integration" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const wabaId = searchParams.get('wabaId');

    if (!wabaId) {
      return NextResponse.json({ error: "WABA ID required" }, { status: 400 });
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

    const integration = await CrmIntegration.findOne({ userId: decoded.id, wabaId });

    return NextResponse.json({
      success: true,
      integration: integration ? {
        id: integration._id,
        isActive: integration.isActive,
        lastSyncAt: integration.lastSyncAt,
        hasApiKey: !!integration.crmApiKey
      } : null
    });
  } catch (error) {
    console.error('Error fetching CRM integration:', error);
    return NextResponse.json(
      { error: "Failed to fetch CRM integration" },
      { status: 500 }
    );
  }
}