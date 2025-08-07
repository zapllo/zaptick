import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import CrmIntegration from '@/models/crmIntegrationModel';
import User from '@/models/User';

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

    // Fetch pipelines from CRM
    const response = await fetch(`${integration.crmBaseUrl}/api/integrations/zaptick/pipelines`, {
      headers: {
        'x-api-key': integration.crmApiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch pipelines from CRM" },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      pipelines: data.pipelines
    });
  } catch (error: any) {
    console.error('Error fetching CRM pipelines:', error);
    return NextResponse.json(
      { error: "Failed to fetch pipelines" },
      { status: 500 }
    );
  }
}