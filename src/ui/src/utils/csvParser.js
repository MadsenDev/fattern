/**
 * CSV Parser utilities
 */

/**
 * Detects CSV delimiter (comma, semicolon, tab)
 */
export function detectDelimiter(text) {
  const lines = text.split('\n').slice(0, 5);
  const delimiters = [',', ';', '\t'];
  const counts = delimiters.map((delim) => {
    return lines.reduce((sum, line) => sum + (line.match(new RegExp(`\\${delim}`, 'g')) || []).length, 0);
  });
  const maxIndex = counts.indexOf(Math.max(...counts));
  return delimiters[maxIndex] || ',';
}

/**
 * Parses CSV text into rows
 */
export function parseCSV(text, delimiter = null) {
  if (!text || text.trim().length === 0) {
    return { headers: [], rows: [] };
  }

  const detectedDelimiter = delimiter || detectDelimiter(text);
  const lines = text.split('\n').filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Parse headers
  const headers = lines[0]
    .split(detectedDelimiter)
    .map((h) => h.trim().replace(/^"|"$/g, ''));

  // Parse rows
  const rows = lines.slice(1).map((line) => {
    const values = line.split(detectedDelimiter).map((v) => v.trim().replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    return row;
  });

  return { headers, rows, delimiter: detectedDelimiter };
}

/**
 * Validates CSV structure
 */
export function validateCSV(csvData) {
  if (!csvData.headers || csvData.headers.length === 0) {
    return { valid: false, error: 'CSV mangler overskrifter' };
  }

  if (!csvData.rows || csvData.rows.length === 0) {
    return { valid: false, error: 'CSV mangler data-rader' };
  }

  // Check if all rows have same number of columns
  const headerCount = csvData.headers.length;
  const invalidRows = csvData.rows.filter((row) => {
    const rowKeys = Object.keys(row);
    return rowKeys.length !== headerCount;
  });

  if (invalidRows.length > 0) {
    return { valid: false, error: `${invalidRows.length} rader har feil antall kolonner` };
  }

  return { valid: true };
}

