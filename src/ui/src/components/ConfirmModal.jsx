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
    danger: {
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
      icon: 'text-rose-600',
    },
    warning: {
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
      icon: 'text-amber-600',
    },
    info: {
      button: 'bg-brand-700 hover:bg-brand-800 text-white',
      icon: 'text-brand-600',
    },
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
            className="text-sm font-medium text-ink-subtle hover:text-ink"
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
                className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-800 disabled:opacity-60"
              >
                {isLoading ? 'Behandler...' : deactivateLabel}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`rounded-2xl px-5 py-2 text-sm font-semibold shadow-card transition disabled:opacity-60 ${styles.button}`}
            >
              {isLoading ? 'Behandler...' : confirmLabel}
            </button>
          </div>
        </div>
      }
    />
  );
}

