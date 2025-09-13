import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import Template from "@/models/Template";
import { NextRequest, NextResponse } from "next/server";

// api/templates/[id]/restore/route.ts
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const templateId = params.id;

    // Find the template and ensure it belongs to this user
    const template = await Template.findOne({
      _id: templateId,
      userId: decoded.id,
      status: 'DELETED'
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found or not deleted' }, { status: 404 });
    }


    await template.save();

    return NextResponse.json({
      success: true,
      message: 'Template restored successfully'
    });
  } catch (error) {
    console.error('Template restore error:', error);
    return NextResponse.json({
      error: 'Failed to restore template',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
