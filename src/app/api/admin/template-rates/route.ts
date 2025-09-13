import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { WalletService } from '@/lib/wallet-service';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const result = await WalletService.getTemplateRates(companyId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      rates: result.rates
    });

  } catch (error) {
    console.error('Error fetching template rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template rates' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { companyId, rates } = body;

    if (!companyId || !rates) {
      return NextResponse.json(
        { success: false, error: 'Company ID and rates are required' },
        { status: 400 }
      );
    }

    const result = await WalletService.updateTemplateRates(companyId, rates);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Template rates updated successfully'
    });

  } catch (error) {
    console.error('Error updating template rates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template rates' },
      { status: 500 }
    );
  }
}