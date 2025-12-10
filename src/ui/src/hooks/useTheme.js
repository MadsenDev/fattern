import { useState, useEffect, useRef } from 'react';
import { getAllThemes, getTheme, applyTheme, getFreeThemes, createThemeVariant } from '../themes';
import { useSettings } from './useSettings';
import { useSupporterPack } from './useSupporterPack';

// Global theme state to prevent multiple instances from conflicting
// Initialize from localStorage immediately to prevent flash
let globalThemeId = (typeof window !== 'undefined' && localStorage.getItem('fattern:theme')) || 'light';
let globalTheme = getTheme(globalThemeId);
let themeInitialized = false;

export function useTheme() {
  const { getSetting, updateSetting, isLoading: settingsLoading } = useSettings();
  const { isSupporter, hasFeature } = useSupporterPack();
  
  // Initialize with theme from localStorage to prevent flash
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (globalTheme) return globalTheme;
    const cachedThemeId = localStorage.getItem('fattern:theme') || 'light';
    const cachedTheme = getTheme(cachedThemeId);
    // Apply immediately to prevent flash
    applyTheme(cachedTheme);
    return cachedTheme;
  });
  // Initialize with free themes so they're available immediately
  const [availableThemes, setAvailableThemes] = useState(() => getFreeThemes());
  const initializedRef = useRef(false);

  useEffect(() => {
    // While settings are loading, use global theme to prevent flash
    if (settingsLoading) {
      if (globalTheme) {
        // Only apply if not already set (to avoid unnecessary DOM updates)
        const currentThemeId = currentTheme?.id;
        if (currentThemeId !== globalTheme.id) {
          setCurrentTheme(globalTheme);
        }
        applyTheme(globalTheme);
      }
      return;
    }
    
    // Settings loaded, now sync with database
    const dbThemeId = getSetting('app.theme', null);
    const localStorageThemeId = localStorage.getItem('fattern:theme') || 'light';
    const themeId = dbThemeId || localStorageThemeId;
    
    // Always reload themes when supporter status changes to update available themes
    // But skip if already initialized and nothing has changed
    if (initializedRef.current && globalThemeId === themeId && globalTheme) {
      // Still update available themes if supporter status changed
      const allThemes = getAllThemes();
      const filtered = allThemes.filter((t) => {
        if (!t.premium) return true;
        return isSupporter || hasFeature('premium_themes');
      });
      setAvailableThemes(filtered);
      
      // Only update state if different
      if (currentTheme?.id !== globalTheme.id) {
        setCurrentTheme(globalTheme);
      }
      // Don't reapply theme if it's already applied (prevents flash)
      return;
    }
    
    loadTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupporter, settingsLoading]);

  const loadTheme = () => {
    // Try to get from settings, fallback to localStorage, then default
    let themeId = getSetting('app.theme', null);
    if (!themeId) {
      themeId = localStorage.getItem('fattern:theme') || 'light';
    }
    
    let theme = getTheme(themeId);
    
    // Load saved accent color if available
    if (theme.accentOptions) {
      const savedAccent = getSetting(`app.theme.${themeId}.accent`, null) || 
                         localStorage.getItem(`fattern:theme.${themeId}.accent`);
      if (savedAccent) {
        theme = createThemeVariant(theme, savedAccent);
      }
    }
    
    // Always filter available themes based on current supporter status
    const allThemes = getAllThemes();
    const filtered = allThemes.filter((t) => {
      if (!t.premium) return true; // Free themes always available
      return isSupporter || hasFeature('premium_themes');
    });
    
    setAvailableThemes(filtered);
    
    // If current theme is premium and user lost access, fall back to light
    const hasPremiumAccess = isSupporter || hasFeature('premium_themes');
    if (theme.premium && !hasPremiumAccess) {
      const fallbackTheme = getTheme('light');
      setCurrentTheme(fallbackTheme);
      applyTheme(fallbackTheme);
      updateSetting('app.theme', 'light');
      globalThemeId = 'light';
      globalTheme = fallbackTheme;
      localStorage.setItem('fattern:theme', 'light');
    } else {
      // Only update if theme actually changed
      if (currentTheme?.id !== theme.id || currentTheme?.colors?.accent !== theme.colors?.accent) {
        setCurrentTheme(theme);
      }
      applyTheme(theme);
      globalThemeId = themeId;
      globalTheme = theme;
      localStorage.setItem('fattern:theme', themeId);
    }
    
    initializedRef.current = true;
    themeInitialized = true;
  };

  const setTheme = (themeId, accentColor = null) => {
    let theme = getTheme(themeId);
    
    // Check if theme requires supporter pack
    const hasPremiumAccess = isSupporter || hasFeature('premium_themes');
    if (theme.premium && !hasPremiumAccess) {
      throw new Error('This theme requires Supporter Pack');
    }
    
    // Apply accent color if provided and theme supports it
    if (accentColor && theme.accentOptions) {
      theme = createThemeVariant(theme, accentColor);
      // Store accent color preference
      updateSetting(`app.theme.${themeId}.accent`, accentColor);
    } else if (theme.accentOptions) {
      // Load saved accent color if available
      const savedAccent = getSetting(`app.theme.${themeId}.accent`, null);
      if (savedAccent) {
        theme = createThemeVariant(theme, savedAccent);
      }
    }
    
    setCurrentTheme(theme);
    applyTheme(theme);
    updateSetting('app.theme', themeId);
    globalThemeId = themeId; // Update global state
    globalTheme = theme; // Update global theme object
    // Also store in localStorage as backup
    localStorage.setItem('fattern:theme', themeId);
    if (accentColor) {
      localStorage.setItem(`fattern:theme.${themeId}.accent`, accentColor);
    }
  };

  return {
    currentTheme,
    availableThemes,
    setTheme,
    isSupporter,
  };
}

