import { Modal } from '../Modal';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

export function TimelineModal({ isOpen, onClose, activityFeed, formatCurrency: fmt }) {
  const formatValue = (value) => (typeof fmt === 'function' ? fmt(value) : value);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tidslinje"
      description="Oversikt over alle økonomihendelser i systemet"
    >
      <div className="max-h-[70vh] space-y-4 overflow-y-auto">
        {activityFeed && activityFeed.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-sand/60" />
            
            <div className="space-y-6">
              {activityFeed.map((item) => (
                <div key={item.id} className="relative flex items-start gap-4">
                  {/* Timeline dot */}
                  <div
                    className={`relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border ${
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

                  {/* Content */}
                  <div className="flex-1 rounded-2xl border border-sand/60 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-ink">{item.title}</p>
                        <p className="mt-1 text-sm text-ink-soft">{item.detail}</p>
                        <p className="mt-2 text-xs text-ink-subtle">{item.time}</p>
                      </div>
                      {typeof item.amount === 'number' ? (
                        <p
                          className={`text-right text-sm font-semibold ${
                            item.amount > 0 ? 'text-brand-700' : 'text-ink-subtle'
                          }`}
                        >
                          {item.amount > 0 ? '+' : ''}
                          {formatValue(Math.abs(item.amount))}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-sand/60 bg-white p-12 text-center">
            <p className="text-sm text-ink-subtle">Ingen hendelser å vise</p>
            <p className="mt-1 text-xs text-ink-subtle">Aktiviteter vil vises her når de oppstår</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

