# TASK 01 — Dependency Updates & Complete Norwegian Translation

## Context
Fattern is a local-first Electron + React + SQLite invoicing app for Norwegian freelancers.
The app is entirely in Norwegian in the UI, but the i18n system is incomplete.
This task has two parts: update outdated dependencies, then complete the Norwegian translation.

---

## Part 1 — Dependency Updates

### Update these packages
Run the following and fix any breaking changes:

```bash
npm install electron@latest --save-dev
npm install better-sqlite3@latest
npm install framer-motion@latest
npm install react@latest react-dom@latest
npm install react-icons@latest
npm install @vitejs/plugin-react@latest --save-dev
npm install vite@latest --save-dev
npm install tailwindcss@latest --save-dev
```

After updating, run:
```bash
npm run electron:rebuild
npm run ui:build
```

Fix any build errors before continuing. Common issues after Electron updates:
- Native module ABI mismatch — solved by `npm run electron:rebuild`
- Vite config changes — check `vite.config.js` against Vite migration guides
- Framer Motion API changes — check for deprecated `AnimatePresence` props

---

## Part 2 — Complete Norwegian Translation

### Current state
The i18n system uses `i18next`. There are two locale files:
- `src/ui/src/i18n/locales/en.json` — partial English
- `src/ui/src/i18n/locales/no.json` — partial Norwegian

The config at `src/ui/src/i18n/config.js` defaults to English and only loads the English locale. The Norwegian locale exists but is never loaded or used.

### What needs to be done

**1. Fix `src/ui/src/i18n/config.js`**

Replace the current config with one that:
- Loads both `en.json` and `no.json`
- Defaults to Norwegian (`nb` or `no`)
- Falls back to English if a key is missing

```js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEn from './locales/en.json';
import translationNo from './locales/no.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: translationEn },
    nb: { translation: translationNo },
    no: { translation: translationNo },
  },
  lng: 'nb',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
```

**2. Complete `src/ui/src/i18n/locales/no.json`**

The current file only covers `loading_screen`, `onboarding_flow`, and `dashboard_view`.

Expand it to cover every user-visible string in the app. Go through each page and component and add keys. The English file should mirror the Norwegian file exactly (same keys, English values).

Minimum coverage required:
- All page titles and section headers
- All button labels (Lagre, Avbryt, Slett, Rediger, Ny faktura, etc.)
- All form field labels
- All empty state messages ("Ingen fakturaer funnet", etc.)
- All toast/notification messages
- All modal titles and descriptions
- All status labels (Utkast, Sendt, Betalt, Forfalt, Kansellert)
- All error messages
- All confirmation dialog text
- All sidebar navigation labels
- All settings category labels and descriptions
- All table column headers

**3. Apply translations throughout the app**

The existing components mostly use hardcoded Norwegian strings. Replace hardcoded strings with `t('key')` calls using the `useTranslation` hook from `react-i18next`.

Pattern:
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <button>{t('common.save')}</button>;
}
```

Suggested key structure:
```json
{
  "common": {
    "save": "Lagre",
    "cancel": "Avbryt",
    "delete": "Slett",
    "edit": "Rediger",
    "create": "Opprett",
    "close": "Lukk",
    "confirm": "Bekreft",
    "loading": "Laster...",
    "yes": "Ja",
    "no": "Nei"
  },
  "nav": {
    "overview": "Oversikt",
    "invoices": "Fakturaer",
    "expenses": "Utgifter",
    "customers": "Kunder",
    "products": "Produkter",
    "budgetYears": "Budsjettår",
    "settings": "Innstillinger"
  },
  "invoice": {
    "title": "Fakturaer",
    "new": "Ny faktura",
    "empty": "Ingen fakturaer funnet",
    "status": {
      "draft": "Utkast",
      "sent": "Sendt",
      "paid": "Betalt",
      "overdue": "Forfalt",
      "cancelled": "Kansellert"
    }
  },
  "expense": { ... },
  "customer": { ... },
  "product": { ... },
  "settings": { ... },
  "errors": { ... }
}
```

Build out the full structure based on what's actually in the app.

**4. Update locale detection in `src/ui/src/App.jsx`**

The existing locale detection code in `App.jsx` already calls `system:get-locale` via IPC and calls `i18n.changeLanguage`. Update it to map Norwegian locales correctly:

```js
api.getLocale().then((locale) => {
  const normalized = locale.split('-')[0];
  // Map 'nb' and 'nn' to 'nb', everything else falls back to 'en'
  const lang = ['nb', 'nn', 'no'].includes(normalized) ? 'nb' : 'en';
  i18n.changeLanguage(lang);
});
```

---

## Acceptance Criteria
- `npm run ui:build` completes without errors
- `npm run electron:rebuild` completes without errors  
- App launches and displays entirely in Norwegian for Norwegian system locales
- No hardcoded Norwegian strings remain in JSX (all go through `t()`)
- All keys in `no.json` have corresponding keys in `en.json`
- The English fallback works — if a key is missing in Norwegian, English shows instead of a key name
