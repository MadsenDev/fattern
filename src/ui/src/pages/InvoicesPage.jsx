import { useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiDownload } from 'react-icons/fi';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

export function InvoicesPage({ invoices, formatCurrency: fmt, onCreateInvoice, onEditInvoice, onDeleteInvoice, showToast }) {
  const [generatingPdf, setGeneratingPdf] = useState(null);

  const handleGeneratePDF = async (invoice) => {
    if (!invoice?.dbId) return;
    
    setGeneratingPdf(invoice.dbId);
    try {
      const api = typeof window !== 'undefined' ? window.fattern?.pdf : null;
      if (!api?.generateInvoice) {
        throw new Error('PDF generation ikke tilgjengelig');
      }

      const result = await api.generateInvoice(invoice.dbId);
      if (result?.success && result?.filepath) {
        showToast?.success('PDF lastet ned');
        // Optionally open the file
        if (api.openFile) {
          await api.openFile(result.filepath);
        }
      }
    } catch (error) {
      console.error('Kunne ikke generere PDF', error);
      showToast?.error('Kunne ikke generere PDF');
    } finally {
      setGeneratingPdf(null);
    }
  };
  const columns = useMemo(
    () => [
      {
        key: 'id',
        label: 'Faktura',
        className: 'font-semibold text-ink',
      },
      {
        key: 'customer',
        label: 'Kunde',
        className: 'text-ink-soft',
      },
      {
        key: 'status',
        label: 'Status',
        render: (status) => <StatusBadge status={status} />,
        sortFn: (a, b) => {
          const statusOrder = { draft: 0, sent: 1, paid: 2, overdue: 3 };
          return (statusOrder[a] || 99) - (statusOrder[b] || 99);
        },
      },
      {
        key: 'date',
        label: 'Dato',
        render: (date) => (date ? formatDate(date) : '—'),
        className: 'text-ink-subtle',
        sortFn: (a, b) => {
          const aDate = a ? new Date(a).getTime() : 0;
          const bDate = b ? new Date(b).getTime() : 0;
          return aDate - bDate;
        },
      },
      {
        key: 'amount',
        label: 'Beløp',
        align: 'right',
        render: (amount) => (typeof amount === 'number' ? fmt(amount) : '—'),
        className: 'font-medium text-ink',
        sortFn: (a, b) => {
          const aVal = typeof a === 'number' ? a : 0;
          const bVal = typeof b === 'number' ? b : 0;
          return aVal - bVal;
        },
      },
      {
        key: 'actions',
        label: '',
        align: 'right',
        render: (_, invoice) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => handleGeneratePDF(invoice)}
              disabled={generatingPdf === invoice.dbId}
              className="rounded-lg p-1.5 text-ink-subtle hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
              aria-label="Generer PDF"
              title="Generer PDF"
            >
              <FiDownload className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEditInvoice?.(invoice)}
              className="rounded-lg p-1.5 text-ink-subtle hover:bg-brand-50 hover:text-brand-700"
              aria-label="Rediger faktura"
            >
              <FiEdit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDeleteInvoice?.(invoice)}
              className="rounded-lg p-1.5 text-ink-subtle hover:bg-red-50 hover:text-red-600"
              aria-label="Slett faktura"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [fmt, onEditInvoice, onDeleteInvoice]
  );

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-subtle">Fakturaer</p>
              <h1 className="mt-3 text-3xl font-semibold text-ink">Alle fakturaer</h1>
              <p className="mt-2 text-sm text-ink-soft">Oversikt over alle fakturaer i systemet</p>
            </div>
            <button
              onClick={() => onCreateInvoice?.()}
              className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
            >
              Ny faktura
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
        <DataTable columns={columns} data={invoices || []} emptyMessage="Ingen fakturaer funnet" defaultSort={{ column: 'date', direction: 'desc' }} />
      </section>
    </div>
  );
}

