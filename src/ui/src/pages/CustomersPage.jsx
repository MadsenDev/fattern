import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '../components/DataTable';
import { CustomerCard } from '../components/CustomerCard';
import { SearchBar } from '../components/SearchBar';
import { useSettings } from '../hooks/useSettings';
import { useSearch } from '../hooks/useSearch';

const ACTIVE_OPTIONS = [
  { value: 'all', labelKey: 'customer.active_filter' },
  { value: 'active', labelKey: 'customer.active' },
  { value: 'inactive', labelKey: 'customer.inactive' },
];

export function CustomersPage({ customers, onEditCustomer, onDeleteCustomer, onCreateCustomer }) {
  const { t } = useTranslation();
  const { getSetting, updateSetting } = useSettings();
  const defaultView = getSetting('customers.defaultView', 'table');
  const [viewMode, setViewMode] = useState(defaultView);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (defaultView) setViewMode(defaultView);
  }, [defaultView]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    updateSetting('customers.defaultView', mode);
  };

  const { query, setQuery, results: searched } = useSearch(customers, [
    'name', 'contact_name', 'email', 'org_number',
  ]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return searched;
    return searched.filter((c) => activeFilter === 'active' ? c.active : !c.active);
  }, [searched, activeFilter]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: t('customer.name'),
        className: 'font-semibold text-ink',
      },
      {
        key: 'contact_name',
        label: t('customer.contact'),
        className: 'text-ink-soft',
      },
      {
        key: 'email',
        label: t('customer.email'),
        className: 'text-ink-soft',
      },
      {
        key: 'phone',
        label: t('customer.phone'),
        className: 'text-ink-subtle',
      },
      {
        key: 'active',
        label: t('customer.status'),
        render: (active) => (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            active ? 'bg-brand-50 text-brand-700' : 'bg-cloud text-ink-soft'
          }`}>
            {active ? t('common.active') : t('common.inactive')}
          </span>
        ),
        sortFn: (a, b) => {
          if (a === b) return 0;
          return a ? -1 : 1;
        },
      },
      {
        key: 'actions',
        label: '',
        render: (_, customer) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="text-sm font-medium text-accent hover:underline"
              onClick={() => onEditCustomer?.(customer)}
            >
              {t('customer.edit')}
            </button>
            <button
              type="button"
              className="text-sm font-medium text-rose-600 hover:underline"
              onClick={() => onDeleteCustomer?.(customer)}
            >
              {t('customer.delete')}
            </button>
          </div>
        ),
      },
    ],
    [t, onEditCustomer, onDeleteCustomer]
  );

  const emptyMessage = query
    ? t('customer.no_results', { query })
    : t('customer.empty');

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-subtle">{t('customer.title')}</p>
              <h1 className="mt-3 text-3xl font-semibold text-ink">{t('customer.all_customers')}</h1>
              <p className="mt-2 text-sm text-ink-soft">{t('customer.overview')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl border border-sand bg-white p-1">
                <button
                  type="button"
                  onClick={() => handleViewModeChange('table')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    viewMode === 'table' ? 'bg-brand-700 text-white' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {t('common.list')}
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange('card')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    viewMode === 'card' ? 'bg-brand-700 text-white' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {t('common.card')}
                </button>
              </div>
              <button
                type="button"
                onClick={() => onCreateCustomer?.()}
                className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
              >
                {t('customer.new')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
        {/* Toolbar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar value={query} onChange={setQuery} />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
          >
            {ACTIVE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>
            ))}
          </select>
          <span className="whitespace-nowrap text-xs text-ink-subtle">
            {t('customer.showing', { count: filtered.length, total: (customers || []).length })}
          </span>
        </div>

        {viewMode === 'table' ? (
          <DataTable columns={columns} data={filtered} emptyMessage={emptyMessage} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered && filtered.length > 0 ? (
              filtered.map((customer, index) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={onEditCustomer}
                  onDelete={onDeleteCustomer}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-ink-subtle">{emptyMessage}</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
