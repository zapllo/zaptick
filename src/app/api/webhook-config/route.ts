import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import WebhookConfig from "@/models/WebhookConfig";
import { v4 as uuidv4 } from 'uuid';

// Get webhook configuration
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const wabaId = searchParams.get("wabaId");

    if (!wabaId) {
      return NextResponse.json({ error: "WABA ID is required" }, { status: 400 });
    }

    // Verify user has access to this WABA
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wabaAccount = user.wabaAccounts?.find((acc: any) => acc.wabaId === wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: "WABA not found" }, { status: 404 });
    }

    // Get webhook configuration
    const webhookConfig = await WebhookConfig.findOne({
      userId: decoded.id,
      wabaId
    });

    return NextResponse.json({
      success: true,
      config: webhookConfig
    });

  } catch (error) {
    console.error("Get webhook config error:", error);
    return NextResponse.json(
      { error: "Failed to get webhook configuration" },
      { status: 500 }
    );
  }
}

// Create or update webhook configuration
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const data = await req.json();
    const { wabaId, webhookUrl, secretKey, events } = data;

    if (!wabaId || !webhookUrl || !secretKey) {
      return NextResponse.json(
        { error: "WABA ID, webhook URL, and secret key are required" },
        { status: 400 }
      );
    }

    // Verify user has access to this WABA
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const wabaAccount = user.wabaAccounts?.find((acc: any) => acc.wabaId === wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: "WABA not found" }, { status: 404 });
    }

    // Create or update webhook configuration
    const webhookConfig = await WebhookConfig.findOneAndUpdate(
      {
        userId: decoded.id,
        wabaId
      },
      {
        webhookUrl,
        secretKey,
        events,
        isActive: true
      },
      {
        upsert: true,
        new: true
      }
    );

    return NextResponse.json({
      success: true,
      config: webhookConfig
    });

  } catch (error) {
    console.error("Save webhook config error:", error);
    return NextResponse.json(
      { error: "Failed to save webhook configuration" },
      { status: 500 }
    );
  }
}

// Delete webhook configuration
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const wabaId = searchParams.get("wabaId");

    if (!wabaId) {
      return NextResponse.json({ error: "WABA ID is required" }, { status: 400 });
    }

    // Delete webhook configuration
    await WebhookConfig.findOneAndDelete({
      userId: decoded.id,
      wabaId
    });

    return NextResponse.json({
      success: true,
      message: "Webhook configuration deleted"
    });

  } catch (error) {
    console.error("Delete webhook config error:", error);
    return NextResponse.json(
      { error: "Failed to delete webhook configuration" },
      { status: 500 }
    );
  }
}