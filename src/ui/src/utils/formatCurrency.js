export function formatCurrency(amount, currency = 'NOK') {
  try {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount ?? 0);
  } catch {
    return `${(amount ?? 0).toFixed(2)}`;
  }
}

