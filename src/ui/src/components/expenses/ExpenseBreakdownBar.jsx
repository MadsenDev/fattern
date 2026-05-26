// src/ui/src/components/expenses/ExpenseBreakdownBar.jsx
export function ExpenseBreakdownBar({ breakdown = [], totalAmount = 0, activeCategory, onSelectCategory }) {
  const grandTotal = breakdown.reduce((sum, c) => sum + c.total, 0) || 1;

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Stacked bar */}
      <div
        style={{
          display: 'flex',
          gap: 2,
          height: 12,
          borderRadius: 6,
          overflow: 'hidden',
          background: 'var(--f-surface-2)',
        }}
      >
        {breakdown.map((cat) => (
          <div
            key={cat.id ?? 'uncategorised'}
            title={cat.name}
            style={{
              flex: cat.total / grandTotal,
              background: cat.color || '#555',
              cursor: 'pointer',
              transition: 'opacity 150ms',
              opacity: activeCategory === null || activeCategory === cat.id ? 1 : 0.35,
            }}
            onClick={() => onSelectCategory?.(activeCategory === cat.id ? null : cat.id)}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 10 }}>
        {breakdown.map((cat) => {
          const pct = ((cat.total / grandTotal) * 100).toFixed(1);
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id ?? 'uncategorised'}
              type="button"
              onClick={() => onSelectCategory?.(activeCategory === cat.id ? null : cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                opacity: activeCategory === null || isActive ? 1 : 0.5,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: cat.color || '#555',
                  flexShrink: 0,
                  outline: isActive ? `2px solid ${cat.color || '#555'}` : 'none',
                  outlineOffset: 2,
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--f-text-soft)' }}>
                {cat.name}
              </span>
              <span style={{ fontSize: 12, color: 'var(--f-text-subtle)', marginLeft: 2 }}>
                {pct}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
