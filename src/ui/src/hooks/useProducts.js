import { useEffect, useState } from 'react';

export function useProducts(options = {}) {
  const [data, setData] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const { includeInactive, refreshKey = 0 } = options;

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;
    if (!api?.listProducts) {
      setData(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .listProducts({ includeInactive })
      .then((rows) => {
        if (!cancelled) {
          setData(rows);
        }
      })
      .catch((error) => {
        console.error('Kunne ikke hente produkter', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [includeInactive, refreshKey]);

  return { products: data, isLoading };
}

