import { makeLightTokens } from './tokens';

/**
 * Slate Theme - Premium light theme
 * Sophisticated cool-gray monochrome with subtle blue undertones.
 */
export const slateTheme = {
  id: 'slate',
  name: 'Skifer',
  premium: true,
  colors: {
    brand: {
      50:  '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    ink:          '#0f172a',
    'ink-soft':   '#334155',
    'ink-subtle': '#475569',
    accent: '#475569',
    moss:   '#334155',
    cloud: '#ffffff',
    mist:  '#f8fafc',
    sand:  '#f1f5f9',
    foam:  '#e2e8f0',
    tide:  '#cbd5e1',
    white: '#ffffff',
    black: '#0f172a',
  },

  tokens: makeLightTokens({
    bgBase:     '#F5F7FA',
    bgMid:      '#F1F5F9',
    bgDark:     '#EEF1F5',
    bgGradient: 'linear-gradient(160deg, #F5F7FA 0%, #F1F5F9 50%, #EEF1F5 100%)',
    bgRadial: [
      'radial-gradient(ellipse 70% 50% at 10% 15%, rgba(71,85,105,0.07) 0%, transparent 55%)',
      'radial-gradient(ellipse 55% 45% at 88% 85%, rgba(100,116,139,0.05) 0%, transparent 50%)',
      'radial-gradient(ellipse 45% 35% at 65% 5%,  rgba(148,163,184,0.04) 0%, transparent 45%)',
    ].join(',\n      '),
  }),
};
