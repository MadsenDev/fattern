import { useState, useEffect } from 'react';

const SUPPORTER_KEY = 'fattern:supporter';

export function useSupporterPack() {
  const [isSupporter, setIsSupporter] = useState(false);
  const [features, setFeatures] = useState([]);
  const [aiCredits, setAiCredits] = useState(0);

  useEffect(() => {
    loadSupporterStatus();
  }, []);

  const loadSupporterStatus = () => {
    try {
      const stored = localStorage.getItem(SUPPORTER_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setIsSupporter(data.supporter === true);
        setFeatures(data.features || []);
        setAiCredits(data.ai_credits || 0);
      }
    } catch (error) {
      console.error('Failed to load supporter status', error);
    }
  };

  const activateSupporterPack = (packData) => {
    try {
      const data = {
        supporter: true,
        features: packData.features || [],
        ai_credits: packData.ai_credits || 0,
        activated_at: new Date().toISOString(),
      };
      localStorage.setItem(SUPPORTER_KEY, JSON.stringify(data));
      setIsSupporter(true);
      setFeatures(data.features);
      setAiCredits(data.ai_credits);
    } catch (error) {
      console.error('Failed to activate supporter pack', error);
      throw error;
    }
  };

  const hasFeature = (featureName) => {
    if (!isSupporter) return false;
    return features.includes(featureName);
  };

  const useAiCredit = () => {
    if (aiCredits > 0) {
      const newCredits = aiCredits - 1;
      setAiCredits(newCredits);
      try {
        const stored = JSON.parse(localStorage.getItem(SUPPORTER_KEY) || '{}');
        stored.ai_credits = newCredits;
        localStorage.setItem(SUPPORTER_KEY, JSON.stringify(stored));
      } catch (error) {
        console.error('Failed to update AI credits', error);
      }
      return true;
    }
    return false;
  };

  return {
    isSupporter,
    features,
    aiCredits,
    activateSupporterPack,
    hasFeature,
    useAiCredit,
  };
}

