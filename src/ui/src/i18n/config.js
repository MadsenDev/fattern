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
