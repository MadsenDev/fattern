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

  // ── Design tokens that override the --f-* CSS custom properties ──────────
  // Values derived directly from the fattern-light-theme.jsx mockup.
  tokens: {
    // Background layers
    '--f-bg-base':     '#F0F7F3',
    '--f-bg-mid':      '#EEF3F9',
    '--f-bg-dark':     '#F2EFF8',
    '--f-bg-gradient': 'linear-gradient(160deg, #F0F7F3 0%, #EEF3F9 50%, #F2EFF8 100%)',
    '--f-bg-radial':   [
      'radial-gradient(ellipse 70% 50% at 10% 15%, rgba(45,180,130,0.10) 0%, transparent 55%)',
      'radial-gradient(ellipse 55% 45% at 88% 85%, rgba(80,140,220,0.08) 0%, transparent 50%)',
      'radial-gradient(ellipse 45% 35% at 65% 5%,  rgba(160,100,220,0.05) 0%, transparent 45%)',
    ].join(',\n      '),

    // Glass surfaces — white-based frosted glass
    '--f-surface':          'rgba(255,255,255,0.60)',
    '--f-surface-hover':    'rgba(255,255,255,0.75)',
    '--f-surface-elevated': 'rgba(255,255,255,0.70)',
    '--f-surface-topbar':   'rgba(255,255,255,0.65)',
    '--f-surface-rail':     'rgba(255,255,255,0.55)',
    '--f-surface-bottom':   'rgba(255,255,255,0.55)',

    // Borders — dark-on-light (low alpha)
    '--f-border':        'rgba(0,0,0,0.07)',
    '--f-border-subtle': 'rgba(0,0,0,0.05)',
    '--f-border-faint':  'rgba(0,0,0,0.04)',
    '--f-border-top':    'rgba(0,0,0,0.07)',

    // (--f-green* and --f-border-green* are always derived from colors.accent
    //  by computeAccentTokens() in applyTheme — no static values needed here)

    // Blue / purple accents
    '--f-blue':        'rgba(40,100,200,0.90)',
    '--f-blue-bg':     'rgba(40,100,200,0.09)',
    '--f-blue-border': 'rgba(40,100,200,0.18)',
    '--f-blue-text':   '#1555a0',

    // Text — dark on light
    '--f-text':        'rgba(26,31,28,0.90)',
    '--f-text-body':   'rgba(26,31,28,0.82)',
    '--f-text-soft':   'rgba(26,31,28,0.45)',
    '--f-text-subtle': 'rgba(0,0,0,0.28)',
    '--f-text-muted':  'rgba(0,0,0,0.20)',
    '--f-text-label':  'rgba(0,0,0,0.35)',

    // Status — richer tones that read well on white
    '--f-warn':          '#b07010',
    '--f-warn-bg':       'rgba(176,112,16,0.10)',
    '--f-warn-border':   'rgba(176,112,16,0.18)',
    '--f-danger':        '#b83820',
    '--f-danger-bg':     'rgba(184,56,32,0.09)',
    '--f-danger-border': 'rgba(184,56,32,0.18)',
    '--f-danger-text':   'rgba(160,48,32,0.90)',

    // Glass hero (modals, hero card)
    '--f-glass-hero-bg':           'rgba(255,255,255,0.70)',
    '--f-glass-hero-border':       'rgba(255,255,255,0.90)',
    '--f-glass-hero-inner-shadow': 'rgba(255,255,255,0.90)',
    '--f-glass-hero-outer-shadow': 'rgba(0,0,0,0.07)',

    // Scrollbar
    '--f-scrollbar-thumb':       'rgba(0,0,0,0.12)',
    '--f-scrollbar-thumb-hover': 'rgba(0,0,0,0.22)',
  },
};
