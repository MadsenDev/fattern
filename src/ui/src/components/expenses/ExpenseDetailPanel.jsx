// src/ui/src/components/expenses/ExpenseDetailPanel.jsx
import { useEffect, useState, useRef } from 'react';

export function ExpenseDetailPanel({ expense, formatCurrency, onEdit, onDelete, onClose }) {
  const [visible, setVisible] = useState(false);
  const [attachmentSrc, setAttachmentSrc] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const dialogRef = useRef(null);

  // Slide in when expense mounts
  useEffect(() => {
    if (expense) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [expense]);

  // Load attachment image
  useEffect(() => {
    if (!expense?.attachment_path) {
      setAttachmentSrc(null);
      return;
    }
    const api = window.fattern?.expense;
    if (!api?.readAttachment) return;
    api.readAttachment(expense.attachment_path)
      .then((data) => setAttachmentSrc(data))
      .catch(() => setAttachmentSrc(null));
  }, [expense?.attachment_path]);

  // Lightbox
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [lightboxOpen]);

  const handleClose = () => {
    setVisible(false);
    // Wait for slide-out transition before clearing selection
    setTimeout(() => onClose?.(), 220);
  };

  if (!expense) return null;

  const accentColor = expense.category_color || '#555555';

  // Derive VAT from items if present
  let vatAmount = null;
  let baseAmount = null;
  if (expense.items && expense.items.length > 0) {
    baseAmount = expense.items.reduce((s, item) => s + (item.unitPrice || 0) * (item.quantity || 1), 0);
    vatAmount = (expense.amount || 0) - baseAmount;
  }

  return (
    <>
      {/* Panel */}
      <div
        style={{
          width: 380,
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          maxHeight: '100vh',
          overflowY: 'auto',
          background: 'var(--f-surface)',
          border: '1px solid var(--f-border)',
          borderRadius: 20,
          padding: 24,
          transform: visible ? 'translateX(0)' : 'translateX(110%)',
          transition: 'transform 220ms ease-out',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 12,
                  background: `${accentColor}22`,
                  color: accentColor,
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {expense.category_name || 'Ukategorisert'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--f-text)', wordBreak: 'break-word' }}>
                {expense.vendor || 'Ukjent leverandør'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--f-text-subtle)', marginTop: 4 }}>
                {expense.date}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--f-text-subtle)',
                fontSize: 18,
                cursor: 'pointer',
                padding: 4,
                lineHeight: 1,
                flexShrink: 0,
              }}
              aria-label="Lukk"
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--f-text)', marginTop: 8 }}>
            {formatCurrency ? formatCurrency(expense.amount) : expense.amount}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--f-border)', marginBottom: 16 }} />

        {/* Receipt */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--f-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Kvittering
          </div>
          {attachmentSrc ? (
            <img
              src={attachmentSrc}
              alt="Kvittering"
              onClick={() => setLightboxOpen(true)}
              style={{
                width: '100%',
                borderRadius: 12,
                cursor: 'zoom-in',
                objectFit: 'cover',
                maxHeight: 180,
                border: '1px solid var(--f-border)',
              }}
            />
          ) : (
            <div
              style={{
                padding: '16px',
                borderRadius: 12,
                border: '1px dashed var(--f-border)',
                textAlign: 'center',
                color: 'var(--f-text-subtle)',
                fontSize: 12,
              }}
            >
              Ingen kvittering
            </div>
          )}
        </div>

        {/* Amounts (only if items present) */}
        {baseAmount !== null && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--f-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Beløp
            </div>
            <div style={{ fontSize: 13, color: 'var(--f-text-soft)' }}>
              {[
                { label: 'Grunnbeløp', value: formatCurrency ? formatCurrency(baseAmount) : baseAmount },
                { label: 'MVA', value: vatAmount !== null ? (formatCurrency ? formatCurrency(vatAmount) : vatAmount) : '—' },
                { label: 'Totalt', value: formatCurrency ? formatCurrency(expense.amount) : expense.amount },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--f-border)' }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: label === 'Totalt' ? 700 : 400 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {expense.notes && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--f-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Notat
            </div>
            <p style={{ fontSize: 13, color: 'var(--f-text-soft)', margin: 0, lineHeight: 1.5 }}>
              {expense.notes}
            </p>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--f-border)', marginBottom: 16 }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => onEdit?.(expense)}
            className="f-btn-ghost"
            style={{ flex: 1, padding: '8px 0', borderRadius: 12, fontSize: 13, fontWeight: 600 }}
          >
            Rediger
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(expense.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              background: 'rgba(220,50,50,0.08)',
              color: 'var(--f-danger, #e05555)',
              border: '1px solid rgba(220,50,50,0.2)',
              cursor: 'pointer',
            }}
          >
            Slett
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && setLightboxOpen(false)}
        style={{
          border: 'none',
          background: 'rgba(0,0,0,0.85)',
          padding: 0,
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: 12,
        }}
      >
        {attachmentSrc && (
          <img
            src={attachmentSrc}
            alt="Kvittering full størrelse"
            style={{ display: 'block', maxWidth: '100%', maxHeight: '85vh', borderRadius: 12 }}
          />
        )}
      </dialog>
    </>
  );
}
