import { useEffect, useState } from 'react';

export function useCustomers(refreshKey = 0) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;
    if (!api?.listCustomers) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .listCustomers()
      .then((rows) => {
        if (!cancelled) {
          setData(rows);
        }
      })
      .catch((error) => {
        console.error('Kunne ikke hente kunder', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return { customers: data, isLoading };
}

