import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Company from '@/models/Company';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { dateRange, timeframe, companyId, userId } = body;

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    if (dateRange?.from && dateRange?.to) {
      startDate = new Date(dateRange.from);
      endDate = new Date(dateRange.to);
    } else {
      // Default to last 30 days
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build query
    const baseQuery: any = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (companyId) {
      baseQuery.companyId = companyId;
    } else if (userId) {
      const user = await User.findById(userId);
      if (user) {
        baseQuery.companyId = user.companyId;
      }
    }

    // Get detailed data for export
    const [companies, users, transactions] = await Promise.all([
      Company.find(companyId ? { _id: companyId } : {}).lean(),
      User.find(userId ? { _id: userId } : companyId ? { companyId } : {}).lean(),
      WalletTransaction.find({ ...baseQuery, status: 'completed' })
        .populate('companyId', 'name industry location')
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // Prepare CSV data
    const csvData = [];

    // Header
    csvData.push([
      'Date',
      'Company',
      'Industry',
      'Location',
      'Transaction Type',
      'Amount',
      'Description',
      'Reference Type',
      'Status'
    ].join(','));

    // Transaction data
    transactions.forEach(transaction => {
      const company = transaction.companyId as any;
      csvData.push([
        new Date(transaction.createdAt).toISOString(),
        `"${company?.name || 'Unknown'}"`,
`"${company?.location || '-'}"`,
        transaction.type,
        transaction.amount,
        `"${transaction.description}"`,
        transaction.referenceType || 'other',
        transaction.status
      ].join(','));
    });

    // Add summary data
    csvData.push('');
    csvData.push('SUMMARY STATISTICS');
    csvData.push([
      'Metric',
      'Value'
    ].join(','));

    const totalExpenses = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);

    csvData.push(['Total Companies', companies.length].join(','));
    csvData.push(['Total Users', users.length].join(','));
    csvData.push(['Total Transactions', transactions.length].join(','));
    csvData.push(['Total Expenses', totalExpenses].join(','));
    csvData.push(['Total Credits', totalCredits].join(','));
    csvData.push(['Net Amount', (totalCredits - totalExpenses)].join(','));

    // Category breakdown
    const categoryBreakdown = transactions.reduce((acc, t) => {
      const category = t.referenceType || 'other';
      acc[category] = (acc[category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    csvData.push('');
    csvData.push('CATEGORY BREAKDOWN');
    csvData.push(['Category', 'Amount'].join(','));
    Object.entries(categoryBreakdown).forEach(([category, amount]) => {
      csvData.push([category, amount].join(','));
    });

    const csvContent = csvData.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="admin-analytics-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });

  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export analytics data' },
      { status: 500 }
    );
  }
}
