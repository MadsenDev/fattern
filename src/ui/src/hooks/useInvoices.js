import { useEffect, useState } from 'react';

export function useInvoices(budgetYearId, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const { limit, refreshKey } = options;

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;
    if (!api?.listInvoices || !budgetYearId) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .listInvoices({ budgetYearId, limit })
      .then((rows) => {
        if (!cancelled) {
          setData(rows);
        }
      })
      .catch((error) => {
        console.error('Kunne ikke hente fakturaer', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [budgetYearId, limit, refreshKey]);

  return { invoices: data, isLoading };
}

