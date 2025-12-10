import { FiClock, FiTrendingUp } from 'react-icons/fi';
import { StatCard } from '../StatCard';
import { StatusBadge } from '../StatusBadge';
import { InvoiceStatusSelector } from '../invoices/InvoiceStatusSelector';
import { formatDate } from '../../utils/formatDate';

export function DashboardView({
  budgetYears,
  selectedYear,
  onSelectYear,
  statHighlights,
  invoices,
  expenses,
  activityFeed,
  clientHighlights,
  summaries,
  utilization,
  collectionRate,
  formatCurrency,
  onOpenBudgetYearModal,
  onEditBudgetYear,
  onDeleteBudgetYear,
  onCreateInvoice,
  onCreateExpense,
  onNavigate,
  onOpenTimeline,
  onInvoiceStatusChange,
  showInvoiceStatusModal,
  onViewInvoice,
}) {
  const fmt = (value) => (typeof formatCurrency === 'function' ? formatCurrency(value) : value);

  return (
    <div className="space-y-6">
          <header className="relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
            <div className="relative z-10 space-y-6 p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-subtle">Budsjettkontroll</p>
                  <h1 className="mt-3 text-3xl font-semibold text-ink">Likviditetsoversikt</h1>
                  <p className="mt-2 text-sm text-ink-soft">
                    Følg innbetalinger, forbruk og fokusarbeid for det aktive året.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-ink-subtle">Budsjettår</label>
                  <select
                    className="w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200 lg:w-64"
                    value={selectedYear}
                    onChange={(e) => onSelectYear(e.target.value)}
                  >
                    {budgetYears.map((year) => {
                      const start = year.start ?? year.start_date;
                      const end = year.end ?? year.end_date;
                      return (
                        <option key={year.id} value={year.id}>
                          {`${year.label} (${start ? formatDate(start) : '—'} → ${
                            end ? formatDate(end) : '—'
                          })`}
                        </option>
                      );
                    })}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={onCreateInvoice}
                      className="flex-1 rounded-2xl border border-sand/80 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5"
                    >
                      Ny faktura
                    </button>
                    <button
                      onClick={() => onNavigate?.('Utgifter')}
                      className="flex-1 rounded-2xl bg-ink px-3 py-2 text-sm font-medium text-white shadow-card transition hover:-translate-y-0.5"
                    >
                      Legg til utgift
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                    <span>Kapasitetsbruk</span>
                    <span>{utilization}% brukt</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-cloud">
                    <div className="h-full rounded-full bg-brand-400" style={{ width: `${utilization}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                    <span>Innkrevingstakt</span>
                    <span>{collectionRate}%</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-cloud">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${collectionRate}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
                  <FiTrendingUp /> {collectionRate}% fakturaer betalt
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-sand/70 px-3 py-2 text-xs font-medium text-ink">
                  <FiClock /> {summaries ? fmt(summaries.overdue) : '-'} forfalt
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-sand/70 px-3 py-2 text-xs font-medium text-ink-soft">
                  Aktivt år · {budgetYears.find((y) => y.id === selectedYear)?.label || selectedYear}
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statHighlights.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <section className="xl:col-span-2 rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Fakturaløp</h3>
                  <p className="mt-1 text-sm text-ink-subtle">Hvor dagens kontantstrøm holder til</p>
                </div>
                <button
                  onClick={() => onNavigate?.('Fakturaer')}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Åpne løp
                </button>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-sand/60">
                <table className="min-w-full text-sm">
                  <thead className="bg-cloud/80 text-ink-subtle">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">Faktura</th>
                      <th className="px-4 py-3 text-left font-medium">Kunde</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Dato</th>
                      <th className="px-4 py-3 text-right font-medium">Beløp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/60 bg-white">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-subtle">
                          Ingen fakturaer i denne perioden
                        </td>
                      </tr>
                    ) : (
                      invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-cloud/60">
                          <td className="px-4 py-3 font-semibold text-ink">
                            <button
                              onClick={() => onViewInvoice?.(invoice)}
                              className="hover:text-brand-700 hover:underline cursor-pointer"
                            >
                              {invoice.invoice_number || invoice.id}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-ink-soft">{invoice.customer}</td>
                          <td className="px-4 py-3">
                            <InvoiceStatusSelector
                              invoice={invoice}
                              onStatusChange={onInvoiceStatusChange}
                              showModal={showInvoiceStatusModal}
                            />
                          </td>
                          <td className="px-4 py-3 text-ink-subtle">
                            <div className="flex flex-col">
                              <span>{invoice.date ? formatDate(invoice.date) : '—'}</span>
                              {invoice.status === 'paid' && invoice.payment_date && (
                                <span className="text-xs text-brand-700 font-medium">
                                  Betalt: {formatDate(invoice.payment_date)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-ink">{fmt(invoice.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-brand-100 bg-brand-50/60 p-6 shadow-card">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Siste hendelser</h3>
                  <p className="mt-1 text-sm text-ink-subtle">Økonomihendelser i arbeidsområdet</p>
                </div>
                <button
                  onClick={onOpenTimeline}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Åpne tidslinje
                </button>
              </div>
              <div className="space-y-3">
                {activityFeed.length === 0 ? (
                  <div className="rounded-2xl border border-sand/60 bg-white p-6 text-center text-sm text-ink-subtle">
                    Ingen aktivitet å vise
                  </div>
                ) : (
                  activityFeed.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-sand/60 bg-white p-3">
                    <div
                      className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border ${
                        item.status === 'success'
                          ? 'border-brand-200 bg-brand-50 text-brand-700'
                          : item.status === 'warn'
                          ? 'border-amber-200 bg-amber-50 text-amber-700'
                          : item.status === 'info'
                          ? 'border-sand/80 bg-cloud text-ink'
                          : 'border-sand/80 bg-white text-ink'
                      }`}
                    >
                      <span className="text-sm font-semibold">{item.title.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="text-sm text-ink-soft">{item.detail}</p>
                      <p className="mt-1 text-xs text-ink-subtle">{item.time}</p>
                    </div>
                    {typeof item.amount === 'number' ? (
                      <p className={`text-sm font-semibold ${item.amount > 0 ? 'text-brand-700' : 'text-ink-subtle'}`}>
                        {item.amount > 0 ? '+' : '-'}
                        {fmt(Math.abs(item.amount))}
                      </p>
                    ) : null}
                  </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-3xl border border-sand/60 bg-white/80 p-6 shadow-card backdrop-blur">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Utgifter</h3>
                  <p className="mt-1 text-sm text-ink-subtle">Rask status på ferske kvitteringer</p>
                </div>
                <button
                  onClick={() => onNavigate?.('Utgifter')}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Registrer utgift
                </button>
              </div>
              <div className="space-y-3">
                {expenses.length === 0 ? (
                  <div className="rounded-2xl border border-sand/70 bg-white px-4 py-6 text-center text-sm text-ink-subtle">
                    Ingen utgifter registrert
                  </div>
                ) : (
                  expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between rounded-2xl border border-sand/70 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-ink">{expense.vendor}</p>
                      <p className="text-sm text-ink-soft">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink">{fmt(expense.amount)}</p>
                      <p className="text-xs text-ink-subtle">
                        {expense.date ? formatDate(expense.date) : '—'}
                      </p>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-brand-100 bg-brand-50/60 p-6 shadow-card">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Kunderelasjoner</h3>
                  <p className="mt-1 text-sm text-ink-subtle">Viktigste kontoer som driver inntekter</p>
                </div>
                <button
                  onClick={() => onNavigate?.('Kunder')}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Se alle kunder
                </button>
              </div>
              <div className="space-y-3">
                {clientHighlights.length === 0 ? (
                  <div className="rounded-2xl border border-brand-100 bg-white px-4 py-6 text-center text-sm text-ink-subtle">
                    Ingen kunder med fakturaer
                  </div>
                ) : (
                  clientHighlights.map((client) => (
                  <div
                    key={client.name}
                    className="flex items-center justify-between rounded-2xl border border-brand-100 bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-ink">{client.name}</p>
                      <p className="text-sm text-ink-soft">{client.meta}</p>
                    </div>
                    <p className="text-right text-sm font-semibold text-brand-700">{fmt(client.value)}</p>
                  </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Status for budsjettår</h3>
                <p className="mt-1 text-sm text-ink-subtle">Sammenlign perioder og aktiver nye sykluser</p>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-accent hover:underline"
                onClick={onOpenBudgetYearModal}
              >
                Administrer år
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {budgetYears.map((year) => {
                const isActive = selectedYear === year.id;
                const start = year.start ?? year.start_date;
                const end = year.end ?? year.end_date;
                return (
                  <div
                    key={year.id}
                    className={`rounded-2xl border px-4 py-4 shadow-sm ${
                      isActive ? 'border-brand-200 bg-brand-50' : 'border-sand/70 bg-white'
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink">{year.label}</p>
                    <p className="mt-1 text-xs text-ink-subtle">
                      {start ? formatDate(start) : '—'} → {end ? formatDate(end) : '—'}
                    </p>
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        isActive ? 'bg-brand-600 text-white' : 'bg-cloud text-ink-soft'
                      }`}
                    >
                      {isActive ? 'Aktiv' : 'Tilgjengelig'}
                    </span>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        className="font-medium text-accent hover:underline"
                        onClick={() => onEditBudgetYear?.(year)}
                      >
                        Rediger
                      </button>
                      {!isActive ? (
                        <button
                          type="button"
                          className="font-medium text-rose-600 hover:underline"
                          onClick={() => onDeleteBudgetYear?.(year)}
                        >
                          Slett
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
    </div>
  );
}

