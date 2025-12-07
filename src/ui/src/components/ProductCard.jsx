import { formatCurrency } from '../utils/formatCurrency';

export function ProductCard({ product, formatCurrency: fmt, onEdit, onDelete }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card transition hover:shadow-lg">
      {product.image_path ? (
        <div className="aspect-square w-full overflow-hidden bg-cloud">
          <img
            src={product.image_path}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-square w-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-ink">{product.name}</h3>
            {product.sku && <p className="mt-1 text-xs text-ink-subtle">SKU: {product.sku}</p>}
          </div>
          <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            product.active ? 'bg-brand-50 text-brand-700' : 'bg-cloud text-ink-soft'
          }`}>
            {product.active ? 'Aktiv' : 'Inaktiv'}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-ink">{fmt(product.unit_price || 0)}</p>
            {product.unit && <p className="text-xs text-ink-subtle">per {product.unit}</p>}
          </div>
        </div>
        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{product.description}</p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(product)}
            className="flex-1 rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
          >
            Rediger
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(product)}
            className="flex-1 rounded-xl border border-sand bg-white px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-cloud"
          >
            Slett
          </button>
        </div>
      </div>
    </div>
  );
}

