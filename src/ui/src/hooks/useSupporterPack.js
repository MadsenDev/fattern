import { useState, useEffect } from 'react';
import { getCreditBalance, useCredits, loadCreditLedger } from '../utils/creditSecurity';

const SUPPORTER_KEY = 'fattern:supporter';

export function useSupporterPack() {
  // Initialize from localStorage immediately to avoid delay
  const getInitialSupporterStatus = () => {
    try {
      const stored = localStorage.getItem(SUPPORTER_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          supporter: data.supporter === true,
          features: data.features || [],
          aiCredits: data.ai_credits || 0,
        };
      }
    } catch (error) {
      console.error('Failed to load supporter status', error);
    }
    return { supporter: false, features: [], aiCredits: 0 };
  };

  const initial = getInitialSupporterStatus();
  const [isSupporter, setIsSupporter] = useState(initial.supporter);
  const [features, setFeatures] = useState(initial.features);
  const [aiCredits, setAiCredits] = useState(initial.aiCredits);

  useEffect(() => {
    loadSupporterStatus();
    // Load credits from secure ledger
    loadSecureCredits();
    
    // Refresh credits periodically to catch any external changes
    const interval = setInterval(() => {
      loadSecureCredits();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadSecureCredits = async () => {
    try {
      const balance = await getCreditBalance();
      setAiCredits(balance);
    } catch (error) {
      console.error('Failed to load secure credits', error);
      // Fallback to old system if secure system fails
      const stored = localStorage.getItem(SUPPORTER_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setAiCredits(data.ai_credits || 0);
      }
    }
  };

  const loadSupporterStatus = () => {
    try {
      const stored = localStorage.getItem(SUPPORTER_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setIsSupporter(data.supporter === true);
        setFeatures(data.features || []);
        setAiCredits(data.ai_credits || 0);
      } else {
        // Clear state if not in localStorage
        setIsSupporter(false);
        setFeatures([]);
        setAiCredits(0);
      }
    } catch (error) {
      console.error('Failed to load supporter status', error);
    }
  };

  const activateSupporterPack = async (packData) => {
    try {
      const data = {
        supporter: true,
        features: packData.features || [],
        activated_at: new Date().toISOString(),
      };
      localStorage.setItem(SUPPORTER_KEY, JSON.stringify(data));
      setIsSupporter(true);
      setFeatures(data.features);
      
      // Initialize secure credit ledger if credits provided
      if (packData.ai_credits && packData.ai_credits > 0) {
        const { initializeCreditsFromPurchase } = await import('../utils/creditSecurity');
        await initializeCreditsFromPurchase(packData.ai_credits, {
          purchase_date: new Date().toISOString(),
          pack_type: 'supporter',
        });
        const balance = await getCreditBalance();
        setAiCredits(balance);
      } else {
        setAiCredits(0);
      }
    } catch (error) {
      console.error('Failed to activate supporter pack', error);
      throw error;
    }
  };

  const hasFeature = (featureName) => {
    if (!isSupporter) return false;
    return features.includes(featureName);
  };

  const useAiCredit = async (amount = 1) => {
    if (!isSupporter) return false;
    
    try {
      const result = await useCredits(amount);
      if (result.success) {
        const newBalance = await getCreditBalance();
        setAiCredits(newBalance);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to use AI credit', error);
      return false;
    }
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

