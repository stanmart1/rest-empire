/**
 * Format currency amount with Naira symbol
 */
export const formatCurrency = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

/**
 * Get currency symbol (always Naira for this app)
 */
export const getCurrencySymbol = (): string => {
  return '₦';
};
