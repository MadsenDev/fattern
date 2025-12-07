import { useEffect, useState } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;
    if (!api?.getAllSettings) {
      setSettings({});
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .getAllSettings()
      .then((data) => {
        if (!cancelled) {
          setSettings(data);
        }
      })
      .catch((error) => {
        console.error('Kunne ikke hente innstillinger', error);
        setSettings({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateSetting = async (key, value) => {
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;
    if (!api?.setSetting) return;

    try {
      await api.setSetting(key, value);
      setSettings((prev) => ({ ...prev, [key]: String(value) }));
    } catch (error) {
      console.error('Kunne ikke oppdatere innstilling', error);
      throw error;
    }
  };

  const getSetting = (key, defaultValue = null) => {
    if (!settings) return defaultValue;
    return settings[key] ?? defaultValue;
  };

  return { settings, isLoading, updateSetting, getSetting };
}

