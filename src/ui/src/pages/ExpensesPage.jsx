import { useMemo } from 'react';
import { DataTable } from '../components/DataTable';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

export function ExpensesPage({ expenses, formatCurrency: fmt }) {
  const columns = useMemo(
    () => [
      {
        key: 'vendor',
        label: 'Leverandør',
        className: 'font-semibold text-ink',
      },
      {
        key: 'category',
        label: 'Kategori',
        className: 'text-ink-soft',
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
    ],
    [fmt]
  );

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-subtle">Utgifter</p>
              <h1 className="mt-3 text-3xl font-semibold text-ink">Alle utgifter</h1>
              <p className="mt-2 text-sm text-ink-soft">Oversikt over alle utgifter i systemet</p>
            </div>
            <button className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5">
              Registrer utgift
            </button>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
        <DataTable columns={columns} data={expenses || []} emptyMessage="Ingen utgifter funnet" defaultSort={{ column: 'date', direction: 'desc' }} />
      </section>
    </div>
  );
}

