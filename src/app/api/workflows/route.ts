import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Workflow from '@/models/Workflow';
import User from '@/models/User';
import { sendWorkflowCreationNotification } from '@/lib/notifications';

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
      return NextResponse.json({ error: 'WABA ID is required' }, { status: 400 });
    }

    const workflows = await Workflow.find({
      userId: decoded.id,
      wabaId
    }).sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      workflows
    });

  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json({
      error: 'Failed to fetch workflows'
    }, { status: 500 });
  }
}

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

    const {
      wabaId,
      name,
      description,
      nodes,
      edges,
      triggers,
      viewport
    } = await req.json();

    // Validate required fields
    if (!wabaId || !name) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Verify user has access to this WABA and get company subscription info
    const user = await User.findById(decoded.id).populate('companyId', 'subscriptionPlan subscriptionStatus');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasWabaAccess = user.wabaAccounts?.some((account: any) => account.wabaId === wabaId);
    if (!hasWabaAccess) {
      return NextResponse.json({ error: 'Access denied to this WABA' }, { status: 403 });
    }

    // Check subscription plan limits
    const company = user.companyId as any;
    const subscriptionPlan = company?.subscriptionPlan || 'free';
    const subscriptionStatus = company?.subscriptionStatus || 'expired';

    // Check if subscription is active
    if (subscriptionStatus !== 'active') {
      return NextResponse.json({
        error: 'Your subscription is not active. Please upgrade or renew your plan to create workflows.',
        code: 'SUBSCRIPTION_INACTIVE'
      }, { status: 403 });
    }

    // Define workflow limits based on subscription plan
    const planLimits = {
      free: 1, // Only 1 workflow for free plan
      starter: 3, // Up to 3 workflows for starter plan
      growth: 20, // Up to 20 workflows for growth plan  
      advanced: 50, // Up to 50 workflows for advanced plan
      enterprise: Infinity // Unlimited workflows
    };

    const currentLimit = planLimits[subscriptionPlan as keyof typeof planLimits] || planLimits.free;

    // Count existing workflows for this user and WABA
    const existingWorkflowsCount = await Workflow.countDocuments({ 
      userId: decoded.id,
      wabaId 
    });

    // Check if creating this workflow would exceed the plan limit
    if (existingWorkflowsCount >= currentLimit) {
      const planNames = {
        free: 'Free',
        starter: 'Starter',
        growth: 'Growth',
        advanced: 'Advanced',
        enterprise: 'Enterprise'
      };

      return NextResponse.json({
        error: `You've reached the workflow limit for your ${planNames[subscriptionPlan as keyof typeof planNames] || 'current'} plan. Please upgrade to create more workflows.`,
        code: 'WORKFLOW_LIMIT_REACHED',
        currentCount: existingWorkflowsCount,
        limit: currentLimit,
        plan: subscriptionPlan
      }, { status: 403 });
    }

    // Create workflow
    const workflow = await Workflow.create({
      userId: decoded.id,
      wabaId,
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      triggers: triggers || [],
      viewport: viewport || { x: 0, y: 0, zoom: 1 },
      isActive: false
    });

    // Send email notifications (async, don't wait for it)
    sendWorkflowCreationNotification(decoded.id, {
      name,
      description,
      wabaId
    }).catch(error => {
      console.error('Email notification failed:', error);
    });

    return NextResponse.json({
      success: true,
      workflow,
      workflowCount: existingWorkflowsCount + 1,
      workflowLimit: currentLimit
    });

  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json({
      error: 'Failed to create workflow'
    }, { status: 500 });
  }
}