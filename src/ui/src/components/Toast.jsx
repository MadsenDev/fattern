import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
          onClose?.(id);
        }
      }, 16); // ~60fps
      
      return () => clearInterval(interval);
    }
  }, [id, duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-start gap-3 rounded-xl border ${style.bg} ${style.border} ${style.text} p-4 shadow-xl min-w-[320px] max-w-md`}
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
            <motion.div
              className={`h-full ${style.progress}`}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: 'linear' }}
            />
          </div>
        )}
      </div>
      <motion.button
        onClick={() => onClose?.(id)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`flex-shrink-0 rounded-lg p-1 ${style.iconColor} hover:bg-white/50 transition-colors`}
        aria-label="Lukk"
      >
        <FiX className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

