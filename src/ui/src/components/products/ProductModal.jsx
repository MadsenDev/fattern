import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { UnitSelect } from '../Select';
import { ImageUpload } from '../ImageUpload';

export function ProductModal({ isOpen, mode = 'create', initialProduct, onSubmit, onClose }) {
  const [name, setName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [unitPrice, setUnitPrice] = useState(initialProduct?.unit_price || '');
  const [vatRate, setVatRate] = useState(
    initialProduct?.vat_rate != null ? (initialProduct.vat_rate * 100).toFixed(0) : '25'
  );
  const [unit, setUnit] = useState(initialProduct?.unit || '');
  const [active, setActive] = useState(initialProduct?.active !== undefined ? Boolean(initialProduct.active) : true);
  const [imagePath, setImagePath] = useState(initialProduct?.image_path || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isOpen) return;
    setName(initialProduct?.name || '');
    setSku(initialProduct?.sku || '');
    setDescription(initialProduct?.description || '');
    setUnitPrice(initialProduct?.unit_price || '');
    setVatRate(
      initialProduct?.vat_rate != null ? (initialProduct.vat_rate * 100).toFixed(0) : '25'
    );
    setUnit(initialProduct?.unit || '');
    setActive(initialProduct?.active !== undefined ? Boolean(initialProduct.active) : true);
    setImagePath(initialProduct?.image_path || '');
    setError('');
    setSaving(false);
  }, [isOpen, initialProduct, mode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Produktnavn må fylles ut.');
      return;
    }

    const price = parseFloat(unitPrice);
    if (isNaN(price) || price < 0) {
      setError('Pris må være et gyldig tall.');
      return;
    }

    const vat = parseFloat(vatRate);
    if (isNaN(vat) || vat < 0 || vat > 100) {
      setError('MVA-sats må være mellom 0 og 100.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit?.({
        id: initialProduct?.id,
        name: name.trim(),
        sku: sku.trim() || null,
        description: description.trim() || null,
        unitPrice: price,
        vatRate: vat / 100,
        unit: unit.trim() || null,
        active,
        imagePath: imagePath || null,
      });
      onClose?.();
    } catch (err) {
      console.error('Kunne ikke lagre produkt', err);
      setError('Noe gikk galt under lagring. Prøv igjen.');
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit ? 'Rediger produkt' : 'Nytt produkt';
  const modalDescription = isEdit
    ? 'Oppdater produktinformasjon.'
    : 'Legg til et nytt produkt i systemet.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={modalDescription}
      footer={
        <>
          <button
            type="button"
            className="text-sm font-medium text-ink-subtle hover:text-ink"
            onClick={onClose}
            disabled={saving}
          >
            Avbryt
          </button>
          <button
            type="submit"
            form="product-form"
            className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Lagrer …' : isEdit ? 'Lagre endringer' : 'Opprett produkt'}
          </button>
        </>
      }
    >
      <form id="product-form" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-ink">Produktnavn *</label>
          <input
            className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Eksempel: Konsulenttimer"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">SKU</label>
            <input
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Produktkode"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Enhet</label>
            <UnitSelect value={unit || ''} onChange={setUnit} placeholder="Velg eller skriv enhet" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Beskrivelse</label>
          <textarea
            className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Valgfri beskrivelse av produktet"
            rows={3}
          />
        </div>

        <div>
          <ImageUpload value={imagePath} onChange={setImagePath} label="Produktbilde" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">Pris *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">MVA-sats (%)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              placeholder="25"
            />
            <p className="mt-1 text-xs text-ink-subtle">Standard er 25%</p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-sand text-brand-600 focus:ring-brand-500"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
          />
          Produktet er aktivt
        </label>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      </form>
    </Modal>
  );
}

