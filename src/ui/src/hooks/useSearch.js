import { useMemo, useState } from 'react';

/**
 * Generic client-side search hook.
 * @param {Array} items - The full list to search
 * @param {string[]} fields - Which fields to search across
 * @returns {{ query, setQuery, results }}
 */
export function useSearch(items, fields) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return items || [];
    const lower = query.toLowerCase();
    return (items || []).filter((item) =>
      fields.some((field) => {
        const value = item[field];
        return value != null && String(value).toLowerCase().includes(lower);
      })
    );
  }, [items, query, fields]);

  return { query, setQuery, results };
}
