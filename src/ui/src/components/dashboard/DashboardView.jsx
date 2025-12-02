import { t } from "i18next";import { FiClock, FiTrendingUp } from 'react-icons/fi';
import { StatCard } from '../StatCard';

export function DashboardView({
  company,
  navItems,
  workflowShortcuts,
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
  statusBadge,
  statusLabel,
  formatCurrency
}) {
  const displayName = company?.name && company.name !== 'Default Company' ? company.name : 'Fattern';
  const fmt = (value) => typeof formatCurrency === 'function' ? formatCurrency(value) : value;

  return (
    <div className="min-h-screen bg-brand-50/60 px-4 py-6 lg:px-8 xl:px-12">
      <div className="grid w-full gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden flex-col gap-6 lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:overflow-y-auto xl:top-8 xl:h-[calc(100vh-4rem)]">
          <div className="rounded-3xl border border-sand/60 bg-white/80 p-6 shadow-card backdrop-blur-sm">
            <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 p-5 text-white shadow-inner">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wider text-white/70">{t("dashboard_view.workspace")}</p>
                  <p className="mt-3 text-2xl font-semibold">{displayName}</p>
                  <p className="mt-2 text-sm text-white/80">{t("dashboard_view.localfirst_finance_suite")}</p>
                </div>
                <img
                  src="/fattern-monogram.svg"
                  alt="Fattern monogram"
                  className="hidden h-16 w-auto shrink-0 drop-shadow-2xl sm:block" />

              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button className="rounded-2xl border border-white/40 px-3 py-1 text-xs font-medium text-white/90">{t("dashboard_view.synk_konto")}

                </button>
                <button className="rounded-2xl border border-white/40 px-3 py-1 text-xs font-medium text-white/90">{t("dashboard_view.inviter_team")}

                </button>
              </div>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => {
                const isActive = item.label === 'Oversikt';
                return (
                  <button
                    key={item.label}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-medium transition ${
                    isActive ?
                    'bg-brand-50 text-brand-700 border border-brand-100' :
                    'text-ink-soft hover:bg-cloud'}`
                    }>

                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      isActive ? 'bg-white text-brand-600' : 'bg-cloud text-ink-soft'}`
                      }>

                      {item.icon}
                    </span>
                    {item.label}
                  </button>);

              })}
            </nav>

            <div className="mt-6 rounded-2xl border border-sand/70 bg-cloud/60 p-4">
              <p className="text-xs uppercase tracking-widest text-ink-subtle">{t("dashboard_view.workflow")}</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-soft">
                {workflowShortcuts.map((shortcut) =>
                <li key={shortcut.label} className="flex items-center justify-between rounded-xl px-2 py-1">
                    <span>{shortcut.label}</span>
                    <span className="rounded-xl border border-sand/70 px-2 py-0.5 text-xs font-semibold">
                      {shortcut.helper}
                    </span>
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-sand/70 p-4 text-xs text-ink-subtle">{t("dashboard_view.sqlite_frakoblet_v_1_forhndsvisning")}

            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
            <div className="relative z-10 space-y-6 p-6 lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-subtle">{t("dashboard_view.budget_oversight")}</p>
                  <h1 className="mt-3 text-3xl font-semibold text-ink">{t("dashboard_view.cashflow_runway")}</h1>
                  <p className="mt-2 text-sm text-ink-soft">{t("dashboard_view.track_collections_spending_and_focus_work_ofhu")}

                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-ink-subtle">{t("dashboard_view.budget_year")}</label>
                  <select
                    className="w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200 lg:w-64"
                    value={selectedYear}
                    onChange={(e) => onSelectYear(e.target.value)}>

                    {budgetYears.map((year) =>
                    <option key={year.id} value={year.id}>{`${year.label} (${year.start} → ${year.end})`}</option>
                    )}
                  </select>
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-2xl border border-sand/80 bg-white px-3 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5">{t("dashboard_view.new_invoice")}

                    </button>
                    <button className="flex-1 rounded-2xl bg-ink px-3 py-2 text-sm font-medium text-white shadow-card transition hover:-translate-y-0.5">{t("dashboard_view.add_expense")}

                    </button>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                    <span>{t("dashboard_view.capacity_usage")}</span>
                    <span>{utilization}{t("dashboard_view.used")}</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-cloud">
                    <div className="h-full rounded-full bg-brand-400" style={{ width: `${utilization}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-ink-soft">
                    <span>{t("dashboard_view.collection_rate")}</span>
                    <span>{collectionRate}%</span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-cloud">
                    <div className="h-full rounded-full bg-brand-600" style={{ width: `${collectionRate}%` }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-2xl border border-brand-100 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
                  <FiTrendingUp /> {collectionRate}{t("dashboard_view.invoices_collected")}
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-sand/70 px-3 py-2 text-xs font-medium text-ink">
                  <FiClock /> {summaries ? fmt(summaries.overdue) : '-'}{t("dashboard_view.overdue")}
                </div>
                <div className="flex items-center gap-2 rounded-2xl border border-sand/70 px-3 py-2 text-xs font-medium text-ink-soft">{t("dashboard_view.active_year")}
                  {selectedYear}
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statHighlights.map((stat) =>
            <StatCard key={stat.title} {...stat} />
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <section className="xl:col-span-2 rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{t("dashboard_view.invoice_pipeline")}</h3>
                  <p className="mt-1 text-sm text-ink-subtle">{t("dashboard_view.where_your_current_cash_inflow_lives")}</p>
                </div>
                <button className="text-sm font-medium text-accent hover:underline">{t("dashboard_view.open_pipeline")}</button>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-sand/60">
                <table className="min-w-full text-sm">
                  <thead className="bg-cloud/80 text-ink-subtle">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">{t("dashboard_view.invoice")}</th>
                      <th className="px-4 py-3 text-left font-medium">{t("dashboard_view.customer")}</th>
                      <th className="px-4 py-3 text-left font-medium">{t("dashboard_view.status")}</th>
                      <th className="px-4 py-3 text-left font-medium">{t("dashboard_view.date")}</th>
                      <th className="px-4 py-3 text-right font-medium">{t("dashboard_view.amount")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/60 bg-white">
                    {invoices.map((invoice) =>
                    <tr key={invoice.id} className="hover:bg-cloud/60">
                        <td className="px-4 py-3 font-semibold text-ink">{invoice.id}</td>
                        <td className="px-4 py-3 text-ink-soft">{invoice.customer}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${statusBadge[invoice.status]}`}>
                            <span className="h-2 w-2 rounded-full bg-current/60"></span>
                            {statusLabel[invoice.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-ink-subtle">{invoice.date}</td>
                        <td className="px-4 py-3 text-right font-medium text-ink">
                          {fmt(invoice.amount)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-3xl border border-brand-100 bg-brand-50/60 p-6 shadow-card">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{t("dashboard_view.live_activity")}</h3>
                  <p className="mt-1 text-sm text-ink-subtle">{t("dashboard_view.finance_events_across_the_workspace")}</p>
                </div>
                <button className="text-sm font-medium text-accent hover:underline">{t("dashboard_view.open_timeline")}</button>
              </div>
              <div className="space-y-3">
                {activityFeed.map((item) =>
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-sand/60 bg-white p-3">
                    <div
                    className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border ${
                    item.status === 'success' ?
                    'border-brand-200 bg-brand-50 text-brand-700' :
                    item.status === 'warn' ?
                    'border-amber-200 bg-amber-50 text-amber-700' :
                    item.status === 'info' ?
                    'border-sand/80 bg-cloud text-ink' :
                    'border-sand/80 bg-white text-ink'}`
                    }>

                      <span className="text-sm font-semibold">{item.title.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="text-sm text-ink-soft">{item.detail}</p>
                      <p className="mt-1 text-xs text-ink-subtle">{item.time}</p>
                    </div>
                    {typeof item.amount === 'number' ?
                  <p className={`text-sm font-semibold ${item.amount > 0 ? 'text-brand-700' : 'text-ink-subtle'}`}>
                        {item.amount > 0 ? '+' : '-'}
                        {fmt(Math.abs(item.amount))}
                      </p> :
                  null}
                  </div>
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="rounded-3xl border border-sand/60 bg-white/80 p-6 shadow-card backdrop-blur">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{t("dashboard_view.expenses")}</h3>
                  <p className="mt-1 text-sm text-ink-subtle">{t("dashboard_view.quick_status_on_recent_receipts")}</p>
                </div>
                <button className="text-sm font-medium text-accent hover:underline">{t("dashboard_view.log_expense")}</button>
              </div>
              <div className="space-y-3">
                {expenses.map((expense) =>
                <div key={expense.id} className="flex items-center justify-between rounded-2xl border border-sand/70 bg-white px-4 py-3">
                    <div>
                      <p className="font-semibold text-ink">{expense.vendor}</p>
                      <p className="text-sm text-ink-soft">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink">{fmt(expense.amount)}</p>
                      <p className="text-xs text-ink-subtle">{expense.date}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-brand-100 bg-brand-50/60 p-6 shadow-card">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{t("dashboard_view.client_relationships")}</h3>
                  <p className="mt-1 text-sm text-ink-subtle">{t("dashboard_view.top_accounts_driving_revenue")}</p>
                </div>
                <button className="text-sm font-medium text-accent hover:underline">{t("dashboard_view.see_all_clients")}</button>
              </div>
              <div className="space-y-3">
                {clientHighlights.map((client) =>
                <div key={client.name} className="flex items-center justify-between rounded-2xl border border-brand-100 bg-white px-4 py-3">
                    <div>
                      <p className="font-semibold text-ink">{client.name}</p>
                      <p className="text-sm text-ink-soft">{client.meta}</p>
                    </div>
                    <p className="text-right text-sm font-semibold text-brand-700">{fmt(client.value)}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          <section className="rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{t("dashboard_view.budget_year_status")}</h3>
                <p className="mt-1 text-sm text-ink-subtle">{t("dashboard_view.compare_timeframes_and_activate_new_cycles")}</p>
              </div>
              <button className="text-sm font-medium text-accent hover:underline">{t("dashboard_view.manage_years")}</button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {budgetYears.map((year) => {
                const isActive = selectedYear === year.id;
                return (
                  <div
                    key={year.id}
                    className={`rounded-2xl border px-4 py-4 shadow-sm ${
                    isActive ? 'border-brand-200 bg-brand-50' : 'border-sand/70 bg-white'}`
                    }>

                    <p className="text-sm font-semibold text-ink">{year.label}</p>
                    <p className="mt-1 text-xs text-ink-subtle">
                      {year.start} → {year.end}
                    </p>
                    <span
                      className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive ? 'bg-brand-600 text-white' : 'bg-cloud text-ink-soft'}`
                      }>

                      {isActive ? 'Active' : 'Available'}
                    </span>
                  </div>);

              })}
            </div>
          </section>
        </main>
      </div>
    </div>);

}