import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { DatePicker } from '../DatePicker';
// formatDate removed — DatePicker expects raw yyyy-mm-dd ISO strings

export function BudgetYearModal({ isOpen, mode = 'create', initialYear, onSubmit, onClose }) {
  const [label, setLabel] = useState(initialYear?.label || '');
  const [startDate, setStartDate] = useState(initialYear?.start_date || initialYear?.start || '');
  const [endDate, setEndDate] = useState(initialYear?.end_date || initialYear?.end || '');
  const [isCurrent, setIsCurrent] = useState(Boolean(initialYear?.is_current));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isOpen) return;
    setLabel(initialYear?.label || '');
    // Pass raw ISO yyyy-mm-dd strings — DatePicker handles display formatting
    setStartDate(initialYear?.start_date || initialYear?.start || '');
    setEndDate(initialYear?.end_date || initialYear?.end || '');
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

    // DatePicker already returns yyyy-mm-dd format, so no conversion needed
    const normalizedStart = startDate || null;
    const normalizedEnd = endDate || null;

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
            className="text-sm font-medium transition"
            style={{ color: 'var(--f-text-subtle)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--f-text-body)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--f-text-subtle)'}
            onClick={onClose}
            disabled={saving}
          >
            Avbryt
          </button>
          <button
            type="submit"
            form="budget-year-form"
            className="f-btn-primary rounded-2xl px-5 py-2 text-sm font-semibold disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Lagrer …' : isEdit ? 'Lagre endringer' : 'Opprett år'}
          </button>
        </>
      }
    >
      <form id="budget-year-form" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Navn på budsjettår</label>
          <input
            className="f-input mt-2 w-full rounded-2xl px-4 py-2 text-sm"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="2025 eller 2024/2025"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Startdato</label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="dd.mm.yyyy"
              className="f-input mt-2 w-full rounded-2xl px-4 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Sluttdato</label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="dd.mm.yyyy"
              className="f-input mt-2 w-full rounded-2xl px-4 py-2 text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--f-text-body)' }}>
          <input
            type="checkbox"
            className="h-4 w-4 rounded"
            style={{ accentColor: 'var(--f-green)' }}
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
          />
          Marker som aktivt budsjettår
        </label>

        {error ? <p className="text-sm font-medium" style={{ color: 'var(--f-danger-text)' }}>{error}</p> : null}
      </form>
    </Modal>
  );
}
