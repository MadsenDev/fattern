import { useState, useRef } from 'react';
import { IconUpload, IconX, IconFile, IconCheck } from '@tabler/icons-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(4,10,8,0.75)', backdropFilter: 'blur(6px)' }}>
      <div className="f-glass-hero w-full max-w-4xl rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--f-border-subtle)' }}>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--f-text-body)' }}>Importer {type === 'customer' ? 'kunder' : 'produkter'} fra CSV</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition"
            style={{ color: 'var(--f-text-subtle)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            aria-label="Lukk"
          >
            <IconX className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-dashed p-12 text-center" style={{ borderColor: 'var(--f-border)', background: 'rgba(255,255,255,0.02)' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <IconUpload className="mx-auto h-12 w-12" style={{ color: 'var(--f-text-subtle)' }} />
                <p className="mt-4 text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Last opp CSV-fil</p>
                <p className="mt-2 text-xs" style={{ color: 'var(--f-text-subtle)' }}>Støttet format: CSV (komma, semikolon eller tab-separert)</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="f-btn-primary mt-4 rounded-lg px-4 py-2 text-sm font-medium"
                >
                  Velg fil
                </button>
              </div>
              {errors.length > 0 && (
                <div className="rounded-lg p-4" style={{ background: 'var(--f-danger-bg)', border: '1px solid var(--f-danger-border)' }}>
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm" style={{ color: 'var(--f-danger-text)' }}>{error}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'mapping' && csvData && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--f-text-body)' }}>Kartlegg kolonner</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--f-text-subtle)' }}>
                  Velg hvilken CSV-kolonne som skal mappes til hvert felt. {csvData.rows.length} rader funnet.
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {csvData.headers.map((header) => (
                  <div key={header} className="flex items-center gap-4 rounded-lg p-4" style={{ border: '1px solid var(--f-border-subtle)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>{header}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--f-text-subtle)' }}>
                        Eksempel: {csvData.rows[0]?.[header] || '(tom)'}
                      </p>
                    </div>
                    <select
                      value={mapping[header] || ''}
                      onChange={(e) => handleMappingChange(header, e.target.value || null)}
                      className="f-input rounded-lg px-3 py-2 text-sm min-w-[200px]"
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
                <div className="rounded-lg p-4" style={{ background: 'var(--f-green-bg)', border: '1px solid var(--f-border-green)' }}>
                  <p className="text-sm" style={{ color: 'var(--f-green-text)' }}>
                    <strong>Supporter-pakken:</strong> Aktiver automatisk AI-kolonnemapping.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep('upload')}
                  className="f-btn-ghost rounded-lg px-4 py-2 text-sm font-medium"
                >
                  Tilbake
                </button>
                <button
                  onClick={handlePreview}
                  disabled={Object.keys(mapping).length === 0}
                  className="f-btn-primary rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Forhåndsvis
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--f-text-body)' }}>Forhåndsvisning</h3>
                <p className="text-xs" style={{ color: 'var(--f-text-subtle)' }}>
                  Dette er hvordan de første 5 radene vil se ut etter import.
                </p>
              </div>

              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--f-border-subtle)' }}>
                <table className="min-w-full text-sm">
                  <thead style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid var(--f-border-subtle)' }}>
                    <tr>
                      {availableFields.filter((f) => mappedFields.has(f.value)).map((field) => (
                        <th key={field.value} className="px-4 py-2 text-left text-xs font-medium" style={{ color: 'var(--f-text-subtle)' }}>
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
                        {availableFields.filter((f) => mappedFields.has(f.value)).map((field) => (
                          <td key={field.value} className="px-4 py-2" style={{ color: 'var(--f-text-body)' }}>
                            {row[field.value] ?? '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {errors.length > 0 && (
                <div className="rounded-lg p-4" style={{ background: 'var(--f-danger-bg)', border: '1px solid var(--f-danger-border)' }}>
                  {errors.map((error, i) => (
                    <p key={i} className="text-sm" style={{ color: 'var(--f-danger-text)' }}>{error}</p>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setStep('mapping')}
                  className="f-btn-ghost rounded-lg px-4 py-2 text-sm font-medium"
                >
                  Tilbake
                </button>
                <button
                  onClick={handleImport}
                  className="f-btn-primary rounded-lg px-4 py-2 text-sm font-medium"
                >
                  Importer {csvData.rows.length} {type === 'customer' ? 'kunder' : 'produkter'}
                </button>
              </div>
            </div>
          )}

          {step === 'importing' && (
            <div className="py-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8" style={{ border: '2px solid var(--f-border)', borderTopColor: 'var(--f-green)' }}></div>
              <p className="mt-4 text-sm" style={{ color: 'var(--f-text-subtle)' }}>Importerer...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
