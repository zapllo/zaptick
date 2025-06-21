import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { about } = await request.json();

    // Get environment variables
    const accessToken = process.env.INTERAKT_API_TOKEN;
    const wabaId = process.env.WABA_ID;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;

    if (!accessToken || !wabaId || !phoneNumberId) {
      return NextResponse.json(
        { error: "Missing WhatsApp configuration" },
        { status: 500 }
      );
    }

    // Make request to WhatsApp Cloud API to update business profile
    const response = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${phoneNumberId}/whatsapp_business_profile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": accessToken,
          "x-waba-id": wabaId,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          about: about,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WhatsApp API error:", errorData);
      return NextResponse.json(
        { error: "Failed to update WhatsApp business profile" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Error updating WhatsApp profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
