import { AnimatePresence, motion } from 'framer-motion';

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
};

export function Modal({ isOpen, onClose, title, description, children, footer, size = 'md' }) {
  const maxWidthClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 flex items-center justify-center bg-ink/70 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className={`relative flex flex-col w-full ${maxWidthClass} max-h-[90vh] rounded-3xl border border-sand/70 bg-white shadow-2xl overflow-hidden`}
          >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-sand/60 bg-white/80 px-2 py-0.5 text-xs font-medium text-ink-subtle hover:text-ink"
        >
          Lukk
        </button>

        {(title || description) && (
          <header className="flex-shrink-0 px-6 pt-6 pb-4">
            {title ? (
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-ink-soft">{description}</p>
            ) : null}
          </header>
        )}

        <div className="flex-1 overflow-y-auto px-6">
          <div className="space-y-4 text-sm text-ink pb-4">{children}</div>
        </div>

        {footer ? (
          <footer className="flex-shrink-0 px-6 pb-6 pt-4 flex items-center justify-end gap-3 border-t border-sand/40 bg-white">
            {footer}
          </footer>
        ) : null}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


