import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/formatDate';
import { IconEdit, IconTrash, IconFileText } from '@tabler/icons-react';
import { motion } from 'framer-motion';

export function ExpenseCard({ expense, formatCurrency: fmt, onEdit, onDelete }) {
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  useEffect(() => {
    if (!expense.attachment_path) {
      setReceiptPreview(null);
      return;
    }

    setLoadingImage(true);
    if (window.fattern?.expense?.readAttachment) {
      window.fattern.expense
        .readAttachment(expense.attachment_path)
        .then((dataURL) => {
          setReceiptPreview(dataURL);
          setLoadingImage(false);
        })
        .catch(() => {
          setReceiptPreview(null);
          setLoadingImage(false);
        });
    } else {
      setLoadingImage(false);
    }
  }, [expense.attachment_path]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group rounded-2xl transition"
      style={{ background: 'var(--f-surface)', border: '1px solid var(--f-border-subtle)', backdropFilter: 'blur(12px)' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--f-border-green)'; e.currentTarget.style.background = 'var(--f-surface-hover)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--f-border-subtle)'; e.currentTarget.style.background = 'var(--f-surface)'; }}
    >
      <div className="flex gap-4 p-4">
        {/* Receipt Image */}
        <div className="flex-shrink-0">
          {receiptPreview ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-xl" style={{ border: '1px solid var(--f-border-subtle)' }}>
              <img
                src={receiptPreview}
                alt="Kvittering"
                className="h-full w-full object-cover"
                onClick={() => {
                  const img = new Image();
                  img.src = receiptPreview;
                  const w = window.open('');
                  w?.document.write(img.outerHTML);
                }}
                style={{ cursor: 'pointer' }}
              />
            </div>
          ) : loadingImage ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl" style={{ border: '1px solid var(--f-border-subtle)', background: 'rgba(255,255,255,0.04)' }}>
              <div className="h-4 w-4 animate-spin rounded-full" style={{ border: '2px solid var(--f-border)', borderTopColor: 'var(--f-green)' }} />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl" style={{ border: '1px solid var(--f-border-subtle)', background: 'rgba(255,255,255,0.04)', color: 'var(--f-text-subtle)' }}>
              <IconFileText className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Expense Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate" style={{ color: 'var(--f-text-body)' }}>{expense.vendor || 'Ukjent leverandør'}</h3>
              {expense.category_name && (
                <p className="mt-1 text-sm" style={{ color: 'var(--f-text-soft)' }}>{expense.category_name}</p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs" style={{ color: 'var(--f-text-subtle)' }}>
                <span>{expense.date ? formatDate(expense.date) : '—'}</span>
                {expense.currency && expense.currency !== 'NOK' && (
                  <span>{expense.currency}</span>
                )}
              </div>
              {expense.notes && (
                <p className="mt-2 line-clamp-2 text-xs" style={{ color: 'var(--f-text-soft)' }}>{expense.notes}</p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-lg font-semibold" style={{ color: 'var(--f-text)' }}>{fmt(expense.amount || 0)}</p>
              {expense.items && expense.items.length > 0 && (
                <p className="text-xs" style={{ color: 'var(--f-text-subtle)' }}>{expense.items.length} linjeelementer</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onEdit?.(expense)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition"
              style={{ color: 'var(--f-text-subtle)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--f-green-bg)'; e.currentTarget.style.color = 'var(--f-green-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--f-text-subtle)'; }}
              title="Rediger"
            >
              <IconEdit size={15} stroke={1.8} />
            </button>
            <button
              onClick={() => onDelete?.(expense)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition"
              style={{ color: 'var(--f-text-subtle)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--f-danger-bg)'; e.currentTarget.style.color = 'var(--f-danger-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--f-text-subtle)'; }}
              title="Slett"
            >
              <IconTrash size={15} stroke={1.8} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
