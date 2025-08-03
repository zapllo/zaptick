import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { WalletService } from '@/lib/wallet-service';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const result = await WalletService.getDefaultTemplateRates();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rates: result.rates
    });

  } catch (error) {
    console.error('Error fetching default template rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch default template rates' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { rates } = body;

    if (!rates || !Array.isArray(rates)) {
      return NextResponse.json(
        { success: false, error: 'Rates array is required' },
        { status: 400 }
      );
    }

    const result = await WalletService.updateDefaultTemplateRates(rates);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Default template rates updated successfully'
    });

  } catch (error) {
    console.error('Error updating default template rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update default template rates' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const countryCode = searchParams.get('countryCode');

    if (!countryCode) {
      return NextResponse.json(
        { success: false, error: 'Country code is required' },
        { status: 400 }
      );
    }

    const result = await WalletService.deleteDefaultTemplateRate(countryCode);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Default template rate deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting default template rate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete default template rate' },
      { status: 500 }
    );
  }
}