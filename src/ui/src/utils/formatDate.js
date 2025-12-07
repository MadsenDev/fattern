export function formatDate(value) {
  if (!value) return '';

  // Already in dd.mm.yyyy
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(value)) {
    return value;
  }

  // ISO yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}.${month}.${year}`;
  }

  // Try to parse other date-like values and format
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}


