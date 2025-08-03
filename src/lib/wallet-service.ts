import Company from '@/models/Company';
import WalletTransaction from '@/models/WalletTransaction';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import DefaultTemplateRate from '@/models/DefaultTemplateRate';

export class WalletService {
  static async deductFromWallet(
    companyId: string,
    amount: number,
    description: string,
    referenceType: 'campaign' | 'message' | 'subscription' | 'manual' | 'other' | 'template' = 'other',
    referenceId?: string,
    metadata?: any
  ): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      // Fix: Use _id instead of companyId field
      const company = await Company.findById(companyId);

      if (!company) {
        console.error(`❌ Company not found with _id: ${companyId}`);
        return { success: false, error: 'Company not found' };
      }

      console.log(`🏢 Found company: ${company.name} (ID: ${company._id})`);

      // Get current wallet balance
      const currentBalance = await this.getWalletBalance(companyId);
      if (!currentBalance.success) {
        return { success: false, error: currentBalance.error };
      }

      console.log(`💰 Current balance: ₹${currentBalance.balance?.toFixed(4)}, Deducting: ₹${amount.toFixed(4)}`);

      // Check if company has sufficient balance
      if (currentBalance.balance! < amount) {
        return {
          success: false,
          error: `Insufficient wallet balance. Available: ₹${currentBalance.balance!.toFixed(4)}, Required: ₹${amount.toFixed(4)}`
        };
      }

