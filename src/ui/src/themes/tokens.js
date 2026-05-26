/**
 * Token factories for --f-* CSS custom properties.
 *
 * Each theme supplies its bg/radial overrides; everything else
 * (surfaces, borders, text, status, glass, scrollbar) is shared
 * per colour-scheme so all light themes look consistent and all
 * dark themes look consistent.
 *
 * --f-green* / --f-border-green* are NOT included here — they are
 * always derived dynamically from colors.accent by applyTheme().
 */

const SHARED_LIGHT = {
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

  // Blue status accents (used for "sent" status pills)
  '--f-blue':        'rgba(40,100,200,0.90)',
  '--f-blue-bg':     'rgba(40,100,200,0.09)',
  '--f-blue-border': 'rgba(40,100,200,0.18)',
  '--f-blue-text':   '#1555a0',

  // Text — dark on light for readability
  '--f-text':        'rgba(26,31,28,0.90)',
  '--f-text-body':   'rgba(26,31,28,0.82)',
  '--f-text-soft':   'rgba(26,31,28,0.45)',
  '--f-text-subtle': 'rgba(0,0,0,0.28)',
  '--f-text-muted':  'rgba(0,0,0,0.20)',
  '--f-text-label':  'rgba(0,0,0,0.35)',

  // Status — warm/rich for white backgrounds
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
};

const SHARED_DARK = {
  // Surfaces — near-transparent on dark backgrounds
  '--f-surface':          'rgba(255,255,255,0.05)',
  '--f-surface-hover':    'rgba(255,255,255,0.08)',
  '--f-surface-elevated': 'rgba(10,18,14,0.65)',
  '--f-surface-topbar':   'rgba(10,18,14,0.60)',
  '--f-surface-rail':     'rgba(8,15,11,0.50)',
  '--f-surface-bottom':   'rgba(8,14,10,0.55)',

  // Borders — light-on-dark (low alpha)
  '--f-border':        'rgba(255,255,255,0.08)',
  '--f-border-subtle': 'rgba(255,255,255,0.06)',
  '--f-border-faint':  'rgba(255,255,255,0.04)',
  '--f-border-top':    'rgba(255,255,255,0.07)',

  // Blue status accents
  '--f-blue':        'rgba(80,140,220,0.90)',
  '--f-blue-bg':     'rgba(80,140,220,0.14)',
  '--f-blue-border': 'rgba(80,140,220,0.20)',
  '--f-blue-text':   'rgba(100,160,240,0.90)',

  // Text — light on dark
  '--f-text':        'rgba(255,255,255,0.90)',
  '--f-text-body':   'rgba(255,255,255,0.82)',
  '--f-text-soft':   'rgba(255,255,255,0.45)',
  '--f-text-subtle': 'rgba(255,255,255,0.28)',
  '--f-text-muted':  'rgba(255,255,255,0.20)',
  '--f-text-label':  'rgba(255,255,255,0.35)',

  // Status
  '--f-warn':          '#f0b840',
  '--f-warn-bg':       'rgba(240,184,64,0.14)',
  '--f-warn-border':   'rgba(240,184,64,0.20)',
  '--f-danger':        '#f07860',
  '--f-danger-bg':     'rgba(240,120,96,0.14)',
  '--f-danger-border': 'rgba(240,120,96,0.20)',
  '--f-danger-text':   'rgba(250,140,110,0.90)',

  // Glass hero
  '--f-glass-hero-bg':           'rgba(255,255,255,0.05)',
  '--f-glass-hero-border':       'rgba(255,255,255,0.10)',
  '--f-glass-hero-inner-shadow': 'rgba(255,255,255,0.10)',
  '--f-glass-hero-outer-shadow': 'rgba(0,0,0,0.25)',

  // Scrollbar
  '--f-scrollbar-thumb':       'rgba(255,255,255,0.12)',
  '--f-scrollbar-thumb-hover': 'rgba(255,255,255,0.22)',
};

/**
 * Build tokens for a light-scheme theme.
 * @param {object} bg  Background layer overrides: bgBase, bgMid, bgDark, bgGradient, bgRadial
 */
export function makeLightTokens({ bgBase, bgMid, bgDark, bgGradient, bgRadial }) {
  return {
    '--f-bg-base':     bgBase,
    '--f-bg-mid':      bgMid,
    '--f-bg-dark':     bgDark,
    '--f-bg-gradient': bgGradient,
    '--f-bg-radial':   bgRadial,
    ...SHARED_LIGHT,
  };
}

/**
 * Build tokens for a dark-scheme theme.
 * @param {object} bg  Background layer overrides: bgBase, bgMid, bgDark, bgGradient, bgRadial
 * @param {object} surfaceOverrides  Optional surface/border overrides for tinted dark themes.
 */
export function makeDarkTokens({ bgBase, bgMid, bgDark, bgGradient, bgRadial }, surfaceOverrides = {}) {
  return {
    '--f-bg-base':     bgBase,
    '--f-bg-mid':      bgMid,
    '--f-bg-dark':     bgDark,
    '--f-bg-gradient': bgGradient,
    '--f-bg-radial':   bgRadial,
    ...SHARED_DARK,
    ...surfaceOverrides,
  };
}

/** Default dark ambient background (green-biased, matches original index.css) */
export const defaultDarkBg = {
  bgBase:     '#0d1a14',
  bgMid:      '#111820',
  bgDark:     '#0e1118',
  bgGradient: 'linear-gradient(160deg, #0d1a14 0%, #111820 50%, #0e1118 100%)',
  bgRadial: [
    'radial-gradient(ellipse 80% 60% at 15% 20%,  rgba(45,180,130,0.28) 0%, transparent 60%)',
    'radial-gradient(ellipse 60% 50% at 85% 80%,  rgba(80,140,220,0.22) 0%, transparent 55%)',
    'radial-gradient(ellipse 50% 40% at 60% 10%,  rgba(160,100,220,0.12) 0%, transparent 50%)',
  ].join(',\n      '),
};
