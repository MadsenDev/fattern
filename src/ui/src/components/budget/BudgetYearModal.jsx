import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { formatDate } from '../../utils/formatDate';

export function BudgetYearModal({ isOpen, mode = 'create', initialYear, onSubmit, onClose }) {
  const [label, setLabel] = useState(initialYear?.label || '');
  const [startDate, setStartDate] = useState(initialYear?.start_date || initialYear?.start || '');
  const [endDate, setEndDate] = useState(initialYear?.end_date || initialYear?.end || '');
  const [isCurrent, setIsCurrent] = useState(Boolean(initialYear?.is_current));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';

  const formatDateInput = (raw) => {
    if (!raw) return '';
    // keep only digits
    const digits = raw.replace(/\D/g, '').slice(0, 8); // ddmmåååå
    const len = digits.length;
    if (len <= 2) return digits;
    if (len <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  };

  useEffect(() => {
    if (!isOpen) return;
    setLabel(initialYear?.label || '');
    setStartDate(
      initialYear?.start_date || initialYear?.start
        ? formatDate(initialYear.start_date || initialYear.start)
        : ''
    );
    setEndDate(
      initialYear?.end_date || initialYear?.end
        ? formatDate(initialYear.end_date || initialYear.end)
        : ''
    );
    setIsCurrent(Boolean(initialYear?.is_current));
    setError('');
    setSaving(false);
  }, [isOpen, initialYear, mode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!label.trim() || !startDate || !endDate) {
      setError('Alle felter må fylles ut.');
      return;
    }

    // Convert dd.mm.yyyy to ISO yyyy-mm-dd before sending to backend
    const toIso = (value) => {
      if (!value) return value;
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
      if (match) {
        const [, d, m, y] = match;
        return `${y}-${m}-${d}`;
      }
      return value;
    };

    const normalizedStart = toIso(startDate);
    const normalizedEnd = toIso(endDate);

    setSaving(true);
    try {
      await onSubmit?.({
        id: initialYear?.id,
        label: label.trim(),
        startDate: normalizedStart,
        endDate: normalizedEnd,
        isCurrent,
      });
      onClose?.();
    } catch (err) {
      console.error('Kunne ikke lagre budsjettår', err);
      setError('Noe gikk galt under lagring. Prøv igjen.');
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit ? 'Rediger budsjettår' : 'Nytt budsjettår';
  const description = isEdit
    ? 'Oppdater navn og periode for valgt budsjettår.'
    : 'Definer periode og navn for et nytt budsjettår.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
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
            form="budget-year-form"
            className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Lagrer …' : isEdit ? 'Lagre endringer' : 'Opprett år'}
          </button>
        </>
      }
    >
      <form id="budget-year-form" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-ink">Navn på budsjettår</label>
          <input
            className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="2025 eller 2024/2025"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">Startdato</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd.mm.åååå"
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={startDate}
              onChange={(e) => setStartDate(formatDateInput(e.target.value))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Sluttdato</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd.mm.åååå"
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={endDate}
              onChange={(e) => setEndDate(formatDateInput(e.target.value))}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-sand text-brand-600 focus:ring-brand-500"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
          />
          Marker som aktivt budsjettår
        </label>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      </form>
    </Modal>
  );
}


