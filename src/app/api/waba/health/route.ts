import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const INT_TOKEN = process.env.INTERAKT_API_TOKEN;

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
    const user = await User.findById(decoded.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get the wabaId from query params
    const { searchParams } = new URL(req.url);
    const wabaId = searchParams.get('wabaId');

    if (!wabaId) {
      return NextResponse.json({ error: 'WABA ID is required' }, { status: 400 });
    }

    // Check if this wabaId belongs to the user
    const wabaAccount = user.wabaAccounts.find((account: any) => account.wabaId === wabaId);
    if (!wabaAccount) {
      return NextResponse.json({ error: 'WABA account not found' }, { status: 404 });
    }

    // Fetch the health status from Interakt API
    const interaktResponse = await fetch(
      `https://amped-express.interakt.ai/api/v17.0/${wabaId}/phone_numbers?fields=verified,status,quality_rating,display_phone_number`,
      {
        method: 'GET',
        headers: {
          'x-access-token': INT_TOKEN || '',
          'x-waba-id': wabaId,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!interaktResponse.ok) {
      return NextResponse.json({
        error: 'Failed to fetch health status',
        status: interaktResponse.status
      }, { status: interaktResponse.status });
    }

    const responseData = await interaktResponse.json();

    // Format and return the health status
    return NextResponse.json({
      success: true,
      healthStatus: {
        phoneNumbers: responseData.data.map((phone: any) => ({
          id: phone.id,
          phoneNumber: phone.display_phone_number,
          verified: phone.verified,
          status: phone.status,
          qualityRating: phone.quality_rating,
        }))
      }
    });

  } catch (error) {
    console.error('Health status check error:', error);
    return NextResponse.json({
      error: 'Failed to check health status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
