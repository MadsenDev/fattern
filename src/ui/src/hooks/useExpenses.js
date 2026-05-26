import { useEffect, useState } from 'react';

export function useExpenses(budgetYearId, options = {}) {
  const [expenses, setExpenses] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const { limit, refreshKey } = options;

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;
    if (!api?.listExpenses || !budgetYearId) {
      setExpenses(null);
      setBreakdown(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      api.listExpenses({ budgetYearId, limit }),
      api.getExpenseCategoryBreakdown
        ? api.getExpenseCategoryBreakdown(budgetYearId)
        : Promise.resolve([]),
    ])
      .then(([rows, breakdownRows]) => {
        if (!cancelled) {
          setExpenses(rows);
          setBreakdown(breakdownRows);
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
  }, [budgetYearId, limit, refreshKey]);

  return { expenses, breakdown, isLoading };
}
