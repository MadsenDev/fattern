import { useState, useRef, useEffect } from 'react';
import { fileToDataURL, isImageFile, validateImageSize } from '../../utils/imageUpload';

export function ExpenseAttachmentUpload({ value, onChange, label = 'Kvittering/bilde', maxSizeMB = 10, expenseId }) {
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Load preview when value changes
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    // If it's a data URL, use it directly
    if (value.startsWith('data:')) {
      setPreview(value);
      return;
    }

    // If it's a file path, read it via IPC
    if (window.fattern?.expense?.readAttachment) {
      window.fattern.expense.readAttachment(value).then((dataURL) => {
        setPreview(dataURL);
      }).catch(() => {
        setPreview(null);
      });
    }
  }, [value]);

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setIsSaving(true);

    try {
      if (!isImageFile(file)) {
        throw new Error('Filen må være et bilde (JPG, PNG, etc.)');
      }

      validateImageSize(file, maxSizeMB);

      // Save to disk via IPC
      if (window.fattern?.expense?.saveAttachment) {
        const dataURL = await fileToDataURL(file);
        const filename = await window.fattern.expense.saveAttachment(expenseId || 'new', dataURL);
        setFileName(file.name);
        onChange?.(filename);
      } else {
        // Fallback to data URL
        const dataURL = await fileToDataURL(file);
        setFileName(file.name);
        onChange?.(dataURL);
      }
    } catch (err) {
      setError(err.message || 'Kunne ikke laste opp bilde');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    setFileName('');
    onChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="text-sm font-medium text-ink">{label}</label>
      <div className="mt-2 space-y-2">
        {value ? (
          <div className="space-y-2">
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-48 w-full rounded-2xl border border-sand object-contain bg-cloud/30"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -right-2 -top-2 rounded-full bg-rose-600 p-1 text-white shadow-lg hover:bg-rose-700"
                  title="Fjern bilde"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between rounded-lg border border-sand/60 bg-cloud/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-ink-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-ink">
                    {fileName || (value.startsWith('data:') ? 'Bilde valgt' : value)}
                  </span>
                  {isSaving && <span className="text-xs text-ink-subtle">(lagrer...)</span>}
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded p-1 text-ink-subtle hover:bg-sand/60 hover:text-ink"
                  title="Fjern bilde"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center rounded-lg border-2 border-dashed border-sand bg-cloud/30 px-4 py-3 text-ink-subtle transition hover:border-brand-300 hover:bg-cloud/50"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm">Velg kvittering/bilde</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
        {!value && (
          <p className="text-xs text-ink-subtle">JPG, PNG eller GIF. Maks {maxSizeMB}MB</p>
        )}
      </div>
    </div>
  );
}

