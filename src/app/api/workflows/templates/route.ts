import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { workflowTemplates } from '@/lib/workflowTemplates';

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

    return NextResponse.json({
      success: true,
      templates: workflowTemplates
    });

  } catch (error) {
    console.error('Error fetching workflow templates:', error);
    return NextResponse.json({
      error: 'Failed to fetch workflow templates'
    }, { status: 500 });
  }
}
