import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Extract form data from the request
    const formData = await request.formData();

    // Get the file from the form data
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: file or type' },
        { status: 400 }
      );
    }

    // Get environment variables
    const accessToken = process.env.INTERAKT_API_TOKEN;
    const wabaId = process.env.WABA_ID;
    const phoneNumberId = process.env.PHONE_NUMBER_ID;

    if (!accessToken || !wabaId || !phoneNumberId) {
      return NextResponse.json(
        { error: 'Missing required environment variables' },
        { status: 500 }
      );
    }

    // Create a new FormData object for the API request
    const apiFormData = new FormData();

    // Add file and other required parameters to FormData
    apiFormData.append('file', file);
    apiFormData.append('messaging_product', 'whatsapp');
    apiFormData.append('type', type);

    // Make the API request to WhatsApp
    const response = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${phoneNumberId}/media_handle`,
      {
        method: 'POST',
        headers: {
          'x-access-token': accessToken,
          'x-waba-id': wabaId,
        },
        body: apiFormData,
      }
    );

    // Parse the response
    const data = await response.json();

    // Return the response from WhatsApp API
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error creating media handle:', error);
    return NextResponse.json(
      { error: 'Failed to create media handle', details: error.message },
      { status: 500 }
    );
  }
}
