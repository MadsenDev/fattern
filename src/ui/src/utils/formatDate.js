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

/**
 * Parses a dd.mm.yyyy date string to yyyy-mm-dd ISO format.
 * Returns null if invalid.
 */
export function parseDateInput(value) {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  let [day, month, year] = parts;
  if (!day || !month || !year) return null;

  // Handle 2-digit years
  if (year.length === 2) {
    const yearNum = parseInt(year, 10);
    year = yearNum <= 50 ? `20${year.padStart(2, '0')}` : `19${year.padStart(2, '0')}`;
  }

  const yearNum = parseInt(year, 10);
  if (yearNum < 1900 || yearNum > 2100) return null;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}
