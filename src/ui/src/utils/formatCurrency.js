export function formatCurrency(amount, currency = 'NOK') {
  try {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount ?? 0);
  } catch {
    return `${amount ?? 0}`;
  }
}

