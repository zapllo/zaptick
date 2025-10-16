import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as { id: string };
    if (!decoded?.id) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get the user and their WABA accounts
    const user = await User.findById(decoded.id).select('wabaAccounts');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.wabaAccounts || user.wabaAccounts.length === 0) {
      return NextResponse.json(
        { error: 'No WhatsApp Business accounts found. Please connect your WhatsApp Business account first.' },
        { status: 400 }
      );
    }

    // Extract form data from the request
    const formData = await request.formData();

    // Get the file from the form data
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const wabaId = formData.get('wabaId') as string; // Optional: allow specifying which WABA to use

    if (!file || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters: file or type' },
        { status: 400 }
      );
    }

    // Find the appropriate WABA account
    let selectedWabaAccount;
    if (wabaId) {
      // Use the specified WABA ID if provided
      selectedWabaAccount = user.wabaAccounts.find(
        (account: any) => account.wabaId === wabaId
      );
      if (!selectedWabaAccount) {
        return NextResponse.json(
          { error: 'Specified WABA ID not found in user accounts' },
          { status: 400 }
        );
      }
    } else {
      // Use the first available WABA account
      selectedWabaAccount = user.wabaAccounts[0];
    }

    const { wabaId: userWabaId, phoneNumberId } = selectedWabaAccount;

    if (!userWabaId || !phoneNumberId) {
      return NextResponse.json(
        { error: 'Incomplete WhatsApp Business account configuration. Please reconnect your account.' },
        { status: 400 }
      );
    }

    // Get access token from environment
    const accessToken = process.env.INTERAKT_API_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing access token configuration' },
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
          'x-waba-id': userWabaId,
        },
        body: apiFormData,
      }
    );

    // Parse the response
    const data = await response.json();

    // Check if the response is successful
    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return NextResponse.json(
        {
          error: 'Failed to upload media to WhatsApp',
          details: data.error?.message || 'Unknown error',
          whatsappError: data
        },
        { status: response.status }
      );
    }

    // Return the response from WhatsApp API with additional context
    return NextResponse.json({
      ...data,
      wabaId: userWabaId,
      phoneNumberId
    }, { status: 200 });

  } catch (error) {
    console.error('Error creating media handle:', error);
    return NextResponse.json(
      {
        error: 'Failed to create media handle',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
