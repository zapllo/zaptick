import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import Workflow from '@/models/Workflow';

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

    const exportData = {
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      triggers: workflow.triggers,
      exportedAt: new Date().toISOString(),
      version: workflow.version
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.json"`
      }
    });

  } catch (error) {
    console.error('Error exporting workflow:', error);
    return NextResponse.json({
      error: 'Failed to export workflow'
    }, { status: 500 });
  }
}
