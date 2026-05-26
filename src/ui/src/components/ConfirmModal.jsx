import { Modal } from './Modal';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onDeactivate,
  title = 'Bekreft handling',
  description,
  confirmLabel = 'Bekreft',
  deactivateLabel = 'Deaktiver',
  cancelLabel = 'Avbryt',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
  showDeactivate = false,
}) {
  const variantStyles = {
    danger: { button: 'f-btn-danger' },
    warning: { button: '' }, // inline amber styling
    info: { button: 'f-btn-primary' },
  };

  const styles = variantStyles[variant] || variantStyles.danger;

  const handleConfirm = async () => {
    try {
      await onConfirm?.();
      onClose?.();
    } catch (error) {
      console.error('Bekreftelse feilet', error);
    }
  };

  const handleDeactivate = async () => {
    try {
      await onDeactivate?.();
      onClose?.();
    } catch (error) {
      console.error('Deaktivering feilet', error);
      // Don't close on error so user can see what went wrong
      throw error;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <div className="flex items-center justify-between w-full">
          <button
            type="button"
            className="text-sm font-medium transition"
            style={{ color: 'var(--f-text-subtle)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--f-text-body)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--f-text-subtle)'}
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <div className="flex gap-2">
            {showDeactivate && (
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isLoading}
                className="f-btn-primary rounded-2xl px-5 py-2 text-sm font-semibold transition disabled:opacity-60"
              >
                {isLoading ? 'Behandler...' : deactivateLabel}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`rounded-2xl px-5 py-2 text-sm font-semibold transition disabled:opacity-60 ${styles.button}`}
              style={variant === 'warning' ? { background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.3)' } : {}}
            >
              {isLoading ? 'Behandler...' : confirmLabel}
            </button>
          </div>
        </div>
      }
    />
  );
}

