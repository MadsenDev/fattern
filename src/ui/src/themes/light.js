/**
 * Light Theme - Default free theme
 * Refined teal palette with excellent contrast and readability
 */
export const lightTheme = {
  id: 'light',
  name: 'Lys',
  premium: false,
  accentOptions: [
    { name: 'Teal', color: '#0d9488' }, // Default
    { name: 'Blue', color: '#2563eb' },
    { name: 'Green', color: '#16a34a' },
    { name: 'Purple', color: '#9333ea' },
    { name: 'Orange', color: '#d97706' },
    { name: 'Pink', color: '#db2777' },
  ],
  colors: {
    // Brand colors - refined teal palette
    brand: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      950: '#042f2e',
    },
    // Text colors - high contrast for readability
    ink: '#0f172a',
    'ink-soft': '#475569',
    'ink-subtle': '#64748b',
    // Accent colors
    accent: '#0d9488',
    moss: '#14b8a6',
    // Background colors - subtle and clean
    cloud: '#ffffff',
    mist: '#f8fafc',
    sand: '#f1f5f9',
    foam: '#e2e8f0',
    tide: '#cbd5e1',
    // Base colors
    white: '#ffffff',
    black: '#0f172a',
  },
};

