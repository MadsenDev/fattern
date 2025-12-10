import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { StatusBadge } from '../StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { FiEdit2, FiDownload, FiPrinter } from 'react-icons/fi';

export function InvoiceViewModal({ isOpen, invoice, onClose, onEdit, onGeneratePDF, formatCurrency: fmt }) {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setGeneratingPdf(false);
    }
  }, [isOpen]);

  if (!isOpen || !invoice) return null;

  const calculations = invoice.items?.reduce(
    (acc, item) => {
      const lineSubtotal = (item.quantity || 0) * (item.unitPrice || item.unit_price || 0);
      const lineVat = lineSubtotal * (item.vatRate || item.vat_rate || 0);
      acc.subtotal += lineSubtotal;
      acc.vatTotal += lineVat;
      acc.total += lineSubtotal + lineVat;
      return acc;
    },
    { subtotal: 0, vatTotal: 0, total: 0 }
  ) || { subtotal: 0, vatTotal: 0, total: 0 };

  const handleGeneratePDF = async () => {
    if (!invoice?.id && !invoice?.dbId) return;
    
    setGeneratingPdf(true);
    try {
      await onGeneratePDF?.(invoice);
    } catch (error) {
      console.error('Kunne ikke generere PDF', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Faktura ${invoice.invoice_number || invoice.id || ''}`}
      description={invoice.customer_name ? `Kunde: ${invoice.customer_name}` : undefined}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <StatusBadge status={invoice.status || 'draft'} />
            {invoice.status === 'paid' && invoice.payment_date && (
              <div className="flex items-center gap-2 rounded-lg bg-brand-50 border border-brand-200 px-3 py-1.5">
                <span className="text-xs font-medium text-brand-700">
                  Betalt: {formatDate(invoice.payment_date)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleGeneratePDF}
              disabled={generatingPdf}
              className="rounded-2xl border border-sand bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-cloud disabled:opacity-50 flex items-center gap-2"
            >
              <FiDownload className="h-4 w-4" />
              {generatingPdf ? 'Genererer...' : 'Last ned PDF'}
            </button>
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose?.();
                  onEdit?.(invoice);
                }}
                className="rounded-2xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-800 flex items-center gap-2"
              >
                <FiEdit2 className="h-4 w-4" />
                Rediger
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Fakturadato</label>
              <p className="mt-1 text-sm font-medium text-ink">
                {invoice.invoice_date ? formatDate(invoice.invoice_date) : '—'}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Forfallsdato</label>
              <p className="mt-1 text-sm font-medium text-ink">
                {invoice.due_date ? formatDate(invoice.due_date) : '—'}
              </p>
            </div>
            {invoice.status === 'paid' && invoice.payment_date && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Betalingsdato</label>
                <p className="mt-1 text-sm font-semibold text-brand-700">
                  {formatDate(invoice.payment_date)}
                </p>
              </div>
            )}
            {invoice.start_date && invoice.end_date && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Periode</label>
                <p className="mt-1 text-sm font-medium text-ink">
                  {formatDate(invoice.start_date)} - {formatDate(invoice.end_date)}
                </p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {invoice.your_reference && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Deres referanse</label>
                <p className="mt-1 text-sm font-medium text-ink">{invoice.your_reference}</p>
              </div>
            )}
            {invoice.our_reference && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Vår referanse</label>
                <p className="mt-1 text-sm font-medium text-ink">{invoice.our_reference}</p>
              </div>
            )}
            {invoice.delivery_reference && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Leveringsreferanse</label>
                <p className="mt-1 text-sm font-medium text-ink">{invoice.delivery_reference}</p>
              </div>
            )}
            {invoice.reference && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Referanse</label>
                <p className="mt-1 text-sm font-medium text-ink">{invoice.reference}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        {invoice.items && invoice.items.length > 0 ? (
          <div className="rounded-2xl border border-sand/60 bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cloud/50 border-b border-sand/60">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Beskrivelse
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Antall
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Enhetspris
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      MVA %
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/60">
                  {invoice.items.map((item, index) => {
                    const unitPrice = item.unitPrice || item.unit_price || 0;
                    const quantity = item.quantity || 0;
                    const vatRate = item.vatRate || item.vat_rate || 0;
                    const lineSubtotal = unitPrice * quantity;
                    const lineVat = lineSubtotal * vatRate;
                    const lineTotal = lineSubtotal + lineVat;

                    return (
                      <tr key={item.id || index} className="hover:bg-cloud/30">
                        <td className="px-4 py-3 text-sm text-ink">{item.description || '—'}</td>
                        <td className="px-4 py-3 text-sm text-center text-ink-soft">{quantity}</td>
                        <td className="px-4 py-3 text-sm text-right text-ink-soft">{fmt(unitPrice)}</td>
                        <td className="px-4 py-3 text-sm text-center text-ink-soft">
                          {vatRate > 0 ? `${(vatRate * 100).toFixed(0)}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-ink">{fmt(lineTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-sand/60 bg-cloud/30 p-8 text-center text-sm text-ink-subtle">
            Ingen linjeelementer
          </div>
        )}

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full md:w-80 space-y-2">
            <div className="flex justify-between text-sm text-ink-soft">
              <span>Sum eks. mva:</span>
              <span className="font-medium">{fmt(calculations.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink-soft">
              <span>MVA:</span>
              <span className="font-medium">{fmt(calculations.vatTotal)}</span>
            </div>
            {invoice.credited && (
              <div className="pt-2 border-t border-sand/60">
                <div className="flex justify-between text-sm text-ink-soft">
                  <span>Kreditert:</span>
                  <span className="font-medium text-rose-600">Ja</span>
                </div>
              </div>
            )}
            <div className="pt-2 border-t-2 border-ink/20">
              <div className="flex justify-between text-base font-semibold text-ink">
                <span>Totalt:</span>
                <span>{fmt(calculations.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="rounded-2xl border border-sand/60 bg-cloud/30 p-4">
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">Notater</label>
            <p className="mt-2 text-sm text-ink whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

