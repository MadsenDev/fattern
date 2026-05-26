/**
 * Dark Theme - Free theme
 * Deep dark with teal accents, excellent contrast
 */
export const darkTheme = {
  id: 'dark',
  name: 'Mørk',
  premium: false,
  dark: true,
  accentOptions: [
    { name: 'Turkis', color: '#2dd4bf' }, // Standard
    { name: 'Blå', color: '#60a5fa' },
    { name: 'Grønn', color: '#4ade80' },
    { name: 'Lilla', color: '#c084fc' },
    { name: 'Oransje', color: '#fb923c' },
    { name: 'Rosa', color: '#f472b6' },
  ],
  colors: {
    // Brand colors - inverted for dark mode
    brand: {
      50: '#042f2e',
      100: '#134e4a',
      200: '#115e59',
      300: '#0f766e',
      400: '#0d9488',
      500: '#14b8a6',
      600: '#2dd4bf',
      700: '#5eead4',
      800: '#99f6e4',
      900: '#ccfbf1',
      950: '#f0fdfa',
    },
    // Text colors - light for dark backgrounds
    ink: '#f1f5f9',
    'ink-soft': '#cbd5e1',
    'ink-subtle': '#94a3b8',
    // Accent colors - bright and visible
    accent: '#2dd4bf',
    moss: '#5eead4',
    // Background colors - deep and comfortable
    cloud: '#0f172a',
    mist: '#1e293b',
    sand: '#334155',
    foam: '#475569',
    tide: '#64748b',
    // Base colors
    white: '#1e293b',
    black: '#f1f5f9',
  },
};
