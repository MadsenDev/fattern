// src/ui/src/components/expenses/ExpenseTimelineRow.jsx
import { IconPaperclip } from '@tabler/icons-react';

export function ExpenseTimelineRow({ expense, formatCurrency, isSelected, onClick }) {
  const accentColor = expense.category_color || '#555555';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        cursor: 'pointer',
        border: `1px solid ${isSelected ? accentColor : 'var(--f-border)'}`,
        background: isSelected ? `${accentColor}12` : 'var(--f-surface)',
        transition: 'border-color 150ms, background 150ms',
        marginBottom: 6,
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          width: 4,
          alignSelf: 'stretch',
          borderRadius: 2,
          background: accentColor,
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: 'var(--f-text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {expense.vendor || 'Ukjent leverandør'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--f-text-subtle)', marginTop: 2 }}>
          <span>{expense.date}</span>
          {expense.category_name && (
            <>
              {' · '}
              <span style={{ color: accentColor }}>{expense.category_name}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side: amount + attachment indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        {expense.attachment_path && (
          <IconPaperclip size={14} stroke={1.5} title="Har kvittering" aria-label="Har kvittering" style={{ color: 'var(--f-text-subtle)', flexShrink: 0 }} />
        )}
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--f-text)' }}>
          {formatCurrency ? formatCurrency(expense.amount) : expense.amount}
        </span>
      </div>
    </div>
  );
}
