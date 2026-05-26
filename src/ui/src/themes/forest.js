import { makeLightTokens } from './tokens';

/**
 * Forest Theme - Premium light theme
 * Natural forest greens on a clean white canvas.
 */
export const forestTheme = {
  id: 'forest',
  name: 'Skog',
  premium: true,
  colors: {
    brand: {
      50:  '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    ink:          '#0f172a',
    'ink-soft':   '#1e3a26',
    'ink-subtle': '#2d5038',
    accent: '#16a34a',
    moss:   '#15803d',
    cloud: '#ffffff',
    mist:  '#f2fbf4',
    sand:  '#e8f6ec',
    foam:  '#dcfce7',
    tide:  '#bbf7d0',
    white: '#ffffff',
    black: '#0f172a',
  },

  tokens: makeLightTokens({
    bgBase:     '#EFF8F2',
    bgMid:      '#EEF5EE',
    bgDark:     '#EDF5F0',
    bgGradient: 'linear-gradient(160deg, #EFF8F2 0%, #EEF5EE 50%, #EDF5F0 100%)',
    bgRadial: [
      'radial-gradient(ellipse 70% 50% at 10% 15%, rgba(22,163,74,0.10) 0%, transparent 55%)',
      'radial-gradient(ellipse 55% 45% at 88% 85%, rgba(80,200,120,0.07) 0%, transparent 50%)',
      'radial-gradient(ellipse 45% 35% at 65% 5%,  rgba(60,180,80,0.04) 0%, transparent 45%)',
    ].join(',\n      '),
  }),
};
