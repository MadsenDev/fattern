/**
 * Theme registry and utilities
 */
import { lightTheme } from './light';
import { darkTheme } from './dark';

/**
 * Default --f-* design tokens for dark/ambient themes.
 * These mirror the :root defaults in index.css so that switching away
 * from the light theme always restores the correct dark ambient look.
 */
const darkTokens = {
  '--f-bg-base':     '#0d1a14',
  '--f-bg-mid':      '#111820',
  '--f-bg-dark':     '#0e1118',
  '--f-bg-gradient': 'linear-gradient(160deg, #0d1a14 0%, #111820 50%, #0e1118 100%)',
  '--f-bg-radial':   [
    'radial-gradient(ellipse 80% 60% at 15% 20%,  rgba(45,180,130,0.28) 0%, transparent 60%)',
    'radial-gradient(ellipse 60% 50% at 85% 80%,  rgba(80,140,220,0.22) 0%, transparent 55%)',
    'radial-gradient(ellipse 50% 40% at 60% 10%,  rgba(160,100,220,0.12) 0%, transparent 50%)',
  ].join(',\n      '),

  '--f-surface':          'rgba(255,255,255,0.05)',
  '--f-surface-hover':    'rgba(255,255,255,0.08)',
  '--f-surface-elevated': 'rgba(10,18,14,0.65)',
  '--f-surface-topbar':   'rgba(10,18,14,0.6)',
  '--f-surface-rail':     'rgba(8,15,11,0.5)',
  '--f-surface-bottom':   'rgba(8,14,10,0.55)',

  '--f-border':            'rgba(255,255,255,0.08)',
  '--f-border-subtle':     'rgba(255,255,255,0.06)',
  '--f-border-faint':      'rgba(255,255,255,0.04)',
  '--f-border-top':        'rgba(255,255,255,0.07)',
  // (--f-green* and --f-border-green* are always derived from colors.accent
  //  by computeAccentTokens() in applyTheme — no static values needed here)

  '--f-blue':        'rgba(80,140,220,0.9)',
  '--f-blue-bg':     'rgba(80,140,220,0.14)',
  '--f-blue-border': 'rgba(80,140,220,0.2)',
  '--f-blue-text':   'rgba(100,160,240,0.9)',

  '--f-text':        'rgba(255,255,255,0.9)',
  '--f-text-body':   'rgba(255,255,255,0.82)',
  '--f-text-soft':   'rgba(255,255,255,0.45)',
  '--f-text-subtle': 'rgba(255,255,255,0.28)',
  '--f-text-muted':  'rgba(255,255,255,0.20)',
  '--f-text-label':  'rgba(255,255,255,0.35)',

  '--f-warn':          '#f0b840',
  '--f-warn-bg':       'rgba(240,184,64,0.14)',
  '--f-warn-border':   'rgba(240,184,64,0.2)',
  '--f-danger':        '#f07860',
  '--f-danger-bg':     'rgba(240,120,96,0.14)',
  '--f-danger-border': 'rgba(240,120,96,0.2)',
  '--f-danger-text':   'rgba(250,140,110,0.9)',

  '--f-glass-hero-bg':           'rgba(255,255,255,0.05)',
  '--f-glass-hero-border':       'rgba(255,255,255,0.1)',
  '--f-glass-hero-inner-shadow': 'rgba(255,255,255,0.1)',
  '--f-glass-hero-outer-shadow': 'rgba(0,0,0,0.25)',

  '--f-scrollbar-thumb':       'rgba(255,255,255,0.12)',
  '--f-scrollbar-thumb-hover': 'rgba(255,255,255,0.22)',
};
import { oceanTheme } from './ocean';
import { forestTheme } from './forest';
import { sunsetTheme } from './sunset';
import { midnightTheme } from './midnight';
import { slateTheme } from './slate';

export const themes = [
  lightTheme,
  darkTheme,
  oceanTheme,
  forestTheme,
  sunsetTheme,
  midnightTheme,
  slateTheme,
];

/**
 * Lighten a hex color by a percentage (0-1)
 */
