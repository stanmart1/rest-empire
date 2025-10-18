export const formatCurrency = (amount: number | undefined | null, currency: string = 'NGN'): string => {
  const safeAmount = amount ?? 0;
  
  const currencySymbols: Record<string, string> = {
    NGN: '₦',
    EUR: '€',
    USD: '$',
    USDT: 'USDT',
    DBSP: 'DBSP',
  };

  const symbol = currencySymbols[currency] || currency;
  const formatted = safeAmount.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
  
  if (currency === 'DBSP' || currency === 'USDT') {
    return `${formatted} ${symbol}`;
  }

  return `${symbol}${formatted}`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return formatDate(d);
  }
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

export const formatPercentage = (value: number | undefined | null): string => {
  const safeValue = value ?? 0;
  return `${safeValue.toFixed(2)}%`;
};
