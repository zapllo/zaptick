import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Template from "@/models/Template";
import { NextRequest, NextResponse } from "next/server";

// api/templates/deleted/route.ts
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const wabaId = searchParams.get('wabaId');

    // Build query for deleted templates
    const query: any = {
      userId: decoded.id,
      status: 'DELETED'
    };

    if (category && category !== 'All') query.category = category.toUpperCase();
    if (wabaId) query.wabaId = wabaId;

    const templates = await Template.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      templates: templates.map(template => {
        const hasMediaHeader = template.components.some((c: any) => c.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format));
        return {
          id: template._id,
          name: template.name,
          category: template.category.toLowerCase(),
          language: template.language,
          status: template.status.toLowerCase(),
          content: template.components.find((c: any) => c.type === 'BODY')?.text || '',
          variables: template.components
            .find((c: any) => c.type === 'BODY')?.text
            ?.match(/\{\{(\d+)\}\}/g)?.length || 0,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt,
          approvedAt: template.approvedAt,
          lastUsed: template.lastUsed,
          useCount: template.useCount,
          rejectionReason: template.rejectionReason,
          type: hasMediaHeader ? 'media' : 'text',
          mediaType: hasMediaHeader ? template.components.find((c: any) => c.type === 'HEADER')?.format : null,
          createdBy: template.createdBy || "Unknown"
        };
      })
    });

  } catch (error) {
    console.error('Deleted templates fetch error:', error);
    return NextResponse.json({
      error: 'Failed to fetch deleted templates'
    }, { status: 500 });
  }
}
