import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CSVImportModal } from '../import/CSVImportModal';
import { useToast } from '../../hooks/useToast';

export function ImportSettings({ onRefreshData }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [csvImportModal, setCsvImportModal] = useState({ isOpen: false, type: 'customer' });

  // SAF-T state
  const [saftImporting, setSaftImporting] = useState(false);
  const [saftPreview, setSaftPreview] = useState(null);
  const [saftFilePath, setSaftFilePath] = useState(null);
  const [saftOptions, setSaftOptions] = useState({
    importCustomers: true,
    importExpenses: true,
    skipDuplicates: true,
  });

  const handleCSVImport = async (data, type) => {
    try {
      const api = typeof window !== 'undefined' ? window.fattern?.db : null;
      if (!api) throw new Error('Database API ikke tilgjengelig');

      if (type === 'customer') {
        await api.bulkCreateCustomers(data);
        toast.success(`Importert ${data.length} kunder`, 'Kundene er nå tilgjengelige i systemet');
      } else if (type === 'product') {
        await api.bulkCreateProducts(data);
        toast.success(`Importert ${data.length} produkter`, 'Produktene er nå tilgjengelige i systemet');
      }

      onRefreshData?.();
    } catch (error) {
      console.error('Import feilet:', error);
      toast.error('Import feilet', error.message || 'Kunne ikke importere data');
      throw error;
    }
  };

  const handleSAFTSelect = async () => {
    const dialogApi = window.fattern?.dialog;
    if (!dialogApi) return;

    const result = await dialogApi.showOpenDialog({
      title: 'Velg SAF-T fil',
      filters: [
        { name: 'SAF-T XML', extensions: ['xml'] },
        { name: 'Alle filer', extensions: ['*'] },
      ],
      properties: ['openFile'],
    });

    if (result.canceled || !result.filePaths?.length) return;

    const filepath = result.filePaths[0];
    setSaftFilePath(filepath);

    try {
      const preview = await window.fattern.saft.parsePreview(filepath);
      setSaftPreview(preview);
    } catch (error) {
      toast.error(t('settings.import.parse_error') + ': ' + error.message);
      setSaftFilePath(null);
    }
  };

  const handleSAFTImport = async () => {
    if (!saftFilePath) return;
    setSaftImporting(true);
    try {
      const results = await window.fattern.saft.import(saftFilePath, saftOptions);

      const messages = [];
      if (results.customers.imported > 0)
        messages.push(`${results.customers.imported} kunder importert`);
      if (results.customers.skipped > 0)
        messages.push(`${results.customers.skipped} kunder hoppet over (duplikater)`);
      if (results.expenses.imported > 0)
        messages.push(`${results.expenses.imported} utgifter importert`);

      toast.success(messages.join(', ') || t('settings.import.success'));
      setSaftPreview(null);
      setSaftFilePath(null);
      onRefreshData?.();
    } catch (error) {
      toast.error(t('settings.import.error') + ': ' + error.message);
    } finally {
      setSaftImporting(false);
    }
  };

  const handleSAFTCancel = () => {
    setSaftPreview(null);
    setSaftFilePath(null);
  };

  const saftFileName = saftFilePath ? saftFilePath.split('/').pop() : null;

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-ink mb-1">{t('settings.import.title')}</h3>
          <p className="text-xs text-ink-subtle mb-4">Importer kunder, produkter og fakturaer fra CSV eller SAF-T</p>
        </div>

        <div className="space-y-4">
          {/* CSV Import */}
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

          {/* SAF-T Import */}
          <div className="rounded-lg border border-sand/60 bg-white p-6">
            <h4 className="text-sm font-semibold text-ink mb-1">{t('settings.import.saft_title')}</h4>
            <p className="text-xs text-ink-subtle mb-1">{t('settings.import.saft_description')}</p>
            <p className="text-xs text-ink-subtle mb-4 italic">{t('settings.import.saft_systems')}</p>

            {!saftPreview ? (
              /* Step 1: File selection */
              <button
                onClick={handleSAFTSelect}
                className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
              >
                {t('settings.import.select_file')}
              </button>
            ) : (
              /* Step 2: Preview + options */
              <div className="space-y-4">
                <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-subtle">{t('settings.import.preview_file')}:</span>
                    <span className="font-medium text-ink truncate max-w-[240px]">{saftFileName}</span>
                  </div>
                  {saftPreview.dateRange?.start && (
                    <div className="flex justify-between">
                      <span className="text-ink-subtle">{t('settings.import.preview_period')}:</span>
                      <span className="font-medium text-ink">
                        {saftPreview.dateRange.start} → {saftPreview.dateRange.end}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-ink-subtle">{t('settings.import.preview_customers')}:</span>
                    <span className="font-medium text-ink">{saftPreview.customerCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-subtle">{t('settings.import.preview_expenses')}:</span>
                    <span className="font-medium text-ink">
                      {(saftPreview.transactionCount ?? 0)} ({t('settings.import.preview_expenses')} etter filtrering)
                    </span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {[
                    { key: 'importCustomers', label: t('settings.import.import_customers') },
                    { key: 'importExpenses', label: t('settings.import.import_expenses') },
                    { key: 'skipDuplicates', label: t('settings.import.skip_duplicates') },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saftOptions[key]}
                        onChange={(e) => setSaftOptions((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="h-4 w-4 rounded border-sand text-brand-600"
                      />
                      {label}
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSAFTImport}
                    disabled={saftImporting}
                    className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-60"
                  >
                    {saftImporting ? t('settings.import.importing') : t('settings.import.import_button')}
                  </button>
                  <button
                    onClick={handleSAFTCancel}
                    disabled={saftImporting}
                    className="rounded-lg border border-sand/60 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-cloud"
                  >
                    {t('settings.import.cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <CSVImportModal
        isOpen={csvImportModal.isOpen}
        type={csvImportModal.type}
        onClose={() => setCsvImportModal({ isOpen: false, type: 'customer' })}
        onImport={(data) => handleCSVImport(data, csvImportModal.type)}
      />
    </>
  );
}
