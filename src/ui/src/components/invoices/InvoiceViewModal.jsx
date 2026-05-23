import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { StatusBadge } from '../StatusBadge';
import { formatDate } from '../../utils/formatDate';
import { FiEdit2, FiDownload, FiLink, FiX, FiPlus } from 'react-icons/fi';

function getDbApi() {
  if (typeof window === 'undefined') return null;
  return window.fattern?.db ?? null;
}

// ─── Expense Picker Modal ───────────────────────────────────────────────────

function ExpensePickerModal({ isOpen, invoiceId, budgetYearId, onLink, onClose, formatCurrency: fmt, t }) {
  const [unlinked, setUnlinked] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) { setSelected(new Set()); return; }
    const api = getDbApi();
    if (!api?.getUnlinkedExpenses) return;
    setLoading(true);
    api.getUnlinkedExpenses(budgetYearId)
      .then((rows) => setUnlinked(rows || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isOpen, budgetYearId]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    for (const expenseId of selected) {
      await onLink(expenseId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-sand/60">
          <h3 className="text-base font-semibold text-ink">{t('invoice.linked_expenses.picker_title')}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ink-subtle hover:bg-cloud">
            <FiX className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-ink-subtle text-center py-4">{t('common.loading')}</p>
          ) : unlinked.length === 0 ? (
            <p className="text-sm text-ink-subtle text-center py-4">{t('invoice.linked_expenses.picker_empty')}</p>
          ) : (
            <div className="space-y-2">
              {unlinked.map((exp) => (
                <label key={exp.id} className="flex items-center gap-3 rounded-xl p-3 hover:bg-cloud/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(exp.id)}
                    onChange={() => toggle(exp.id)}
                    className="h-4 w-4 rounded border-sand text-brand-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{exp.vendor || '—'}</p>
                    <p className="text-xs text-ink-subtle">{exp.date ? formatDate(exp.date) : '—'} · {exp.category_name || '—'}</p>
                  </div>
                  <span className="text-sm font-semibold text-ink">{fmt ? fmt(exp.amount) : exp.amount}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-sand/60">
          <button type="button" onClick={onClose} className="text-sm font-medium text-ink-subtle hover:text-ink">
            {t('invoice.linked_expenses.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="rounded-2xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-card disabled:opacity-50"
          >
            {t('invoice.linked_expenses.confirm')} ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Linked Expenses Tab ────────────────────────────────────────────────────

function LinkedExpensesTab({ invoiceId, budgetYearId, formatCurrency: fmt }) {
  const { t } = useTranslation();
  const [linked, setLinked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const refresh = useCallback(() => {
    const api = getDbApi();
    if (!api?.getExpensesForInvoice || !invoiceId) return;
    setLoading(true);
    api.getExpensesForInvoice(invoiceId)
      .then((rows) => setLinked(rows || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [invoiceId]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleUnlink = async (expenseId) => {
    const api = getDbApi();
    if (!api?.unlinkExpenseFromInvoice) return;
    await api.unlinkExpenseFromInvoice(invoiceId, expenseId);
    refresh();
  };

  const handleLink = async (expenseId) => {
    const api = getDbApi();
    if (!api?.linkExpenseToInvoice) return;
    await api.linkExpenseToInvoice(invoiceId, expenseId);
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-subtle">
          {linked.length} {linked.length === 1 ? t('expense.expense_singular') : t('expense.expense_plural')}
        </span>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="flex items-center gap-2 rounded-2xl border border-sand bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-cloud shadow-sm"
        >
          <FiPlus className="h-4 w-4" />
          {t('invoice.linked_expenses.link')}
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-ink-subtle text-center py-6">{t('common.loading')}</p>
      ) : linked.length === 0 ? (
        <p className="text-sm text-ink-subtle text-center py-6">{t('invoice.linked_expenses.empty')}</p>
      ) : (
        <div className="space-y-2">
          {linked.map((exp) => (
            <div key={exp.id} className="flex items-center gap-3 rounded-xl border border-sand/60 bg-white p-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink">{exp.vendor || '—'}</p>
                <p className="text-xs text-ink-subtle">
                  {exp.date ? formatDate(exp.date) : '—'} · {exp.category_name || t('expense.unknown_category')}
                </p>
              </div>
              <span className="text-sm font-semibold text-ink">
                {fmt ? fmt(exp.amount) : exp.amount}
              </span>
              <button
                type="button"
                onClick={() => handleUnlink(exp.id)}
                className="rounded-lg p-1.5 text-ink-subtle hover:bg-red-50 hover:text-red-600"
                title={t('invoice.linked_expenses.unlink')}
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ExpensePickerModal
        isOpen={pickerOpen}
        invoiceId={invoiceId}
        budgetYearId={budgetYearId}
        onLink={handleLink}
        onClose={() => { setPickerOpen(false); refresh(); }}
        formatCurrency={fmt}
        t={t}
      />
    </div>
  );
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export function InvoiceViewModal({ isOpen, invoice, onClose, onEdit, onGeneratePDF, formatCurrency: fmt, budgetYearId }) {
  const { t } = useTranslation();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!isOpen) {
      setGeneratingPdf(false);
      setActiveTab('details');
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

  const invoiceId = invoice.dbId || invoice.id;

  const tabs = [
    { id: 'details', label: 'Detaljer' },
    { id: 'expenses', label: t('invoice.linked_expenses.tab') },
  ];

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
                  {t('invoice.paid_date')} {formatDate(invoice.payment_date)}
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
              {generatingPdf ? t('common.loading') : t('invoice.generate_pdf')}
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
                {t('common.edit')}
              </button>
            )}
          </div>
        </div>
      }
    >
      {/* Tab bar */}
      <div className="flex border-b border-sand/60 mb-6 -mt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? 'border-brand-700 text-brand-700'
                : 'border-transparent text-ink-subtle hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'details' && (
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
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-subtle">Beskrivelse</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-subtle">Antall</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-subtle">Enhetspris</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-subtle">MVA %</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-ink-subtle">Total</th>
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
      )}

      {activeTab === 'expenses' && (
        <LinkedExpensesTab
          invoiceId={invoiceId}
          budgetYearId={budgetYearId}
          formatCurrency={fmt}
        />
      )}
    </Modal>
  );
}
