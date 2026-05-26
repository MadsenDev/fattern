# Loading Screen Redesign — Spec

**Date:** 2026-05-26  
**Status:** Approved

## Summary

Replace the current loading screen with a polished ambient design that uses the real Fattern logo, adapts to the user's saved theme (dark or light), and transitions smoothly into the app.

## Files changed

| File | Action |
|------|--------|
| `src/ui/index.html` | Rewrite loading screen section |
| `src/ui/src/components/LoadingScreen.jsx` | Delete (dead code — App returns `null` while loading) |
| `src/ui/src/components/TitleBar.jsx` | Replace letter "F" with `logo.png` |
| `src/ui/src/components/OnboardingFlow.jsx` | Replace `fattern-monogram.svg` → `logo.png` |
| `src/ui/src/components/settings/AboutSettings.jsx` | Replace `fattern-monogram.svg` → `logo.png` |

## Design

### Theme detection

At the top of the inline `<script>` in `index.html`, synchronously read `localStorage['fattern:theme']`. Light theme IDs: `light`, `ocean`, `forest`, `sunset`, `slate`. If the saved value is one of these, add class `theme-light` to `#loading-screen` before paint; otherwise leave it as dark (default).

### Dark variant (default)

- Background: `linear-gradient(160deg, #0d1a14 0%, #111820 50%, #0e1118 100%)`
- Two blurred orbs animating with a slow pulse:
  - Green orb: `rgba(45,180,130,0.30)`, top-left
  - Blue orb: `rgba(80,140,220,0.20)`, bottom-right
- Logo tile: `logo.png` centred in a `rgba(255,255,255,0.06)` frosted glass box with `backdrop-filter: blur(12px)`, slow glow keyframe animation
- Progress bar: 2px high, `rgba(255,255,255,0.08)` track, `linear-gradient(90deg, #2abd8a, rgba(63,217,160,0.5))` fill
- Label: `INITIALISERER · XX%` in DM Mono, `rgba(255,255,255,0.28)`

### Light variant (`.theme-light`)

Same structure. Overrides:
- Background: `linear-gradient(160deg, #F0F7F3 0%, #EEF3F9 50%, #F2EFF8 100%)`
- Orbs at 10%/8% opacity
- Logo tile: `rgba(255,255,255,0.65)` background, `rgba(255,255,255,0.9)` border, subtle drop shadow
- Progress track: `rgba(0,0,0,0.08)`, fill: `#2abd8a`
- Label: `rgba(0,0,0,0.30)`

### Exit transition

Replace hard `display: none` with:
1. Set `opacity: 0` on `#loading-screen` (CSS `transition: opacity 0.3s ease`)
2. On `transitionend`, set `display: none`
3. `#root` fades from `opacity: 0` to `opacity: 1` over 250ms simultaneously

### Progress animation

Keep existing random-increment interval (feels organic). Update interval to drive both the fill width and the percentage label.

## Out of scope

- Making the loading screen respond to theme changes mid-session (theme is fixed at startup)
- Removing `fattern-monogram.svg` from `public/` entirely (Electron `main.js` uses it as fallback for the window icon — leave it)
