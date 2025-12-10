import { useState, useRef } from 'react';
import { createWorker } from 'tesseract.js';
import { FiUpload, FiLoader } from 'react-icons/fi';

export function TesseractTest() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Vennligst velg et bilde');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result);
      setResult(null);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!image) {
      setError('Vennligst velg et bilde først');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const worker = await createWorker('nor+eng'); // Norwegian and English
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();
      
      setResult(text);
    } catch (err) {
      console.error('Tesseract error:', err);
      setError(err?.message || 'Kunne ikke prosessere bildet');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-ink">Tesseract.js OCR Test</h3>
        <p className="mt-1 text-sm text-ink-soft">
          Test Tesseract.js OCR ved å laste opp et bilde og se den ekstraherte teksten.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-ink">Velg bilde</label>
          <div className="mt-2">
            {!image ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sand bg-cloud/30 px-4 py-8 text-ink-subtle transition hover:border-brand-300 hover:bg-cloud/50"
              >
                <FiUpload className="h-5 w-5" />
                <span>Klikk for å laste opp bilde</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl border border-sand/60 bg-cloud/30 overflow-hidden">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleProcess}
                    disabled={loading}
                    className="flex-1 rounded-2xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-card disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" />
                        Prosesserer...
                      </>
                    ) : (
                      'Prosesser bilde'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={loading}
                    className="rounded-2xl border border-sand/60 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-cloud disabled:opacity-60"
                  >
                    Fjern bilde
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
            <p className="text-sm font-medium text-rose-600">{error}</p>
          </div>
        )}

        {result && (
          <div>
            <label className="text-sm font-medium text-ink">Ekstrahert tekst</label>
            <div className="mt-2 rounded-2xl border border-sand/60 bg-white p-4">
              <pre className="whitespace-pre-wrap text-sm text-ink font-mono max-h-96 overflow-y-auto">
                {result || '(Ingen tekst funnet)'}
              </pre>
            </div>
            <p className="mt-2 text-xs text-ink-subtle">
              {result.length} tegn ekstrahert
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

