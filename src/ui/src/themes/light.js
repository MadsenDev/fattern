import { makeLightTokens } from './tokens';

/**
 * Light Theme - Default free theme
 * Refined emerald-green palette with airy glassmorphism backgrounds
 * Visual reference: fattern-light-theme.jsx
 */
export const lightTheme = {
  id: 'light',
  name: 'Lys',
  premium: false,
  accentOptions: [
    { name: 'Grønn',   color: '#2abd8a' }, // Standard — matches light mockup
    { name: 'Turkis',  color: '#0d9488' },
    { name: 'Blå',     color: '#2563eb' },
    { name: 'Lilla',   color: '#9333ea' },
    { name: 'Oransje', color: '#d97706' },
    { name: 'Rosa',    color: '#db2777' },
  ],
  colors: {
    // Brand colors — emerald scale matching the light mockup
    brand: {
      50:  '#f0fdf7',
      100: '#d1fae9',
      200: '#a3f4d3',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#2abd8a',
      700: '#1a9068',
      800: '#1e7a58',
      900: '#145c42',
      950: '#0a3d2b',
    },
    // Text colors — deep for readability on light backgrounds
    ink:           '#1a1f1c',
    'ink-soft':    '#3d4a44',
    'ink-subtle':  '#637068',
    // Accent colors
    accent: '#2abd8a',
    moss:   '#1a9068',
    // Background colors — airy whites / off-whites
    cloud: '#ffffff',
    mist:  '#f5faf7',
    sand:  '#eef5f1',
    foam:  '#dff0e8',
    tide:  '#c4ddd3',
    // Base
    white: '#ffffff',
    black: '#1a1f1c',
  },

  // Design tokens — from fattern-light-theme.jsx mockup
  tokens: makeLightTokens({
    bgBase:     '#F0F7F3',
    bgMid:      '#EEF3F9',
    bgDark:     '#F2EFF8',
    bgGradient: 'linear-gradient(160deg, #F0F7F3 0%, #EEF3F9 50%, #F2EFF8 100%)',
    bgRadial: [
      'radial-gradient(ellipse 70% 50% at 10% 15%, rgba(45,180,130,0.10) 0%, transparent 55%)',
      'radial-gradient(ellipse 55% 45% at 88% 85%, rgba(80,140,220,0.08) 0%, transparent 50%)',
      'radial-gradient(ellipse 45% 35% at 65% 5%,  rgba(160,100,220,0.05) 0%, transparent 45%)',
    ].join(',\n      '),
  }),
};