      // ** FIXED: Handle referenceId properly **
      let processedReferenceId = null;
      if (referenceId) {
        // Check if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(referenceId) && referenceId.length === 24) {
          processedReferenceId = new mongoose.Types.ObjectId(referenceId);
        } else {
          // Store as string in metadata instead
          processedReferenceId = null;
          metadata = {
            ...metadata,
            originalReferenceId: referenceId
          };
        }
      }

      const newBalance = currentBalance.balance! - amount;

      // Create debit transaction
      const transaction = await WalletTransaction.create({
        companyId: company._id,
        amount,
        type: 'debit',
        status: 'completed',
        description,
        reference: uuidv4(),
        referenceType,
        referenceId: processedReferenceId, // This will be null for non-ObjectId references
        metadata: {
          ...metadata,
          balanceBefore: currentBalance.balance,
          balanceAfter: newBalance
        }
      });

      // ** NEW: Update the company's walletBalance field **
      await Company.findByIdAndUpdate(companyId, {
        walletBalance: newBalance
      });

      console.log(`💰 Wallet deduction successful: ₹${amount.toFixed(4)} from ${company.name}`);
      console.log(`💰 New balance: ₹${newBalance.toFixed(4)}`);
      console.log(`💾 Company walletBalance updated in database`);

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
    referenceType: 'campaign' | 'message' | 'subscription' | 'manual' | 'other' | 'refund' = 'manual',
    referenceId?: string,
    metadata?: any
  ): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      // Fix: Use _id instead of companyId field
      const company = await Company.findById(companyId);

      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      // Get current wallet balance
      const currentBalance = await this.getWalletBalance(companyId);
      if (!currentBalance.success) {
        return { success: false, error: currentBalance.error };
      }

      // ** FIXED: Handle referenceId properly **
      let processedReferenceId = null;
      if (referenceId) {
        // Check if it's a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(referenceId) && referenceId.length === 24) {
          processedReferenceId = new mongoose.Types.ObjectId(referenceId);
        } else {
          // Store as string in metadata instead
          processedReferenceId = null;
          metadata = {
            ...metadata,
            originalReferenceId: referenceId
          };
        }
      }

      const newBalance = currentBalance.balance! + amount;

      // Create credit transaction
      const transaction = await WalletTransaction.create({
        companyId: company._id,
        amount,
        type: 'credit',
        status: 'completed',
        description,
        reference: uuidv4(),
        referenceType,
        referenceId: processedReferenceId, // This will be null for non-ObjectId references
        metadata: {
          ...metadata,
          balanceBefore: currentBalance.balance,
          balanceAfter: newBalance
        }
      });

      // ** NEW: Update the company's walletBalance field **
      await Company.findByIdAndUpdate(companyId, {
        walletBalance: newBalance
      });

      console.log(`💰 Wallet credit successful: ₹${amount.toFixed(4)} to ${company.name}`);
      console.log(`💰 New balance: ₹${newBalance.toFixed(4)}`);
      console.log(`💾 Company walletBalance updated in database`);

      return { success: true, balance: newBalance };

    } catch (error) {
      console.error('❌ Error adding to wallet:', error);
      return { success: false, error: 'Failed to add to wallet' };
    }
  }

  // Rest of the methods remain the same...
  static async getWalletBalance(companyId: string): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      // Fix: Use _id instead of companyId field
      const company = await Company.findById(companyId);

      if (!company) {
        console.error(`❌ Company not found with _id: ${companyId}`);
        return { success: false, error: 'Company not found' };
      }

      console.log(`🏢 Getting balance for company: ${company.name} (ID: ${company._id})`);
      console.log(`💰 Company.walletBalance field: ₹${company.walletBalance || 0}`);

      // First, try to use the walletBalance field from the company document
      if (company.walletBalance !== undefined && company.walletBalance !== null) {
        console.log(`💰 Using company.walletBalance: ₹${company.walletBalance}`);
        return { success: true, balance: Math.max(0, company.walletBalance) };
      }

      // Fallback: Calculate balance from all transactions
      console.log(`🔄 Calculating balance from transactions...`);
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

      console.log(`💰 Calculated balance from transactions: ₹${balance}`);

      // ** NEW: Update company's walletBalance field with calculated balance **
      await Company.findByIdAndUpdate(companyId, {
        walletBalance: Math.max(0, balance)
      });

      console.log(`💾 Updated company walletBalance field to: ₹${Math.max(0, balance)}`);

      return { success: true, balance: Math.max(0, balance) }; // Ensure balance never goes negative

    } catch (error) {
      console.error('❌ Error getting wallet balance:', error);
      return { success: false, error: 'Failed to get wallet balance' };
    }
  }

  /**
   * Calculate template message cost based on company's country-specific rates
   */
  static async calculateTemplateMessageCost(
    companyId: string,
    templateType: 'marketing' | 'authentication' | 'utility',
    recipientPhoneNumber: string
  ): Promise<{ success: boolean; cost: number; error?: string; countryCode?: string; currency?: string }> {
    try {
      // Extract country code from phone number
      const countryCode = this.extractCountryCodeFromPhone(recipientPhoneNumber);
      
      if (!countryCode) {
        return {
          success: false,
          cost: 0,
          error: 'Could not determine country code from phone number'
        };
      }

      const company = await Company.findById(companyId);
      if (!company) {
        return { success: false, cost: 0, error: 'Company not found' };
      }

      // Find template rate for the country
      const templateRate = company.templateRates?.find(
        rate => rate.countryCode === countryCode && rate.isActive
      );

      if (!templateRate) {
        // ** UPDATED: Use country-specific default rate **
        const defaultCost = await this.getDefaultTemplateRate(templateType, countryCode);
        console.log(`⚠️ No company-specific template rate found for ${countryCode}, using default: ₹${defaultCost}`);
        return {
          success: true,
          cost: defaultCost,
          countryCode,
          currency: 'INR' // This will be updated to use the default rate's currency
        };
      }

      const cost = templateRate.rates[templateType].platformPrice;
      
      console.log(`💰 Template rate for ${countryCode} (${templateType}): ₹${cost}`);
      
      return {
        success: true,
        cost,
        countryCode,
        currency: templateRate.currency
      };

    } catch (error) {
      console.error('❌ Error calculating template message cost:', error);
      return { success: false, cost: 0, error: 'Failed to calculate template cost' };
    }
  }

  /**
   * Deduct wallet balance for template message
   */
  static async deductForTemplateMessage(
    companyId: string,
    templateType: 'marketing' | 'authentication' | 'utility',
    recipientPhoneNumber: string,
    templateName: string,
    campaignId?: string,
    messageId?: string
  ): Promise<{ success: boolean; cost: number; balance?: number; error?: string; countryCode?: string }> {
    try {
      // Calculate cost
      const costResult = await this.calculateTemplateMessageCost(companyId, templateType, recipientPhoneNumber);

      if (!costResult.success) {
        return {
          success: false,
          cost: 0,
          error: costResult.error
        };
      }

      const cost = costResult.cost;
      const countryCode = costResult.countryCode;

      // Check balance before deducting
      const balanceResult = await this.getWalletBalance(companyId);
      if (!balanceResult.success) {
        return {
          success: false,
          cost,
          error: balanceResult.error,
          countryCode
        };
      }

      if (balanceResult.balance! < cost) {
        return {
          success: false,
          cost,
          error: `Insufficient balance. Required: ₹${cost.toFixed(4)}, Available: ₹${balanceResult.balance!.toFixed(4)}`,
          countryCode
        };
      }

      // Deduct from wallet - use template referenceType and pass messageId in metadata
      const deductResult = await this.deductFromWallet(
        companyId,
        cost,
        `Template Message: ${templateName} (${templateType}) to ${countryCode}`,
        'template', // Use template referenceType
        campaignId, // Only pass campaignId if it's a valid ObjectId
        {
          templateType,
          templateName,
          recipientPhone: recipientPhoneNumber,
          countryCode,
          currency: costResult.currency,
          messageType: 'template',
          templateCategory: templateType,
          messageId: messageId, // Store messageId in metadata
          messageSource: campaignId ? 'campaign' : 'individual'
        }
      );

      if (!deductResult.success) {
        return {
          success: false,
          cost,
          error: deductResult.error,
          countryCode
        };
      }

      console.log(`✅ Template message cost deducted: ₹${cost} for ${templateType} to ${countryCode}`);

      return {
        success: true,
        cost,
        balance: deductResult.balance,
        countryCode
      };

    } catch (error) {
      console.error('❌ Error deducting for template message:', error);
      return {
        success: false,
        cost: 0,
        error: 'Failed to deduct template message cost'
      };
    }
  }

  /**
   * Extract country code from phone number (basic implementation)
   */
  private static extractCountryCodeFromPhone(phoneNumber: string): string | null {
    // Remove non-digit characters
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Basic country code mapping (you can expand this)
    const countryCodeMap: { [key: string]: string } = {
      '91': 'IN',    // India
      '1': 'US',     // USA/Canada
      '44': 'GB',    // UK
      '33': 'FR',    // France
      '49': 'DE',    // Germany
      '81': 'JP',    // Japan
      '86': 'CN',    // China
      '61': 'AU',    // Australia
      '55': 'BR',    // Brazil
      '34': 'ES',    // Spain
      '39': 'IT',    // Italy
      '7': 'RU',     // Russia
      '82': 'KR',    // South Korea
      '52': 'MX',    // Mexico
      '31': 'NL',    // Netherlands
      '46': 'SE',    // Sweden
      '47': 'NO',    // Norway
      '45': 'DK',    // Denmark
      '41': 'CH',    // Switzerland
      '43': 'AT',    // Austria
      '32': 'BE',    // Belgium
      '351': 'PT',   // Portugal
      '30': 'GR',    // Greece
      '48': 'PL',    // Poland
      '420': 'CZ',   // Czech Republic
      '36': 'HU',    // Hungary
      '40': 'RO',    // Romania
      '90': 'TR',    // Turkey
      '972': 'IL',   // Israel
      '971': 'AE',   // UAE
      '966': 'SA',   // Saudi Arabia
      '60': 'MY',    // Malaysia
      '65': 'SG',    // Singapore
      '66': 'TH',    // Thailand
      '84': 'VN',    // Vietnam
      '62': 'ID',    // Indonesia
      '63': 'PH',    // Philippines
      '27': 'ZA',    // South Africa
      '20': 'EG',    // Egypt
      '234': 'NG',   // Nigeria
    };

    // Try to match country codes (longest first)
    const sortedCodes = Object.keys(countryCodeMap).sort((a, b) => b.length - a.length);

    for (const code of sortedCodes) {
      if (cleanPhone.startsWith(code)) {
        return countryCodeMap[code];
      }
    }

    return null;
  }
