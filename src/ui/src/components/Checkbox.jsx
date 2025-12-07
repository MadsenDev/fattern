import { FiCheck } from 'react-icons/fi';

export function Checkbox({ checked, onChange, label, description, disabled = false, className = '' }) {
  return (
    <label
      className={`group flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`relative flex h-5 w-5 items-center justify-center rounded-xl border-2 transition-all duration-200 shadow-sm ${
            checked
              ? 'bg-brand-700 border-brand-700 text-white shadow-brand-700/20'
              : 'bg-white border-sand/60 text-transparent group-hover:border-brand-400 group-hover:bg-brand-50/50'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
            !disabled && !checked ? 'group-hover:shadow-md' : ''
          }`}
        >
          {checked && (
            <FiCheck className="h-3.5 w-3.5 transition-all duration-200" style={{ strokeWidth: 2.5 }} />
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        {label && (
          <span className={`block text-sm font-medium transition-colors ${checked ? 'text-ink' : 'text-ink-soft'}`}>
            {label}
          </span>
        )}
        {description && (
          <span className="mt-0.5 block text-xs text-ink-subtle">{description}</span>
        )}
      </div>
    </label>
  );
}

