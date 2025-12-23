
/**
 * Formats a number into Indonesian financial shorthand:
 * K = Ribu (Thousand)
 * M = Juta (Million)
 * B = Miliar (Billion)
 */
export const formatShorthand = (val: number): string => {
  const sign = val < 0 ? '-' : '';
  const absVal = Math.abs(val);
  
  if (absVal >= 1000000000) {
    return sign + (absVal / 1000000000).toFixed(1).replace('.0', '') + 'B';
  }
  if (absVal >= 1000000) {
    return sign + (absVal / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (absVal >= 1000) {
    return sign + (absVal / 1000).toFixed(1).replace('.0', '') + 'K';
  }
  return sign + absVal.toString();
};

/**
 * Formats a number with full nominal value and thousand separators.
 */
export const formatNumber = (val: number): string => {
  return new Intl.NumberFormat('id-ID').format(val);
};

export const formatCurrencyFull = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val);
};
