import { useEffect, useState } from 'react';

export function useInvoices(budgetYearId) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;
    if (!api?.listInvoices || !budgetYearId) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .listInvoices({ budgetYearId, limit: 10 })
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
  }, [budgetYearId]);

  return { invoices: data, isLoading };
}

