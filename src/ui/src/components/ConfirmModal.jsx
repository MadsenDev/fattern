import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onDeactivate,
  title,
  description,
  confirmLabel,
  deactivateLabel,
  cancelLabel,
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
  showDeactivate = false,
}) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('common.confirm');
  const resolvedConfirmLabel = confirmLabel ?? t('common.confirm');
  const resolvedDeactivateLabel = deactivateLabel ?? t('common.deactivate');
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel');
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
      title={resolvedTitle}
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
            {resolvedCancelLabel}
          </button>
          <div className="flex gap-2">
            {showDeactivate && (
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isLoading}
                className="f-btn-primary rounded-2xl px-5 py-2 text-sm font-semibold transition disabled:opacity-60"
              >
                {isLoading ? t('common.processing') : resolvedDeactivateLabel}
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={`rounded-2xl px-5 py-2 text-sm font-semibold transition disabled:opacity-60 ${styles.button}`}
              style={variant === 'warning' ? { background: 'rgba(217,119,6,0.15)', color: '#fbbf24', border: '1px solid rgba(217,119,6,0.3)' } : {}}
            >
              {isLoading ? t('common.processing') : resolvedConfirmLabel}
            </button>
          </div>
        </div>
      }
    />
  );
}

