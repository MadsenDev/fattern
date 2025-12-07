import { useMemo, useState, useEffect } from 'react';
import { DataTable } from '../components/DataTable';
import { ProductCard } from '../components/ProductCard';
import { formatCurrency } from '../utils/formatCurrency';
import { useSettings } from '../hooks/useSettings';

export function ProductsPage({ products, formatCurrency: fmt, onEditProduct, onDeleteProduct, onCreateProduct }) {
  const { getSetting, updateSetting } = useSettings();
  const defaultView = getSetting('products.defaultView', 'table');
  const [viewMode, setViewMode] = useState(defaultView); // 'table' | 'card'

  useEffect(() => {
    if (defaultView) {
      setViewMode(defaultView);
    }
  }, [defaultView]);

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    updateSetting('products.defaultView', mode);
  };
  const columns = useMemo(
    () => [
      {
        key: 'name',
        label: 'Navn',
        className: 'font-semibold text-ink',
      },
      {
        key: 'sku',
        label: 'SKU',
        className: 'text-ink-soft',
      },
      {
        key: 'unit_price',
        label: 'Pris',
        align: 'right',
        render: (price) => (typeof price === 'number' ? fmt(price) : '—'),
        className: 'font-medium text-ink',
        sortFn: (a, b) => {
          const aVal = typeof a === 'number' ? a : 0;
          const bVal = typeof b === 'number' ? b : 0;
          return aVal - bVal;
        },
      },
      {
        key: 'vat_rate',
        label: 'MVA',
        align: 'right',
        render: (rate) => (rate != null ? `${(rate * 100).toFixed(0)}%` : '—'),
        className: 'text-ink-subtle',
        sortFn: (a, b) => {
          const aVal = a != null ? a : 0;
          const bVal = b != null ? b : 0;
          return aVal - bVal;
        },
      },
      {
        key: 'unit',
        label: 'Enhet',
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
        render: (_, product) => (
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              className="text-sm font-medium text-accent hover:underline"
              onClick={() => onEditProduct?.(product)}
            >
              Rediger
            </button>
            <button
              type="button"
              className="text-sm font-medium text-rose-600 hover:underline"
              onClick={() => onDeleteProduct?.(product)}
            >
              Slett
            </button>
          </div>
        ),
      },
    ],
    [fmt, onEditProduct, onDeleteProduct]
  );

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-subtle">Produkter</p>
              <h1 className="mt-3 text-3xl font-semibold text-ink">Alle produkter</h1>
              <p className="mt-2 text-sm text-ink-soft">Oversikt over alle produkter i systemet</p>
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
                onClick={() => onCreateProduct?.()}
                className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
              >
                Nytt produkt
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
        {viewMode === 'table' ? (
          <DataTable columns={columns} data={products || []} emptyMessage="Ingen produkter funnet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  formatCurrency={fmt}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-ink-subtle">Ingen produkter funnet</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

