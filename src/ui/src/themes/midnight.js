import { makeDarkTokens } from './tokens';

/**
 * Midnight Theme - Premium dark theme
 * Deep purple-black ambient with rich violet accents.
 */
export const midnightTheme = {
  id: 'midnight',
  name: 'Midnatt',
  premium: true,
  dark: true,
  colors: {
    brand: {
      50:  '#3b0764',
      100: '#581c87',
      200: '#6b21a8',
      300: '#7e22ce',
      400: '#9333ea',
      500: '#a855f7',
      600: '#c084fc',
      700: '#d8b4fe',
      800: '#e9d5ff',
      900: '#f3e8ff',
      950: '#faf5ff',
    },
    ink:          '#f1f5f9',
    'ink-soft':   '#cbd5e1',
    'ink-subtle': '#94a3b8',
    accent: '#c084fc',
    moss:   '#a855f7',
    cloud: '#130d1a',
    mist:  '#1e1228',
    sand:  '#2a1a38',
    foam:  '#3d2654',
    tide:  '#5b3a78',
    white: '#1e1228',
    black: '#f1f5f9',
  },

  tokens: makeDarkTokens(
    {
      bgBase:     '#130d1a',
      bgMid:      '#1a1128',
      bgDark:     '#0f0d18',
      bgGradient: 'linear-gradient(160deg, #130d1a 0%, #1a1128 50%, #0f0d18 100%)',
      bgRadial: [
        'radial-gradient(ellipse 80% 60% at 15% 20%,  rgba(160,80,240,0.22) 0%, transparent 60%)',
        'radial-gradient(ellipse 60% 50% at 85% 80%,  rgba(100,60,200,0.16) 0%, transparent 55%)',
        'radial-gradient(ellipse 50% 40% at 60% 10%,  rgba(200,100,255,0.09) 0%, transparent 50%)',
      ].join(',\n      '),
    },
    {
      // Purple-tinted glass surfaces
      '--f-surface':          'rgba(180,100,255,0.05)',
      '--f-surface-hover':    'rgba(180,100,255,0.08)',
      '--f-surface-elevated': 'rgba(18,10,28,0.65)',
      '--f-surface-topbar':   'rgba(15,8,24,0.70)',
      '--f-surface-rail':     'rgba(12,6,20,0.60)',
      '--f-surface-bottom':   'rgba(12,6,20,0.65)',
      // Purple-tinted glass hero
      '--f-glass-hero-bg':           'rgba(180,100,255,0.05)',
      '--f-glass-hero-border':       'rgba(255,255,255,0.09)',
      '--f-glass-hero-inner-shadow': 'rgba(255,255,255,0.07)',
      '--f-glass-hero-outer-shadow': 'rgba(0,0,0,0.35)',
    },
  ),
};
