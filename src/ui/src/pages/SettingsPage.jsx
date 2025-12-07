import { useState, useEffect } from 'react';
import { FiSettings, FiBriefcase, FiMonitor, FiSliders, FiSave, FiEdit2, FiX, FiUpload } from 'react-icons/fi';
import { useSettings } from '../hooks/useSettings';
import { CSVImportModal } from '../components/import/CSVImportModal';
import { useToast } from '../hooks/useToast';

const SETTING_CATEGORIES = [
  { id: 'general', label: 'Generelt', icon: FiSettings, description: 'App-innstillinger' },
  { id: 'defaults', label: 'Standarder', icon: FiSliders, description: 'Standardverdier' },
  { id: 'company', label: 'Selskap', icon: FiBriefcase, description: 'Selskapinformasjon' },
  { id: 'appearance', label: 'Utseende', icon: FiMonitor, description: 'Tilpasninger' },
  { id: 'import', label: 'Import', icon: FiUpload, description: 'Importer data' },
];

export function SettingsPage({ company, onCompanyUpdate, onOpenTemplateEditor, onRefreshData }) {
  const { getSetting, updateSetting, isLoading } = useSettings();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('general');
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [csvImportModal, setCsvImportModal] = useState({ isOpen: false, type: 'customer' });
  const [companyForm, setCompanyForm] = useState({
    name: '',
    org_number: '',
    address: '',
    post_number: '',
    post_location: '',
    contact_email: '',
    contact_number: '',
    account_number: '',
    vat_rate: '25',
  });
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyError, setCompanyError] = useState('');

  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || '',
        org_number: company.org_number || '',
        address: company.address || '',
        post_number: company.post_number || '',
        post_location: company.post_location || '',
        contact_email: company.contact_email || '',
        contact_number: company.contact_number || '',
        account_number: company.account_number || '',
        vat_rate: company.vat_rate != null ? (company.vat_rate * 100).toFixed(0) : '25',
      });
    }
  }, [company]);

  const handleCompanyEdit = () => {
    setIsEditingCompany(true);
    setCompanyError('');
  };

  const handleCompanyCancel = () => {
    setIsEditingCompany(false);
    setCompanyError('');
    if (company) {
      setCompanyForm({
        name: company.name || '',
        org_number: company.org_number || '',
        address: company.address || '',
        post_number: company.post_number || '',
        post_location: company.post_location || '',
        contact_email: company.contact_email || '',
        contact_number: company.contact_number || '',
        account_number: company.account_number || '',
        vat_rate: company.vat_rate != null ? (company.vat_rate * 100).toFixed(0) : '25',
      });
    }
  };

  const handleCompanySave = async () => {
    setCompanyError('');
    setSavingCompany(true);

    if (!companyForm.name.trim()) {
      setCompanyError('Selskapsnavn er påkrevd');
      setSavingCompany(false);
      return;
    }

    const vatRate = parseFloat(companyForm.vat_rate);
    if (isNaN(vatRate) || vatRate < 0 || vatRate > 100) {
      setCompanyError('MVA-sats må være mellom 0 og 100');
      setSavingCompany(false);
      return;
    }

    try {
      const api = typeof window !== 'undefined' ? window.fattern?.db : null;
      if (api?.updateCompany) {
        await api.updateCompany({
          name: companyForm.name.trim(),
          org_number: companyForm.org_number.trim() || null,
          address: companyForm.address.trim() || null,
          post_number: companyForm.post_number.trim() || null,
          post_location: companyForm.post_location.trim() || null,
          contact_email: companyForm.contact_email.trim() || null,
          contact_number: companyForm.contact_number.trim() || null,
          account_number: companyForm.account_number.trim() || null,
          vat_rate: vatRate / 100,
        });
        setIsEditingCompany(false);
        onCompanyUpdate?.();
      }
    } catch (error) {
      console.error('Kunne ikke lagre selskapinformasjon', error);
      setCompanyError('Kunne ikke lagre endringer. Prøv igjen.');
    } finally {
      setSavingCompany(false);
    }
  };

  const productsDefaultView = getSetting('products.defaultView', 'table');
  const customersDefaultView = getSetting('customers.defaultView', 'table');

  const handleDefaultViewChange = (type, value) => {
    updateSetting(`${type}.defaultView`, value);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">Generelle innstillinger</h3>
        <p className="text-xs text-ink-subtle mb-4">Generelle app-innstillinger og preferanser</p>
      </div>

      <div className="space-y-4">
        <div className="py-3 border-b border-sand/40">
          <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider">Kommer snart</label>
          <p className="text-sm text-ink-soft mt-1.5">Flere generelle innstillinger vil bli lagt til her</p>
        </div>
      </div>
    </div>
  );

  const renderDefaultsSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">Standard visninger</h3>
        <p className="text-xs text-ink-subtle mb-4">Velg standard visningsmodus for ulike sider</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-sand/40">
          <div className="flex-1">
            <label className="text-sm font-medium text-ink">Produkter</label>
            <p className="text-xs text-ink-subtle mt-0.5">Standard visning når du åpner produktsiden</p>
          </div>
          <div className="flex rounded-lg border border-sand bg-white p-0.5">
            <button
              type="button"
              onClick={() => handleDefaultViewChange('products', 'table')}
              disabled={isLoading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                productsDefaultView === 'table'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-cloud'
              }`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => handleDefaultViewChange('products', 'card')}
              disabled={isLoading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                productsDefaultView === 'card'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-cloud'
              }`}
            >
              Kort
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-sand/40">
          <div className="flex-1">
            <label className="text-sm font-medium text-ink">Kunder</label>
            <p className="text-xs text-ink-subtle mt-0.5">Standard visning når du åpner kundesiden</p>
          </div>
          <div className="flex rounded-lg border border-sand bg-white p-0.5">
            <button
              type="button"
              onClick={() => handleDefaultViewChange('customers', 'table')}
              disabled={isLoading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                customersDefaultView === 'table'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-cloud'
              }`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => handleDefaultViewChange('customers', 'card')}
              disabled={isLoading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                customersDefaultView === 'card'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-cloud'
              }`}
            >
              Kort
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink mb-1">Selskapinformasjon</h3>
          <p className="text-xs text-ink-subtle">Informasjon om ditt selskap som brukes i fakturaer og dokumenter</p>
        </div>
        {!isEditingCompany ? (
          <button
            type="button"
            onClick={handleCompanyEdit}
            className="flex items-center gap-2 rounded-lg border border-sand bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-cloud hover:text-ink"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
            Rediger
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCompanyCancel}
              disabled={savingCompany}
              className="flex items-center gap-2 rounded-lg border border-sand bg-white px-3 py-1.5 text-xs font-medium text-ink-soft transition hover:bg-cloud hover:text-ink disabled:opacity-60"
            >
              <FiX className="h-3.5 w-3.5" />
              Avbryt
            </button>
            <button
              type="button"
              onClick={handleCompanySave}
              disabled={savingCompany}
              className="flex items-center gap-2 rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
            >
              <FiSave className="h-3.5 w-3.5" />
              {savingCompany ? 'Lagrer...' : 'Lagre'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="py-3 border-b border-sand/40">
          <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-2 block">
            Selskapsnavn *
          </label>
          {isEditingCompany ? (
            <input
              type="text"
              value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
              className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Ditt firmanavn"
            />
          ) : (
            <p className="text-sm text-ink mt-1.5">{company?.name || 'Ikke satt'}</p>
          )}
        </div>

        <div className="py-3 border-b border-sand/40">
          <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-2 block">
            Organisasjonsnummer
          </label>
          {isEditingCompany ? (
            <input
              type="text"
              value={companyForm.org_number}
              onChange={(e) => setCompanyForm({ ...companyForm, org_number: e.target.value })}
              className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="123 456 789"
            />
          ) : (
            <p className="text-sm text-ink mt-1.5">{company?.org_number || 'Ikke satt'}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="py-3 border-b border-sand/40">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-2 block">
              E-post
            </label>
            {isEditingCompany ? (
              <input
                type="email"
                value={companyForm.contact_email}
                onChange={(e) => setCompanyForm({ ...companyForm, contact_email: e.target.value })}
                className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="firma@example.com"
              />
            ) : (
              <p className="text-sm text-ink mt-1.5">{company?.contact_email || 'Ikke satt'}</p>
            )}
          </div>

          <div className="py-3 border-b border-sand/40">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-2 block">
              Telefon
            </label>
            {isEditingCompany ? (
              <input
                type="tel"
                value={companyForm.contact_number}
                onChange={(e) => setCompanyForm({ ...companyForm, contact_number: e.target.value })}
                className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="+47 123 45 678"
              />
            ) : (
              <p className="text-sm text-ink mt-1.5">{company?.contact_number || 'Ikke satt'}</p>
            )}
          </div>
        </div>

        <div className="py-3 border-b border-sand/40">
          <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-2 block">Adresse</label>
          {isEditingCompany ? (
            <input
              type="text"
              value={companyForm.address}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
              className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Gateadresse"
            />
          ) : (
            <p className="text-sm text-ink mt-1.5">{company?.address || 'Ikke satt'}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="py-3 border-b border-sand/40">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-2 block">
              Postnummer
            </label>
            {isEditingCompany ? (
              <input
                type="text"
                value={companyForm.post_number}
                onChange={(e) => setCompanyForm({ ...companyForm, post_number: e.target.value })}
                className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="0001"
              />
            ) : (
              <p className="text-sm text-ink mt-1.5">{company?.post_number || 'Ikke satt'}</p>
            )}
          </div>

          <div className="py-3 border-b border-sand/40">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-2 block">
              Poststed
            </label>
            {isEditingCompany ? (
              <input
                type="text"
                value={companyForm.post_location}
                onChange={(e) => setCompanyForm({ ...companyForm, post_location: e.target.value })}
                className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="Oslo"
              />
            ) : (
              <p className="text-sm text-ink mt-1.5">{company?.post_location || 'Ikke satt'}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="py-3 border-b border-sand/40">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-2 block">
              Kontonummer
            </label>
            {isEditingCompany ? (
              <input
                type="text"
                value={companyForm.account_number}
                onChange={(e) => setCompanyForm({ ...companyForm, account_number: e.target.value })}
                className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="1234 56 78901"
              />
            ) : (
              <p className="text-sm text-ink mt-1.5">{company?.account_number || 'Ikke satt'}</p>
            )}
          </div>

          <div className="py-3 border-b border-sand/40">
            <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-2 block">
              Standard MVA-sats (%)
            </label>
            {isEditingCompany ? (
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={companyForm.vat_rate}
                onChange={(e) => setCompanyForm({ ...companyForm, vat_rate: e.target.value })}
                className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="25"
              />
            ) : (
              <p className="text-sm text-ink mt-1.5">
                {company?.vat_rate != null ? `${(company.vat_rate * 100).toFixed(0)}%` : '25%'}
              </p>
            )}
          </div>
        </div>

        {companyError && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2">
            <p className="text-xs font-medium text-rose-700">{companyError}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">Utseende</h3>
        <p className="text-xs text-ink-subtle mb-4">Tilpass appens utseende og visning</p>
      </div>

      <div className="space-y-4">
        <div className="py-3 border-b border-sand/40">
          <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider">Tema</label>
          <p className="text-sm text-ink-soft mt-1.5">Lyst tema (mørkt tema kommer snart)</p>
        </div>
        <div className="py-3 border-b border-sand/40">
          <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider">Fakturamaler</label>
          <p className="text-sm text-ink-soft mt-1.5 mb-3">Rediger hvordan fakturaer ser ut</p>
          {onOpenTemplateEditor && (
            <div className="flex gap-2">
              <button
                onClick={() => onOpenTemplateEditor('default_invoice')}
                className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
              >
                Åpne malredigerer
              </button>
              <button
                onClick={() => onOpenTemplateEditor('default_invoice?preview=true')}
                className="rounded-lg border border-sand/60 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-cloud"
              >
                Forhåndsvisning
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const handleCSVImport = async (data, type) => {
    try {
      const api = typeof window !== 'undefined' ? window.fattern?.db : null;
      if (!api) {
        throw new Error('Database API ikke tilgjengelig');
      }

      if (type === 'customer') {
        await api.bulkCreateCustomers(data);
        toast.success(`Importert ${data.length} kunder`, 'Kundene er nå tilgjengelige i systemet');
      } else if (type === 'product') {
        await api.bulkCreateProducts(data);
        toast.success(`Importert ${data.length} produkter`, 'Produktene er nå tilgjengelige i systemet');
      }

      if (onRefreshData) {
        onRefreshData();
      }
    } catch (error) {
      console.error('Import feilet:', error);
      toast.error('Import feilet', error.message || 'Kunne ikke importere data');
      throw error;
    }
  };

  const renderImportSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">Importer data</h3>
        <p className="text-xs text-ink-subtle mb-4">Importer kunder, produkter og fakturaer fra CSV eller SAF-T</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-sand/60 bg-white p-6">
          <h4 className="text-sm font-semibold text-ink mb-2">CSV Import</h4>
          <p className="text-xs text-ink-subtle mb-4">
            Importer kunder eller produkter fra CSV-filer. Du kan mappe kolonner manuelt eller bruke AI-auto-mapping (Supporter Pack).
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setCsvImportModal({ isOpen: true, type: 'customer' })}
              className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
            >
              Importer kunder
            </button>
            <button
              onClick={() => setCsvImportModal({ isOpen: true, type: 'product' })}
              className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
            >
              Importer produkter
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-sand/60 bg-white p-6">
          <h4 className="text-sm font-semibold text-ink mb-2">SAF-T Import</h4>
          <p className="text-xs text-ink-subtle mb-4">
            Importer data fra SAF-T (Standard Audit File for Tax) filer. Dette er den offisielle, pålitelige importmetoden som støttes av de fleste norske regnskapssystemer.
          </p>
          <button
            disabled
            className="rounded-lg border border-sand/60 bg-cloud/50 px-4 py-2 text-sm font-medium text-ink-subtle cursor-not-allowed"
          >
            SAF-T import (kommer snart)
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'general':
        return renderGeneralSettings();
      case 'defaults':
        return renderDefaultsSettings();
      case 'company':
        return renderCompanySettings();
      case 'appearance':
        return renderAppearanceSettings();
      case 'import':
        return renderImportSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="flex w-full gap-6">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0">
          <div className="rounded-2xl border border-sand/60 bg-white shadow-card p-3">
            <div className="mb-2 px-2 py-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Kategorier</p>
            </div>
            <nav className="space-y-1">
              {SETTING_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`group relative w-full flex items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border border-brand-100 shadow-sm'
                        : 'text-ink-soft hover:bg-cloud hover:text-ink border border-transparent'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? 'bg-white text-brand-600 shadow-sm'
                          : 'bg-cloud text-ink-soft group-hover:bg-white/60'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{category.label}</div>
                      <div className={`text-xs mt-0.5 ${
                        isActive ? 'text-brand-600/80' : 'text-ink-subtle'
                      }`}>
                        {category.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-brand-600" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="rounded-2xl border border-sand/60 bg-white shadow-card overflow-hidden">
            <div className="border-b border-sand/60 bg-gradient-to-br from-brand-50/40 to-transparent px-8 py-6">
              <h2 className="text-2xl font-semibold text-ink">
                {SETTING_CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </h2>
              <p className="text-sm text-ink-soft mt-2">
                {activeCategory === 'general' && 'Administrer generelle app-innstillinger'}
                {activeCategory === 'defaults' && 'Sett standardverdier for visninger og preferanser'}
                {activeCategory === 'company' && 'Vis og administrer selskapinformasjon'}
                {activeCategory === 'appearance' && 'Tilpass appens utseende'}
                {activeCategory === 'import' && 'Importer data fra CSV eller SAF-T filer'}
              </p>
            </div>

            <div className="p-8">
              <div className="max-w-2xl">{renderContent()}</div>
            </div>
          </div>
        </main>
      </div>

      <CSVImportModal
        isOpen={csvImportModal.isOpen}
        type={csvImportModal.type}
        onClose={() => setCsvImportModal({ isOpen: false, type: 'customer' })}
        onImport={(data) => handleCSVImport(data, csvImportModal.type)}
      />
    </div>
  );
}
