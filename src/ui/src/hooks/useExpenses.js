import { useEffect, useState } from 'react';

export function useExpenses(budgetYearId, options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const { limit } = options;

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;
    if (!api?.listExpenses || !budgetYearId) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .listExpenses({ budgetYearId, limit })
      .then((rows) => {
        if (!cancelled) {
          setData(rows);
        }
      })
      .catch((error) => {
        console.error('Kunne ikke hente utgifter', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [budgetYearId, limit]);

  return { expenses: data, isLoading };
}

