import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Select } from '../Select';
import { DatePicker } from '../DatePicker';
import { formatDate } from '../../utils/formatDate';

export function InvoiceStatusModal({ isOpen, invoice, onClose, onSubmit, initialStatus = null }) {
  const [status, setStatus] = useState(initialStatus || invoice?.status || 'draft');
  const [paymentDate, setPaymentDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Statuses that require a date
  const statusesRequiringDate = ['paid'];

  useEffect(() => {
    if (!isOpen) return;
    const newStatus = initialStatus || invoice?.status || 'draft';
    setStatus(newStatus);
    
    // If invoice already has payment_date, use it (DatePicker expects yyyy-mm-dd)
    if (invoice?.payment_date) {
      setPaymentDate(invoice.payment_date);
    } else if (statusesRequiringDate.includes(newStatus)) {
      // If changing to paid and no date exists, default to today (yyyy-mm-dd format)
      const today = new Date();
      setPaymentDate(today.toISOString().split('T')[0]);
    } else {
      setPaymentDate('');
    }
    setError('');
    setSaving(false);
  }, [isOpen, invoice, initialStatus]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Validate date if required
    if (statusesRequiringDate.includes(status)) {
      if (!paymentDate) {
        setError('Dato må fylles ut.');
        return;
      }
    }

    setSaving(true);
    try {
      await onSubmit?.({
        status,
        paymentDate: statusesRequiringDate.includes(status) ? paymentDate : null,
      });
      onClose?.();
    } catch (err) {
      console.error('Kunne ikke oppdatere status', err);
      const errorMessage = err?.message || 'Noe gikk galt under oppdatering. Prøv igjen.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Kladd' },
    { value: 'sent', label: 'Sendt' },
    { value: 'paid', label: 'Betalt' },
    { value: 'overdue', label: 'Forfalt' },
    { value: 'cancelled', label: 'Kansellert' },
  ];

  const requiresDate = statusesRequiringDate.includes(status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Endre fakturastatus"
      description={`Oppdater status for faktura ${invoice?.invoice_number || invoice?.id || ''}`}
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
            form="status-form"
            className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Lagrer …' : 'Oppdater status'}
          </button>
        </>
      }
    >
      <form id="status-form" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-ink">Status</label>
          <Select
            value={status}
            onChange={setStatus}
            options={statusOptions}
            placeholder="Velg status"
          />
        </div>

        {requiresDate && (
          <div>
            <label className="text-sm font-medium text-ink">
              {status === 'paid' ? 'Betalingsdato' : 'Dato'} *
            </label>
            <DatePicker
              value={paymentDate}
              onChange={setPaymentDate}
              placeholder="dd.mm.yyyy"
              required
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
            <p className="mt-1 text-xs text-ink-subtle">
              {status === 'paid' ? 'Når ble fakturaen betalt?' : 'Dato for denne statusendringen'}
            </p>
          </div>
        )}

        {error ? (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
            <p className="text-sm font-medium text-rose-600">{error}</p>
          </div>
        ) : null}
      </form>
    </Modal>
  );
}