/**
   * Get default template rates when no specific rate is configured
   * Now supports country-specific defaults
   */
  private static async getDefaultTemplateRate(
    templateType: 'marketing' | 'authentication' | 'utility',
    countryCode?: string
  ): Promise<number> {
    try {
      // If country code is provided, try to find country-specific default
      if (countryCode) {
        const defaultRate = await DefaultTemplateRate.findOne({
          countryCode: countryCode.toUpperCase(),
          isActive: true
        });

        if (defaultRate) {
          const cost = defaultRate.rates[templateType].platformPrice;
          console.log(`📋 Using country-specific default rate for ${countryCode} (${templateType}): ₹${cost}`);
          return cost;
        }
      }

      // Fallback to global defaults if no country-specific rate found
      const globalDefaults = {
        marketing: 0.9415199999999999,      // ₹0.25
        authentication: 0.138, // ₹0.15
        utility: 0.138        // ₹0.20
      };

      console.log(`📋 Using global default rate for ${templateType}: ₹${globalDefaults[templateType]}`);
      return globalDefaults[templateType];

    } catch (error) {
      console.error('❌ Error getting default template rate:', error);
      
      // Ultimate fallback to hardcoded defaults
      const ultimateFallback = {
        marketing: 0.25,
        authentication: 0.15,
        utility: 0.20
      };

      return ultimateFallback[templateType];
    }
  }

 /**
   * Get default template rates for admin management
   */
  static async getDefaultTemplateRates(): Promise<{ success: boolean; rates?: any[]; error?: string }> {
    try {
      const rates = await DefaultTemplateRate.find({}).sort({ countryCode: 1 });
      return {
        success: true,
        rates
      };
    } catch (error) {
      console.error('❌ Error getting default template rates:', error);
      return { success: false, error: 'Failed to get default template rates' };
    }
  }

  /**
   * Update default template rates
   */
  static async updateDefaultTemplateRates(
    rates: any[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Process each rate
      const updatePromises = rates.map(async (rate) => {
        // Calculate platform prices based on margin
        const processedRate = {
          ...rate,
          rates: {
            marketing: {
              ...rate.rates.marketing,
              platformPrice: rate.rates.marketing.interaktPrice * (1 + rate.rates.marketing.marginPercentage / 100)
            },
            authentication: {
              ...rate.rates.authentication,
              platformPrice: rate.rates.authentication.interaktPrice * (1 + rate.rates.authentication.marginPercentage / 100)
            },
            utility: {
              ...rate.rates.utility,
              platformPrice: rate.rates.utility.interaktPrice * (1 + rate.rates.utility.marginPercentage / 100)
            }
          },
          lastUpdated: new Date()
        };

        // Upsert the rate
        return DefaultTemplateRate.findOneAndUpdate(
          { countryCode: rate.countryCode.toUpperCase() },
          processedRate,
          { upsert: true, new: true }
        );
      });

      await Promise.all(updatePromises);

      console.log(`✅ Default template rates updated for ${rates.length} countries`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error updating default template rates:', error);
      return { success: false, error: 'Failed to update default template rates' };
    }
  }

  /**
   * Delete a default template rate
   */
  static async deleteDefaultTemplateRate(countryCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      await DefaultTemplateRate.findOneAndDelete({ 
        countryCode: countryCode.toUpperCase() 
      });

      console.log(`✅ Default template rate deleted for ${countryCode}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error deleting default template rate:', error);
      return { success: false, error: 'Failed to delete default template rate' };
    }
  }

  /**
   * Get template rates for a company
   */
  static async getTemplateRates(companyId: string): Promise<{ success: boolean; rates?: any[]; error?: string }> {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      return {
        success: true,
        rates: company.templateRates || []
      };
    } catch (error) {
      console.error('❌ Error getting template rates:', error);
      return { success: false, error: 'Failed to get template rates' };
    }
  }

  /**
   * Update template rates for a company
   */
  static async updateTemplateRates(
    companyId: string,
    rates: any[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const company = await Company.findById(companyId);
      if (!company) {
        return { success: false, error: 'Company not found' };
      }

      // Validate and calculate platform prices based on margin
      const processedRates = rates.map(rate => ({
        ...rate,
        rates: {
          marketing: {
            ...rate.rates.marketing,
            platformPrice: rate.rates.marketing.interaktPrice * (1 + rate.rates.marketing.marginPercentage / 100)
          },
          authentication: {
            ...rate.rates.authentication,
            platformPrice: rate.rates.authentication.interaktPrice * (1 + rate.rates.authentication.marginPercentage / 100)
          },
          utility: {
            ...rate.rates.utility,
            platformPrice: rate.rates.utility.interaktPrice * (1 + rate.rates.utility.marginPercentage / 100)
          }
        },
        lastUpdated: new Date()
      }));

      await Company.findByIdAndUpdate(companyId, {
        templateRates: processedRates
      });

      console.log(`✅ Template rates updated for company: ${companyId}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error updating template rates:', error);
      return { success: false, error: 'Failed to update template rates' };
    }
  }

  // ... rest of existing methods remain the same
  static async getTotalSpent(companyId: string): Promise<{ success: boolean; totalSpent?: number; error?: string }> {
    try {
      // Fix: Use _id instead of companyId field
      const company = await Company.findById(companyId);

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
      // Fix: Use _id instead of companyId field
      const company = await Company.findById(companyId);

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
      // Fix: Use _id instead of companyId field
      const company = await Company.findById(companyId);

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

  // Add the calculateCost method
  static calculateCost(tokens: number, model: string = 'gpt-3.5-turbo'): number {
    // Cost per token in USD (approximate)
    const costPerTokenUSD = {
      'gpt-3.5-turbo': 0.000002,
      'gpt-4': 0.00003,
      'gpt-4-turbo': 0.00001,
      'gpt-4o': 0.000005,
      'gpt-4o-mini': 0.000001
    };

    const baseCostUSD = costPerTokenUSD[model] || costPerTokenUSD['gpt-3.5-turbo'];
    const usdToInr = 83; // Approximate conversion rate
    return tokens * baseCostUSD * usdToInr;
  }
}