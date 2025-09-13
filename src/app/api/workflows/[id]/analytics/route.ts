import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Workflow from '@/models/Workflow';
import WorkflowEngine from '@/lib/workflowEngine';

export async function GET(
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

    const workflow = await Workflow.findOne({
      _id: params.id,
      userId: decoded.id
    });

    if (!workflow) {
      return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
    }

    const workflowEngine = WorkflowEngine.getInstance();
    const executions = workflowEngine.getAllExecutions()
      .filter(exec => exec.workflowId === params.id);

    const analytics = {
      totalExecutions: workflow.executionCount,
      successfulExecutions: workflow.successCount,
      failedExecutions: workflow.failureCount,
      successRate: workflow.executionCount > 0
        ? Math.round((workflow.successCount / workflow.executionCount) * 100)
        : 0,
      activeExecutions: executions.filter(exec => exec.status === 'running').length,
      averageExecutionTime: 0, // Would calculate from execution data
      lastTriggered: workflow.lastTriggered,
      nodeUsage: this.calculateNodeUsage(workflow, executions),
      executionHistory: executions.slice(-10) // Last 10 executions
    };

    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Error fetching workflow analytics:', error);
    return NextResponse.json({
      error: 'Failed to fetch workflow analytics'
    }, { status: 500 });
  }
}

function calculateNodeUsage(workflow: any, executions: any[]) {
  const nodeUsage: Record<string, number> = {};

  workflow.nodes.forEach((node: any) => {
    nodeUsage[node.id] = 0;
  });

  executions.forEach(execution => {
    execution.executionPath.forEach((nodeId: string) => {
      if (nodeUsage[nodeId] !== undefined) {
        nodeUsage[nodeId]++;
      }
    });
  });

  return nodeUsage;
}
