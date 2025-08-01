import Company from '@/models/Company';
import WalletTransaction from '@/models/WalletTransaction';
import { v4 as uuidv4 } from 'uuid';

export class WalletService {
  static async deductFromWallet(
    companyId: string,
    amount: number,
    description: string,
    referenceType: 'campaign' | 'message' | 'subscription' | 'manual' | 'other' = 'other',
    referenceId?: string,
    metadata?: any
  ): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      const company = await Company.findOne({ companyId });
      
      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      // Get current wallet balance
      const currentBalance = await this.getWalletBalance(companyId);
      if (!currentBalance.success) {
        return { success: false, error: currentBalance.error };
      }

      // Check if company has sufficient balance
      if (currentBalance.balance! < amount) {
        return { 
          success: false, 
          error: `Insufficient wallet balance. Available: ₹${currentBalance.balance!.toFixed(4)}, Required: ₹${amount.toFixed(4)}` 
        };
      }

      // Create debit transaction
      const transaction = await WalletTransaction.create({
        companyId: company._id,
        amount,
        type: 'debit',
        status: 'completed',
        description,
        reference: uuidv4(),
        referenceType,
        referenceId: referenceId || null,
        metadata: {
          ...metadata,
          balanceBefore: currentBalance.balance,
          balanceAfter: currentBalance.balance! - amount
        }
      });

      const newBalance = currentBalance.balance! - amount;

      console.log(`💰 Wallet deduction successful: ₹${amount.toFixed(4)} from ${companyId}`);
      console.log(`💰 New balance: ₹${newBalance.toFixed(4)}`);

      return { success: true, balance: newBalance };

    } catch (error) {
      console.error('❌ Error deducting from wallet:', error);
      return { success: false, error: 'Failed to deduct from wallet' };
    }
  }

  static async addToWallet(
    companyId: string,
    amount: number,
    description: string,
    referenceType: 'campaign' | 'message' | 'subscription' | 'manual' | 'other' = 'manual',
    referenceId?: string,
    metadata?: any
  ): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      const company = await Company.findOne({ companyId });
      
      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      // Get current wallet balance
      const currentBalance = await this.getWalletBalance(companyId);
      if (!currentBalance.success) {
        return { success: false, error: currentBalance.error };
      }

      // Create credit transaction
      const transaction = await WalletTransaction.create({
        companyId: company._id,
        amount,
        type: 'credit',
        status: 'completed',
        description,
        reference: uuidv4(),
        referenceType,
        referenceId: referenceId || null,
        metadata: {
          ...metadata,
          balanceBefore: currentBalance.balance,
          balanceAfter: currentBalance.balance! + amount
        }
      });

      const newBalance = currentBalance.balance! + amount;

      console.log(`💰 Wallet credit successful: ₹${amount.toFixed(4)} to ${companyId}`);
      console.log(`💰 New balance: ₹${newBalance.toFixed(4)}`);

      return { success: true, balance: newBalance };

    } catch (error) {
      console.error('❌ Error adding to wallet:', error);
      return { success: false, error: 'Failed to add to wallet' };
    }
  }

  static async getWalletBalance(companyId: string): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      const company = await Company.findOne({ companyId });
      
      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      // Calculate balance from all transactions
      const transactions = await WalletTransaction.aggregate([
        { $match: { companyId: company._id, status: 'completed' } },
        {
          $group: {
            _id: null,
            totalCredits: {
              $sum: {
                $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0]
              }
            },
            totalDebits: {
              $sum: {
                $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0]
              }
            }
          }
        }
      ]);

      const balance = transactions.length > 0 
        ? transactions[0].totalCredits - transactions[0].totalDebits 
        : 0;

      return { success: true, balance: Math.max(0, balance) }; // Ensure balance never goes negative

    } catch (error) {
      console.error('❌ Error getting wallet balance:', error);
      return { success: false, error: 'Failed to get wallet balance' };
    }
  }

  static async getTotalSpent(companyId: string): Promise<{ success: boolean; totalSpent?: number; error?: string }> {
    try {
      const company = await Company.findOne({ companyId });
      
      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      const result = await WalletTransaction.aggregate([
        { 
          $match: { 
            companyId: company._id, 
            type: 'debit', 
            status: 'completed' 
          } 
        },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: '$amount' }
          }
        }
      ]);

      const totalSpent = result.length > 0 ? result[0].totalSpent : 0;

      return { success: true, totalSpent };

    } catch (error) {
      console.error('❌ Error getting total spent:', error);
      return { success: false, error: 'Failed to get total spent' };
    }
  }

  static async getWalletTransactions(
    companyId: string,
    limit: number = 50,
    offset: number = 0,
    type?: 'credit' | 'debit' | 'refund'
  ): Promise<{ success: boolean; transactions?: any[]; total?: number; error?: string }> {
    try {
      const company = await Company.findOne({ companyId });
      
      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      const filter: any = { companyId: company._id };
      if (type) {
        filter.type = type;
      }

      const [transactions, total] = await Promise.all([
        WalletTransaction.find(filter)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .lean(),
        WalletTransaction.countDocuments(filter)
      ]);

      return { success: true, transactions, total };

    } catch (error) {
      console.error('❌ Error getting wallet transactions:', error);
      return { success: false, error: 'Failed to get wallet transactions' };
    }
  }

  static async getChatbotSpending(
    companyId: string,
    days: number = 30
  ): Promise<{ success: boolean; spending?: number; transactions?: number; error?: string }> {
    try {
      const company = await Company.findOne({ companyId });
      
      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await WalletTransaction.aggregate([
        { 
          $match: { 
            companyId: company._id, 
            type: 'debit',
            status: 'completed',
            referenceType: 'other', // Assuming chatbot transactions use 'other'
            createdAt: { $gte: startDate },
            description: { $regex: /chatbot|ai/i } // Match chatbot-related descriptions
          } 
        },
        {
          $group: {
            _id: null,
            totalSpending: { $sum: '$amount' },
            transactionCount: { $sum: 1 }
          }
        }
      ]);

      const spending = result.length > 0 ? result[0].totalSpending : 0;
      const transactions = result.length > 0 ? result[0].transactionCount : 0;

      return { success: true, spending, transactions };

    } catch (error) {
      console.error('❌ Error getting chatbot spending:', error);
      return { success: false, error: 'Failed to get chatbot spending' };
    }
  }
}