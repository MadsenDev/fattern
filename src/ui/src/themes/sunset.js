import { makeLightTokens } from './tokens';

/**
 * Sunset Theme - Premium light theme
 * Warm amber and orange accents on a creamy white background.
 */
export const sunsetTheme = {
  id: 'sunset',
  name: 'Solnedgang',
  premium: true,
  colors: {
    brand: {
      50:  '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      950: '#451a03',
    },
    ink:          '#1c1008',
    'ink-soft':   '#44280a',
    'ink-subtle': '#6b4010',
    accent: '#d97706',
    moss:   '#b45309',
    cloud: '#ffffff',
    mist:  '#fffbf0',
    sand:  '#fef6e4',
    foam:  '#fef0c7',
    tide:  '#fde68a',
    white: '#ffffff',
    black: '#1c1008',
  },

  tokens: makeLightTokens({
    bgBase:     '#FFF9F0',
    bgMid:      '#FFFBF0',
    bgDark:     '#FFF5EC',
    bgGradient: 'linear-gradient(160deg, #FFF9F0 0%, #FFFBF0 50%, #FFF5EC 100%)',
    bgRadial: [
      'radial-gradient(ellipse 70% 50% at 10% 15%, rgba(217,119,6,0.09) 0%, transparent 55%)',
      'radial-gradient(ellipse 55% 45% at 88% 85%, rgba(245,158,11,0.07) 0%, transparent 50%)',
      'radial-gradient(ellipse 45% 35% at 65% 5%,  rgba(220,80,40,0.04)  0%, transparent 45%)',
    ].join(',\n      '),
  }),
};
