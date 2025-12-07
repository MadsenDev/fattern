import { useEffect, useState } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const variants = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    icon: FiCheckCircle,
    iconColor: 'text-green-600',
    progress: 'bg-green-600',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    icon: FiAlertCircle,
    iconColor: 'text-red-600',
    progress: 'bg-red-600',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    icon: FiAlertTriangle,
    iconColor: 'text-amber-600',
    progress: 'bg-amber-600',
  },
  info: {
    bg: 'bg-brand-50',
    border: 'border-brand-200',
    text: 'text-brand-900',
    icon: FiInfo,
    iconColor: 'text-brand-600',
    progress: 'bg-brand-600',
  },
};

export function Toast({ id, message, variant = 'info', duration = 4000, onClose }) {
  const style = variants[variant] || variants.info;
  const Icon = style.icon;
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true);
        // Wait for exit animation before removing
        setTimeout(() => {
          onClose?.(id);
        }, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border ${style.bg} ${style.border} ${style.text} p-4 shadow-xl min-w-[320px] max-w-md transition-all duration-300 ease-out ${
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      }`}
      role="alert"
    >
      <div className="flex-shrink-0">
        <div className={`rounded-full ${style.iconColor.replace('text-', 'bg-')} bg-opacity-10 p-2`}>
          <Icon className={`h-5 w-5 ${style.iconColor}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium leading-snug">{message}</div>
        {duration > 0 && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/50">
            <div
              className={`h-full ${style.progress} transition-all ease-linear`}
              style={{
                width: isExiting ? '0%' : '100%',
                transitionDuration: `${duration}ms`,
              }}
            />
          </div>
        )}
      </div>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose?.(id), 300);
        }}
        className={`flex-shrink-0 rounded-lg p-1 ${style.iconColor} hover:bg-white/50 transition-colors`}
        aria-label="Lukk"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto animate-in slide-in-from-right">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

