import { motion } from 'framer-motion';

export function CustomerCard({ customer, onEdit, onDelete, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card transition hover:shadow-lg"
    >
      {customer.image_path ? (
        <div className="aspect-square w-full overflow-hidden bg-cloud">
          <img
            src={customer.image_path}
            alt={customer.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="aspect-square w-full bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-200 text-2xl font-semibold text-brand-700">
              {customer.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-ink">{customer.name}</h3>
            {customer.contact_name && <p className="mt-1 text-xs text-ink-subtle">{customer.contact_name}</p>}
          </div>
          <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            customer.active ? 'bg-brand-50 text-brand-700' : 'bg-cloud text-ink-soft'
          }`}>
            {customer.active ? 'Aktiv' : 'Inaktiv'}
          </span>
        </div>
        <div className="mt-3 space-y-1 text-sm">
          {customer.email && (
            <p className="text-ink-soft">
              <span className="text-ink-subtle">E-post:</span> {customer.email}
            </p>
          )}
          {customer.phone && (
            <p className="text-ink-soft">
              <span className="text-ink-subtle">Telefon:</span> {customer.phone}
            </p>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => onEdit?.(customer)}
            className="flex-1 rounded-xl bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-100"
          >
            Rediger
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(customer)}
            className="flex-1 rounded-xl border border-sand bg-white px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-cloud"
          >
            Slett
          </button>
        </div>
      </div>
    </motion.div>
  );
}