function lightenColor(hex, percent) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * percent));
  const newG = Math.min(255, Math.floor(g + (255 - g) * percent));
  const newB = Math.min(255, Math.floor(b + (255 - b) * percent));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Darken a hex color by a percentage (0-1)
 */
function darkenColor(hex, percent) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  const newR = Math.max(0, Math.floor(r * (1 - percent)));
  const newG = Math.max(0, Math.floor(g * (1 - percent)));
  const newB = Math.max(0, Math.floor(b * (1 - percent)));
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Generate brand color scale from a base accent color
 */
function generateBrandScale(accentColor, isDark = false) {
  // Use accent color as brand-600
  const brand600 = accentColor;
  
  if (isDark) {
    // For dark themes, generate lighter shades
    return {
      50: darkenColor(brand600, 0.95),
      100: darkenColor(brand600, 0.90),
      200: darkenColor(brand600, 0.80),
      300: darkenColor(brand600, 0.70),
      400: darkenColor(brand600, 0.50),
      500: darkenColor(brand600, 0.30),
      600: brand600,
      700: lightenColor(brand600, 0.20),
      800: lightenColor(brand600, 0.35),
      900: lightenColor(brand600, 0.50),
      950: lightenColor(brand600, 0.65),
    };
  } else {
    // For light themes, generate standard scale
    return {
      50: lightenColor(brand600, 0.95),
      100: lightenColor(brand600, 0.90),
      200: lightenColor(brand600, 0.80),
      300: lightenColor(brand600, 0.70),
      400: lightenColor(brand600, 0.50),
      500: lightenColor(brand600, 0.30),
      600: brand600,
      700: darkenColor(brand600, 0.20),
      800: darkenColor(brand600, 0.35),
      900: darkenColor(brand600, 0.50),
      950: darkenColor(brand600, 0.65),
    };
  }
}

/**
 * Create a theme variant with a custom accent color
 */
export function createThemeVariant(baseTheme, accentColor) {
  if (!baseTheme.accentOptions) {
    return baseTheme; // Not a free theme, return as-is
  }

  const isDark = baseTheme.id === 'dark';
  const brandScale = generateBrandScale(accentColor, isDark);

  // Create a modified theme with the new accent color and brand scale
  const variant = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      brand: brandScale,
      accent: accentColor,
      moss: isDark ? lightenColor(accentColor, 0.20) : darkenColor(accentColor, 0.20),
    },
  };

  return variant;
}

/**
 * Get theme by ID
 */
export function getTheme(themeId) {
  return themes.find((t) => t.id === themeId) || lightTheme;
}

/**
 * Get all available themes
 */
export function getAllThemes() {
  return themes;
}

/**
 * Get free themes only
 */
export function getFreeThemes() {
  return themes.filter((t) => !t.premium);
}

/**
 * Get premium themes only
 */
export function getPremiumThemes() {
  return themes.filter((t) => t.premium);
}

/**
 * Convert hex color to RGB values (space-separated)
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0 0 0';
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `${r} ${g} ${b}`;
}

/**
 * Derive --f-green* and --f-border-green* tokens from any accent hex color.
 * These are the tokens actually consumed by every UI component — they must
 * track the user's chosen accent or color picker changes are invisible.
 *
 * isLight = true  → accent will appear on a white/light background (needs
 *                   a much darker shade for readable text)
 * isLight = false → accent will appear on a dark background (can use a
 *                   slightly lightened shade for text)
 */
