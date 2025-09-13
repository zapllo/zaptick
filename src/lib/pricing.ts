export interface MessagePricing {
  basePrice: number;
  gstPrice: number;
  markupPrice: number;
  totalPrice: number;
}

// Constants for pricing calculations
const GST_PERCENTAGE = 18;
const MARKUP_PERCENTAGE = 12;

// Base prices for different template categories
const BASE_PRICES: Record<string, number> = {
  MARKETING: 0.7846,
  AUTHENTICATION: 0.115,
  UTILITY: 0.115,
  SERVICE: 0,
  AUTHENTICATION_INTERNATIONAL: 2.3
};

export function calculateMessagePrice(
  category: string,
  isInternational = false
): MessagePricing {
  // Determine base price based on category and international status
  let basePrice = 0;

  if (category === 'AUTHENTICATION' && isInternational) {
    basePrice = BASE_PRICES.AUTHENTICATION_INTERNATIONAL;
  } else {
    const normalizedCategory = category?.toUpperCase() || 'MARKETING';
    basePrice = BASE_PRICES[normalizedCategory] || BASE_PRICES.MARKETING;
  }

  // Calculate GST
  const gstPrice = basePrice * (GST_PERCENTAGE / 100);

  // Calculate markup
  const markupPrice = basePrice * (MARKUP_PERCENTAGE / 100);

  // Calculate total price
  const totalPrice = basePrice + gstPrice + markupPrice;

  return {
    basePrice,
    gstPrice,
    markupPrice,
    totalPrice
  };
}

// Format currency for display
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}
