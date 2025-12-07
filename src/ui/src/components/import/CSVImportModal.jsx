import { useState, useRef } from 'react';
import { FiUpload, FiX, FiFile, FiCheck } from 'react-icons/fi';
import { parseCSV, validateCSV } from '../../utils/csvParser';
import { useSupporterPack } from '../../hooks/useSupporterPack';

const FIELD_MAPPINGS = {
  customer: [
    { value: 'name', label: 'Navn' },
    { value: 'contact_name', label: 'Kontaktperson' },
    { value: 'email', label: 'E-post' },
    { value: 'phone', label: 'Telefon' },
    { value: 'address', label: 'Adresse' },
    { value: 'post_number', label: 'Postnummer' },
    { value: 'post_location', label: 'Poststed' },
    { value: 'org_number', label: 'Org.nr.' },
  ],
  product: [
    { value: 'name', label: 'Navn' },
    { value: 'sku', label: 'SKU' },
    { value: 'description', label: 'Beskrivelse' },
    { value: 'unit_price', label: 'Pris' },
    { value: 'vat_rate', label: 'MVA-sats' },
    { value: 'unit', label: 'Enhet' },
  ],
};

export function CSVImportModal({ isOpen, onClose, onImport, type = 'customer' }) {
  const [step, setStep] = useState('upload'); // upload, mapping, preview, importing
  const [csvData, setCsvData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [errors, setErrors] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const fileInputRef = useRef(null);
  const { hasFeature } = useSupporterPack();

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const parsed = parseCSV(text);
        const validation = validateCSV(parsed);

        if (!validation.valid) {
          setErrors([validation.error]);
          return;
        }

        setCsvData(parsed);
        setErrors([]);
        setStep('mapping');
      } catch (error) {
        setErrors([`Kunne ikke lese fil: ${error.message}`]);
      }
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleMappingChange = (csvColumn, field) => {
    setMapping((prev) => {
      const newMapping = { ...prev };
      if (field) {
        newMapping[csvColumn] = field;
      } else {
        delete newMapping[csvColumn];
      }
      return newMapping;
    });
  };

  const handlePreview = () => {
    if (!csvData) return;

    const preview = csvData.rows.slice(0, 5).map((row) => {
      const mapped = {};
      Object.entries(mapping).forEach(([csvColumn, field]) => {
        mapped[field] = row[csvColumn];
      });
      return mapped;
    });

    setPreviewData(preview);
    setStep('preview');
  };

  const handleImport = async () => {
    if (!csvData) return;

    setStep('importing');
    try {
      const importData = csvData.rows.map((row) => {
        const mapped = {};
        Object.entries(mapping).forEach(([csvColumn, field]) => {
          let value = row[csvColumn];
          
          // Type conversions
          if (field === 'unit_price' || field === 'vat_rate' || field === 'amount') {
            value = parseFloat(value?.replace(',', '.')) || 0;
          }
          if (field === 'vat_rate' && value > 1) {
            value = value / 100; // Convert percentage to decimal
          }
          if (field === 'active') {
            value = value === '1' || value?.toLowerCase() === 'true' || value?.toLowerCase() === 'ja';
          }

          mapped[field] = value;
        });
        return mapped;
      });

      await onImport(importData);
      onClose();
    } catch (error) {
      setErrors([`Import feilet: ${error.message}`]);
      setStep('preview');
    }
  };

  const availableFields = FIELD_MAPPINGS[type] || FIELD_MAPPINGS.customer;
  const mappedFields = new Set(Object.values(mapping));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand/60 p-6">
          <h2 className="text-xl font-semibold text-ink">Importer {type === 'customer' ? 'kunder' : 'produkter'} fra CSV</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-ink-subtle hover:bg-cloud"
            aria-label="Lukk"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-dashed border-sand/60 bg-cloud/30 p-12 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <FiUpload className="mx-auto h-12 w-12 text-ink-subtle" />
                <p className="mt-4 text-sm font-medium text-ink">Last opp CSV-fil</p>
                <p className="mt-2 text-xs text-ink-subtle">Støttet format: CSV (komma, semikolon eller tab-separert)</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
                >
                  Velg fil
                </button>
              </div>
              {errors.length > 0 && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-800">{error}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'mapping' && csvData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-ink mb-2">Kartlegg kolonner</h3>
                <p className="text-xs text-ink-subtle mb-4">
                  Velg hvilken CSV-kolonne som skal mappes til hvert felt. {csvData.rows.length} rader funnet.
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {csvData.headers.map((header) => (
                  <div key={header} className="flex items-center gap-4 rounded-lg border border-sand/60 bg-white p-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{header}</p>
                      <p className="text-xs text-ink-subtle mt-1">
                        Eksempel: {csvData.rows[0]?.[header] || '(tom)'}
                      </p>
                    </div>
                    <select
                      value={mapping[header] || ''}
                      onChange={(e) => handleMappingChange(header, e.target.value || null)}
                      className="rounded-lg border border-sand/60 bg-white px-3 py-2 text-sm text-ink min-w-[200px]"
                    >
                      <option value="">-- Ikke bruk --</option>
                      {availableFields
                        .filter((field) => !mappedFields.has(field.value) || mapping[header] === field.value)
                        .map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                    </select>
                  </div>
                ))}
              </div>

              {!hasFeature('ai_csv_mapping') && (
                <div className="rounded-lg bg-brand-50 border border-brand-200 p-4">
                  <p className="text-sm text-brand-800">
                    <strong>Supporter Pack:</strong> Aktiver AI-auto-mapping for automatisk kolonnemapping.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep('upload')}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-ink hover:bg-cloud"
                >
                  Tilbake
                </button>
                <button
                  onClick={handlePreview}
                  disabled={Object.keys(mapping).length === 0}
                  className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forhåndsvis
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-ink mb-2">Forhåndsvisning</h3>
                <p className="text-xs text-ink-subtle">
                  Dette er hvordan de første 5 radene vil se ut etter import.
                </p>
              </div>

              <div className="rounded-lg border border-sand/60 overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-cloud/80">
                    <tr>
                      {availableFields.filter((f) => mappedFields.has(f.value)).map((field) => (
                        <th key={field.value} className="px-4 py-2 text-left text-xs font-medium text-ink-subtle">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/60">
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        {availableFields.filter((f) => mappedFields.has(f.value)).map((field) => (
                          <td key={field.value} className="px-4 py-2 text-ink">
                            {row[field.value] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {errors.length > 0 && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm text-red-800">{error}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep('mapping')}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-ink hover:bg-cloud"
                >
                  Tilbake
                </button>
                <button
                  onClick={handleImport}
                  className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800"
                >
                  Importer {csvData.rows.length} {type === 'customer' ? 'kunder' : 'produkter'}
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-700"></div>
              <p className="mt-4 text-sm text-ink-subtle">Importerer...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

