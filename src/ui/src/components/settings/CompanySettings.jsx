import { useState, useEffect } from 'react';
import { FiEdit2, FiX, FiSave } from 'react-icons/fi';

export function CompanySettings({ company, onCompanyUpdate }) {
  const [isEditingCompany, setIsEditingCompany] = useState(false);
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

  return (
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
}

