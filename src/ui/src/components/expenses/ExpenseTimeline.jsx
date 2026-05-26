// src/ui/src/components/expenses/ExpenseTimeline.jsx
import { useMemo } from 'react';
import { ExpenseTimelineRow } from './ExpenseTimelineRow';

const MONTH_NAMES_NO = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

function monthLabel(yyyyMm) {
  if (yyyyMm === 'ukjent') return 'Ukjent dato';
  const [year, month] = yyyyMm.split('-');
  return `${MONTH_NAMES_NO[parseInt(month, 10) - 1]} ${year}`;
}

export function ExpenseTimeline({ expenses = [], formatCurrency, onSelectExpense, selectedExpenseId }) {
  const groups = useMemo(() => {
    const map = new Map();
    for (const expense of expenses) {
      const key = expense.date ? expense.date.slice(0, 7) : 'ukjent';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(expense);
    }
    // Sort groups descending
    return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [expenses]);

  if (groups.length === 0) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--f-text-subtle)', fontSize: 14 }}>
        Ingen utgifter å vise
      </div>
    );
  }

  return (
    <div>
      {groups.map(([monthKey, rows]) => {
        const groupTotal = rows.reduce((sum, e) => sum + (e.amount || 0), 0);
        return (
          <div key={monthKey} style={{ marginBottom: 24 }}>
            {/* Month divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--f-text-subtle)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                {monthLabel(monthKey)}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--f-border)' }} />
              <span style={{ fontSize: 12, color: 'var(--f-text-subtle)', whiteSpace: 'nowrap' }}>
                {formatCurrency ? formatCurrency(groupTotal) : groupTotal}
              </span>
            </div>

            {/* Rows */}
            {rows.map((expense) => (
              <ExpenseTimelineRow
                key={expense.id}
                expense={expense}
                formatCurrency={formatCurrency}
                isSelected={selectedExpenseId === expense.id}
                onClick={() => onSelectExpense?.(expense.id)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
