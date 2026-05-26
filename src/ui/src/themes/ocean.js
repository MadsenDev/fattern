import { makeLightTokens } from './tokens';

/**
 * Ocean Theme - Premium light theme
 * Crisp whites and airy surfaces with deep-blue accents.
 */
export const oceanTheme = {
  id: 'ocean',
  name: 'Hav',
  premium: true,
  colors: {
    brand: {
      50:  '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554',
    },
    ink:          '#0f172a',
    'ink-soft':   '#334155',
    'ink-subtle': '#475569',
    accent: '#2563eb',
    moss:   '#1d4ed8',
    cloud: '#ffffff',
    mist:  '#f0f6ff',
    sand:  '#e8f0fe',
    foam:  '#dbeafe',
    tide:  '#bfdbfe',
    white: '#ffffff',
    black: '#0f172a',
  },

  tokens: makeLightTokens({
    bgBase:     '#EEF4FF',
    bgMid:      '#EFF3F9',
    bgDark:     '#F2EFF8',
    bgGradient: 'linear-gradient(160deg, #EEF4FF 0%, #EFF3F9 50%, #F2EFF8 100%)',
    bgRadial: [
      'radial-gradient(ellipse 70% 50% at 10% 15%, rgba(37,99,235,0.09) 0%, transparent 55%)',
      'radial-gradient(ellipse 55% 45% at 88% 85%, rgba(80,120,240,0.07) 0%, transparent 50%)',
      'radial-gradient(ellipse 45% 35% at 65% 5%,  rgba(120,80,220,0.04) 0%, transparent 45%)',
    ].join(',\n      '),
  }),
};