function computeAccentTokens(hex, isLight) {
  const rgb = hexToRgb(hex);           // "R G B"
  const [r, g, b] = rgb.split(' ');    // individual channel strings

  if (isLight) {
    // Text on white: darken substantially for WCAG contrast
    const textHex = darkenColor(hex, 0.38);
    const textDimHex = darkenColor(hex, 0.20);
    return {
      '--f-green':             hex,
      '--f-green-dim':         `rgba(${r},${g},${b},0.25)`,
      '--f-green-bright':      `rgba(${r},${g},${b},0.90)`,
      '--f-green-glow':        `rgba(${r},${g},${b},0.30)`,
      '--f-green-bg':          `rgba(${r},${g},${b},0.10)`,
      '--f-green-bg-pill':     `rgba(${r},${g},${b},0.10)`,
      '--f-green-text':        textHex,
      '--f-green-text-dim':    `rgba(${r},${g},${b},0.70)`,
      '--f-green-shadow':      `rgba(${r},${g},${b},0.25)`,
      '--f-border-green':      `rgba(${r},${g},${b},0.30)`,
      '--f-border-green-pill': `rgba(${r},${g},${b},0.20)`,
    };
  } else {
    // Text on dark: lighten slightly for brightness / vibrancy
    const textHex = lightenColor(hex, 0.15);
    return {
      '--f-green':             hex,
      '--f-green-dim':         `rgba(${r},${g},${b},0.35)`,
      '--f-green-bright':      `rgba(${r},${g},${b},0.90)`,
      '--f-green-glow':        `rgba(${r},${g},${b},0.50)`,
      '--f-green-bg':          `rgba(${r},${g},${b},0.18)`,
      '--f-green-bg-pill':     `rgba(${r},${g},${b},0.14)`,
      '--f-green-text':        `${textHex}`,
      '--f-green-text-dim':    `rgba(${r},${g},${b},0.70)`,
      '--f-green-shadow':      `rgba(${r},${g},${b},0.30)`,
      '--f-border-green':      `rgba(${r},${g},${b},0.35)`,
      '--f-border-green-pill': `rgba(${r},${g},${b},0.20)`,
    };
  }
}

/**
 * Apply theme to document
 */
export function applyTheme(theme) {
  if (!theme) return;

  const root = document.documentElement;
  const colors = theme.colors;

  // Apply brand colors (both hex and RGB)
  Object.entries(colors.brand).forEach(([key, value]) => {
    root.style.setProperty(`--color-brand-${key}`, value);
    root.style.setProperty(`--color-brand-${key}-rgb`, hexToRgb(value));
  });

  // Apply semantic colors (both hex and RGB)
  root.style.setProperty('--color-ink', colors.ink);
  root.style.setProperty('--color-ink-rgb', hexToRgb(colors.ink));
  root.style.setProperty('--color-ink-soft', colors['ink-soft']);
  root.style.setProperty('--color-ink-soft-rgb', hexToRgb(colors['ink-soft']));
  root.style.setProperty('--color-ink-subtle', colors['ink-subtle']);
  root.style.setProperty('--color-ink-subtle-rgb', hexToRgb(colors['ink-subtle']));
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-rgb', hexToRgb(colors.accent));
  root.style.setProperty('--color-moss', colors.moss);
  root.style.setProperty('--color-moss-rgb', hexToRgb(colors.moss));
  root.style.setProperty('--color-cloud', colors.cloud);
  root.style.setProperty('--color-cloud-rgb', hexToRgb(colors.cloud));
  root.style.setProperty('--color-mist', colors.mist);
  root.style.setProperty('--color-mist-rgb', hexToRgb(colors.mist));
  root.style.setProperty('--color-sand', colors.sand);
  root.style.setProperty('--color-sand-rgb', hexToRgb(colors.sand));
  root.style.setProperty('--color-foam', colors.foam);
  root.style.setProperty('--color-foam-rgb', hexToRgb(colors.foam));
  root.style.setProperty('--color-tide', colors.tide);
  root.style.setProperty('--color-tide-rgb', hexToRgb(colors.tide));
  root.style.setProperty('--color-white', colors.white);
  root.style.setProperty('--color-black', colors.black);

  // Apply --f-* design tokens (theme-specific or dark defaults)
  const tokens = theme.tokens || darkTokens;
  Object.entries(tokens).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });

  // Derive --f-green* / --f-border-green* from the theme's actual accent color.
  // These are what every UI component reads — the static token object sets a
  // reasonable default but accent picker changes must override it here.
  const isLight = !!theme.tokens; // themes with custom tokens are light-scheme
  const accentTokens = computeAccentTokens(colors.accent, isLight);
  Object.entries(accentTokens).forEach(([prop, value]) => {
    root.style.setProperty(prop, value);
  });

  // Update color scheme
  if (isLight) {
    root.style.setProperty('color-scheme', 'light');
  } else {
    root.style.setProperty('color-scheme', 'dark');
  }
}

