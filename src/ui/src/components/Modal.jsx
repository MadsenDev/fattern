export function Modal({ isOpen, onClose, title, description, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/70 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg rounded-3xl border border-sand/70 bg-white/95 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-sand/60 bg-white/80 px-2 py-0.5 text-xs font-medium text-ink-subtle hover:text-ink"
        >
          Lukk
        </button>

        {(title || description) && (
          <header className="mb-4">
            {title ? (
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
            ) : null}
            {description ? (
              <p className="mt-1 text-sm text-ink-soft">{description}</p>
            ) : null}
          </header>
        )}

        <div className="space-y-4 text-sm text-ink">{children}</div>

        {footer ? (
          <footer className="mt-6 flex items-center justify-end gap-3 border-t border-sand/40 pt-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}


