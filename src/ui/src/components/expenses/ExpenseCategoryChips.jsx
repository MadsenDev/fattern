// src/ui/src/components/expenses/ExpenseCategoryChips.jsx
import { useTranslation } from 'react-i18next';

export function ExpenseCategoryChips({ breakdown = [], activeCategory, onSelectCategory, query = '', onQueryChange }) {
  const { t } = useTranslation();

  const chipBase = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'all 150ms',
    whiteSpace: 'nowrap',
  };

  const chipActive = {
    background: 'var(--f-accent)',
    color: '#fff',
    borderColor: 'var(--f-accent)',
  };

  const chipInactive = {
    background: 'var(--f-surface-2)',
    color: 'var(--f-text-soft)',
    borderColor: 'var(--f-border)',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 4,
        marginBottom: 4,
        scrollbarWidth: 'none',
      }}
    >
      {/* "Alle" chip */}
      <button
        type="button"
        style={{ ...chipBase, ...(activeCategory === null ? chipActive : chipInactive) }}
        onClick={() => onSelectCategory?.(null)}
      >
        {t('expense.all_expenses_label', 'Alle')}
      </button>

      {/* Category chips */}
      {breakdown.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id ?? 'uncategorised'}
            type="button"
            style={{
              ...chipBase,
              ...(isActive ? { background: cat.color || '#555', color: '#fff', borderColor: cat.color || '#555' } : chipInactive),
            }}
            onClick={() => onSelectCategory?.(isActive ? null : cat.id)}
          >
            {!isActive && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: cat.color || '#555',
                  flexShrink: 0,
                }}
              />
            )}
            {cat.name}
          </button>
        );
      })}

      {/* Search input — pushed to right */}
      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange?.(e.target.value)}
          placeholder={t('common.search', 'Søk…')}
          style={{
            padding: '4px 12px',
            borderRadius: 20,
            border: '1px solid var(--f-border)',
            background: 'var(--f-surface-2)',
            color: 'var(--f-text)',
            fontSize: 13,
            outline: 'none',
            width: 160,
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--f-accent)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--f-border)'; }}
        />
      </div>
    </div>
  );
}
