import { useTranslation } from 'react-i18next';
import { FiSearch, FiX } from 'react-icons/fi';

export function SearchBar({ value, onChange, placeholder }) {
  const { t } = useTranslation();
  return (
    <div className="relative">
      <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || t('common.search')}
        className="w-full rounded-2xl border border-sand bg-white py-2 pl-9 pr-9 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
          aria-label="Tøm søk"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
