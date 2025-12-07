import { useMemo, useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { CustomerCard } from '../components/CustomerCard';
import { useSettings } from '../hooks/useSettings';

export function CustomersPage({ customers, onEditCustomer, onDeleteCustomer, onCreateCustomer }) {
  const { getSetting, updateSetting } = useSettings();
  const defaultView = getSetting('customers.defaultView', 'table');
  const [viewMode, setViewMode] = useState(defaultView); // 'table' | 'card'

  useEffect(() => {
    if (defaultView) {
      setViewMode(defaultView);
    }
  }, [defaultView]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    updateSetting('customers.defaultView', mode);
  };
  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Navn',
        className: 'font-semibold text-ink',
      },
      {
        key: 'contact_name',
        label: 'Kontaktperson',
        className: 'text-ink-soft',
      },
      {
        key: 'email',
        label: 'E-post',
        className: 'text-ink-soft',
      },
      {
        key: 'phone',
        label: 'Telefon',
        className: 'text-ink-subtle',
      },
      {
        key: 'active',
        label: 'Status',
        render: (active) => (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            active ? 'bg-brand-50 text-brand-700' : 'bg-cloud text-ink-soft'
          }`}>
            {active ? 'Aktiv' : 'Inaktiv'}
          </span>
        ),
        sortFn: (a, b) => {
          // Sort active first
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
              Rediger
            </button>
            <button
              type="button"
              className="text-sm font-medium text-rose-600 hover:underline"
              onClick={() => onDeleteCustomer?.(customer)}
            >
              Slett
            </button>
          </div>
        ),
      },
    ],
    [onEditCustomer, onDeleteCustomer]
  );

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-subtle">Kunder</p>
              <h1 className="mt-3 text-3xl font-semibold text-ink">Alle kunder</h1>
              <p className="mt-2 text-sm text-ink-soft">Oversikt over alle kunder i systemet</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl border border-sand bg-white p-1">
                <button
                  type="button"
                  onClick={() => handleViewModeChange('table')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    viewMode === 'table'
                      ? 'bg-brand-700 text-white'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Liste
                </button>
                <button
                  type="button"
                  onClick={() => handleViewModeChange('card')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    viewMode === 'card'
                      ? 'bg-brand-700 text-white'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  Kort
                </button>
              </div>
              <button
                type="button"
                onClick={() => onCreateCustomer?.()}
                className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
              >
                Ny kunde
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
        {viewMode === 'table' ? (
          <DataTable columns={columns} data={customers || []} emptyMessage="Ingen kunder funnet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {customers && customers.length > 0 ? (
              customers.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onEdit={onEditCustomer}
                  onDelete={onDeleteCustomer}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-ink-subtle">Ingen kunder funnet</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

