import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { FiEdit2, FiTrash2, FiFileText } from 'react-icons/fi';
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
      className="group rounded-2xl border border-sand/60 bg-white shadow-sm transition hover:shadow-md hover:border-brand-200"
    >
      <div className="flex gap-4 p-4">
        {/* Receipt Image */}
        <div className="flex-shrink-0">
          {receiptPreview ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-sand/60 bg-cloud/30">
              <img
                src={receiptPreview}
                alt="Kvittering"
                className="h-full w-full object-cover"
                onClick={() => {
                  // Open image in modal or full view
                  const img = new Image();
                  img.src = receiptPreview;
                  const w = window.open('');
                  w?.document.write(img.outerHTML);
                }}
                style={{ cursor: 'pointer' }}
              />
            </div>
          ) : loadingImage ? (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-sand/60 bg-cloud/30">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-700" />
            </div>
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-sand/60 bg-cloud/30 text-ink-subtle">
              <FiFileText className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Expense Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-ink truncate">{expense.vendor || 'Ukjent leverandør'}</h3>
              {expense.category_name && (
                <p className="mt-1 text-sm text-ink-soft">{expense.category_name}</p>
              )}
              <div className="mt-2 flex items-center gap-4 text-xs text-ink-subtle">
                <span>{expense.date ? formatDate(expense.date) : '—'}</span>
                {expense.currency && expense.currency !== 'NOK' && (
                  <span>{expense.currency}</span>
                )}
              </div>
              {expense.notes && (
                <p className="mt-2 line-clamp-2 text-xs text-ink-soft">{expense.notes}</p>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-lg font-semibold text-ink">{fmt(expense.amount || 0)}</p>
              {expense.items && expense.items.length > 0 && (
                <p className="text-xs text-ink-subtle">{expense.items.length} linjeelementer</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => onEdit?.(expense)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-subtle hover:bg-brand-50 hover:text-brand-700 transition"
              title="Rediger"
            >
              <FiEdit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete?.(expense)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-subtle hover:bg-rose-50 hover:text-rose-600 transition"
              title="Slett"
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

