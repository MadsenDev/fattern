import { FiSettings, FiBriefcase, FiMonitor, FiSliders, FiUpload, FiFileText, FiInfo, FiCode, FiFile } from 'react-icons/fi';

export const SETTING_CATEGORIES = [
  { id: 'general', label: 'Generelt', icon: FiSettings, description: 'App-innstillinger' },
  { id: 'defaults', label: 'Standarder', icon: FiSliders, description: 'Standardverdier' },
  { id: 'invoice', label: 'Faktura', icon: FiFile, description: 'Fakturainnstillinger' },
  { id: 'company', label: 'Selskap', icon: FiBriefcase, description: 'Selskapinformasjon' },
  { id: 'templates', label: 'Maler', icon: FiFileText, description: 'Fakturamaler' },
  { id: 'appearance', label: 'Utseende', icon: FiMonitor, description: 'Tilpasninger' },
  { id: 'import', label: 'Import', icon: FiUpload, description: 'Importer data' },
  { id: 'about', label: 'Om', icon: FiInfo, description: 'Om appen' },
  { id: 'dev', label: 'Utvikler', icon: FiCode, description: 'Utviklerverktøy', hidden: true },
];

export const CATEGORY_DESCRIPTIONS = {
  general: 'Administrer generelle app-innstillinger',
  defaults: 'Sett standardverdier for visninger og preferanser',
  invoice: 'Standardverdier og innstillinger for fakturaer',
  company: 'Vis og administrer selskapinformasjon',
  templates: 'Administrer faktura maler og velg standard',
  appearance: 'Tilpass appens utseende',
  import: 'Importer data fra CSV eller SAF-T filer',
  dev: 'Utviklerverktøy og tester',
};

