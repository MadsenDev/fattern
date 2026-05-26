# Expenses Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the card-grid + sidebar expenses layout with a spend-intelligence focused page: breakdown bar, chip filters, chronological timeline, and a slide-in detail panel.

**Architecture:** DB gains a `color` column on `expense_categories` + a `getExpenseCategoryBreakdown` query. A new `useExpenses` field (`breakdown`) feeds five new React components (`ExpenseBreakdownBar`, `ExpenseCategoryChips`, `ExpenseTimeline`, `ExpenseTimelineRow`, `ExpenseDetailPanel`) orchestrated by a rewritten `ExpensesPage`.

**Tech Stack:** better-sqlite3, Electron IPC, React 18, CSS transitions (no animation library)

---

## File Map

| File | Action |
|------|--------|
| `src/db/schema.js` | Add `color TEXT` to `expense_categories` CREATE TABLE |
| `src/db/initDatabase.js` | Add `color` migration (ALTER TABLE) |
| `src/db/fatternDatabase.js` | `getExpenseCategoryBreakdown`; update `createExpenseCategory`, `updateExpenseCategory`, `listExpensesForBudgetYear` |
| `src/electron/dbHandlers.js` | Register `db:get-expense-category-breakdown` |
| `src/electron/preload.js` | Expose `getExpenseCategoryBreakdown` |
| `src/ui/src/hooks/useExpenses.js` | Add `breakdown` return value |
| `src/ui/src/pages/ExpensesPage.jsx` | Full rewrite |
| `src/ui/src/components/expenses/ExpenseBreakdownBar.jsx` | New |
| `src/ui/src/components/expenses/ExpenseCategoryChips.jsx` | New |
| `src/ui/src/components/expenses/ExpenseTimeline.jsx` | New |
| `src/ui/src/components/expenses/ExpenseTimelineRow.jsx` | New |
| `src/ui/src/components/expenses/ExpenseDetailPanel.jsx` | New |
| `src/ui/src/components/expenses/ExpenseCategoryManagementModal.jsx` | Add color swatch |
| `src/ui/src/components/expenses/ExpenseCategorySidebar.jsx` | Delete |
| `src/ui/src/components/expenses/ExpenseCard.jsx` | Delete |
| `src/ui/src/App.jsx` | Pass `breakdown` to `ExpensesPage` |

---

## Task 1: DB Schema — add `color` to `expense_categories`

**Files:**
- Modify: `src/db/schema.js`
- Modify: `src/db/initDatabase.js`

- [ ] **Step 1: Update the CREATE TABLE statement in schema.js**

Open `src/db/schema.js` and find the `expense_categories` table definition. Add `color TEXT` after `parent_id`:

```js
`CREATE TABLE IF NOT EXISTS expense_categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
  color TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);`,
```

- [ ] **Step 2: Add migration in initDatabase.js**

At the end of the `applyMigrations(db)` function, just before the closing `}`, add:

```js
// Add color column to expense_categories if it doesn't exist
try {
  db.prepare('ALTER TABLE expense_categories ADD COLUMN color TEXT').run();
} catch (error) {
  if (!error.message.includes('duplicate column')) {
    console.warn('Migration warning (expense_categories.color):', error.message);
  }
}
```

- [ ] **Step 3: Verify the migration runs without errors**

```bash
cd /home/chris/Documents/GitHub/fattern
npm run electron:dev 2>&1 | head -30
# Expected: no errors; app starts normally
# Then Ctrl+C to stop
```

- [ ] **Step 4: Commit**

```bash
git add src/db/schema.js src/db/initDatabase.js
git commit -m "feat(db): add color column to expense_categories"
```

---

## Task 2: DB Methods — breakdown query + category color support

**Files:**
- Modify: `src/db/fatternDatabase.js`

The color palette constant, `getExpenseCategoryBreakdown`, updated `createExpenseCategory`, `updateExpenseCategory`, and `listExpensesForBudgetYear`.

- [ ] **Step 1: Add palette constant near the top of fatternDatabase.js**

After the `const toDateOnlyString` definition (or near the top of the file after imports), add:

```js
const CATEGORY_COLOR_PALETTE = [
  '#3fd9a0', '#6ab0c8', '#c47eb0', '#e8a84a', '#e87a6a',
  '#7ab0e8', '#a8c87a', '#c8a06a', '#8ab0c8', '#b8b0e8',
];
```

- [ ] **Step 2: Update `createExpenseCategory` to auto-assign color**

Find `createExpenseCategory(category)` and replace it with:

```js
createExpenseCategory(category) {
  // Auto-assign color from palette if not provided
  let color = category.color || null;
  if (!color) {
    const count = this.db.prepare('SELECT COUNT(*) as n FROM expense_categories').get().n;
    color = CATEGORY_COLOR_PALETTE[count % CATEGORY_COLOR_PALETTE.length];
  }

  const insert = this.db.prepare(`
    INSERT INTO expense_categories (name, parent_id, color)
    VALUES (@name, @parent_id, @color)
  `);

  const info = insert.run({
    name: category.name,
    parent_id: category.parentId || null,
    color,
  });

  return this.db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(info.lastInsertRowid);
}
```

- [ ] **Step 3: Update `updateExpenseCategory` to accept color**

Find `updateExpenseCategory(categoryId, updates)` and replace the `payload` construction + UPDATE query:

```js
updateExpenseCategory(categoryId, updates) {
  const existing = this.db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(categoryId);
  if (!existing) {
    throw new Error('Expense category not found');
  }

  const payload = {
    id: categoryId,
    name: updates.name !== undefined ? updates.name : existing.name,
    parent_id: updates.parentId !== undefined ? (updates.parentId || null) : existing.parent_id,
    color: updates.color !== undefined ? updates.color : existing.color,
  };

  this.db
    .prepare(
      `UPDATE expense_categories
       SET name = @name,
           parent_id = @parent_id,
           color = @color,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    )
    .run(payload);

  return this.db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(categoryId);
}
```

- [ ] **Step 4: Update `listExpensesForBudgetYear` to include `category_color`**

Find `listExpensesForBudgetYear(budgetYearId, limit = 10)` and replace the query and return map:

```js
listExpensesForBudgetYear(budgetYearId, limit = 10) {
  const { start, end } = this.getBudgetYearRange(budgetYearId);

  const query = `
    SELECT
      expenses.*,
      expense_categories.name as category_name,
      expense_categories.color as category_color
    FROM expenses
    LEFT JOIN expense_categories ON expense_categories.id = expenses.category_id
    WHERE expenses.date BETWEEN @start AND @end
    ORDER BY expenses.date DESC
    ${limit != null ? 'LIMIT @limit' : ''}
  `;

  const params = limit != null ? { start, end, limit } : { start, end };
  const rows = this.db.prepare(query).all(params);

  return rows.map((row) => ({
    id: row.id,
    vendor: row.vendor || 'Ukjent leverandør',
    amount: row.amount ?? 0,
    category_name: row.category_name || null,
    category_color: row.category_color || null,
    date: row.date,
    currency: row.currency || 'NOK',
    category_id: row.category_id,
    notes: row.notes,
    attachment_path: row.attachment_path,
  }));
}
```

- [ ] **Step 5: Add `getExpenseCategoryBreakdown(budgetYearId)` method**

Add this method after `listExpensesForBudgetYear`:

```js
getExpenseCategoryBreakdown(budgetYearId) {
  const { start, end } = this.getBudgetYearRange(budgetYearId);

  const rows = this.db.prepare(`
    SELECT
      ec.id,
      ec.name,
      ec.color,
      COALESCE(SUM(e.amount), 0) AS total
    FROM expense_categories ec
    LEFT JOIN expenses e
      ON e.category_id = ec.id
      AND e.date BETWEEN @start AND @end
    GROUP BY ec.id
    ORDER BY total DESC
  `).all({ start, end });

  // Include uncategorised row
  const uncatTotal = this.db.prepare(`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM expenses
    WHERE category_id IS NULL
      AND date BETWEEN @start AND @end
  `).get({ start, end }).total;

  const result = rows.filter((r) => r.total > 0);

  if (uncatTotal > 0) {
    result.push({ id: null, name: 'Ukategorisert', color: '#555555', total: uncatTotal });
  }

  return result;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/db/fatternDatabase.js
git commit -m "feat(db): category colors, breakdown query, category_color in expense rows"
```

---

## Task 3: IPC handler + preload

**Files:**
- Modify: `src/electron/dbHandlers.js`
- Modify: `src/electron/preload.js`

- [ ] **Step 1: Register the IPC handler in dbHandlers.js**

Find the block of expense handlers (around `handle('db:list-expense-categories', ...)`). Add immediately after:

```js
handle('db:get-expense-category-breakdown', ({ budgetYearId }) =>
  database.getExpenseCategoryBreakdown(budgetYearId)
);
```

- [ ] **Step 2: Expose in preload.js**

Find `listExpenses: (options) => invoke('db:list-expenses', options),` and add after it:

```js
getExpenseCategoryBreakdown: (budgetYearId) =>
  invoke('db:get-expense-category-breakdown', { budgetYearId }),
```

- [ ] **Step 3: Commit**

```bash
git add src/electron/dbHandlers.js src/electron/preload.js
git commit -m "feat(ipc): expose getExpenseCategoryBreakdown"
```

---

## Task 4: `useExpenses` hook — add breakdown

**Files:**
- Modify: `src/ui/src/hooks/useExpenses.js`

- [ ] **Step 1: Rewrite the hook to fetch breakdown in parallel**

Replace the entire file with:

```js
import { useEffect, useState } from 'react';

export function useExpenses(budgetYearId, options = {}) {
  const [expenses, setExpenses] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const { limit, refreshKey } = options;

  useEffect(() => {
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;
    if (!api?.listExpenses || !budgetYearId) {
      setExpenses(null);
      setBreakdown(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all([
      api.listExpenses({ budgetYearId, limit }),
      api.getExpenseCategoryBreakdown
        ? api.getExpenseCategoryBreakdown(budgetYearId)
        : Promise.resolve([]),
    ])
      .then(([rows, breakdownRows]) => {
        if (!cancelled) {
          setExpenses(rows);
          setBreakdown(breakdownRows);
        }
      })
      .catch((error) => {
        console.error('Kunne ikke hente utgifter', error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [budgetYearId, limit, refreshKey]);

  return { expenses, breakdown, isLoading };
}
```

- [ ] **Step 2: Update App.jsx to pass breakdown to ExpensesPage**

In `src/ui/src/App.jsx`, find the two `useExpenses` calls:

```js
const { expenses: liveExpenses } = useExpenses(selectedBudgetYearId, { limit: 10, refreshKey: expensesRefreshKey });
const { expenses: allExpenses } = useExpenses(selectedBudgetYearId, { limit: null, refreshKey: expensesRefreshKey });
```

Change them to:

```js
const { expenses: liveExpenses } = useExpenses(selectedBudgetYearId, { limit: 10, refreshKey: expensesRefreshKey });
const { expenses: allExpenses, breakdown: expenseBreakdown } = useExpenses(selectedBudgetYearId, { limit: null, refreshKey: expensesRefreshKey });
```

Then find `<ExpensesPage` and add the `breakdown` prop:

```jsx
<ExpensesPage
  expenses={allExpenses || []}
  breakdown={expenseBreakdown || []}
  expenseCategories={expenseCategories || []}
  formatCurrency={formatCurrency}
  ...
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/src/hooks/useExpenses.js src/ui/src/App.jsx
git commit -m "feat(hook): useExpenses returns breakdown; pass to ExpensesPage"
```

---

## Task 5: `ExpenseBreakdownBar` component

**Files:**
- Create: `src/ui/src/components/expenses/ExpenseBreakdownBar.jsx`

- [ ] **Step 1: Create the component**

```jsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/src/components/expenses/ExpenseBreakdownBar.jsx
git commit -m "feat(ui): ExpenseBreakdownBar component"
```

---

## Task 6: `ExpenseCategoryChips` component

**Files:**
- Create: `src/ui/src/components/expenses/ExpenseCategoryChips.jsx`

- [ ] **Step 1: Create the component**

```jsx
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
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/src/components/expenses/ExpenseCategoryChips.jsx
git commit -m "feat(ui): ExpenseCategoryChips component"
```

---

## Task 7: `ExpenseTimelineRow` component

**Files:**
- Create: `src/ui/src/components/expenses/ExpenseTimelineRow.jsx`

- [ ] **Step 1: Create the component**

```jsx
// src/ui/src/components/expenses/ExpenseTimelineRow.jsx

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
          <span style={{ fontSize: 14 }} title="Har kvittering">📎</span>
        )}
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--f-text)' }}>
          {formatCurrency ? formatCurrency(expense.amount) : expense.amount}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/src/components/expenses/ExpenseTimelineRow.jsx
git commit -m "feat(ui): ExpenseTimelineRow component"
```

---

## Task 8: `ExpenseTimeline` component

**Files:**
- Create: `src/ui/src/components/expenses/ExpenseTimeline.jsx`

- [ ] **Step 1: Create the component**

```jsx
// src/ui/src/components/expenses/ExpenseTimeline.jsx
import { useMemo } from 'react';
import { ExpenseTimelineRow } from './ExpenseTimelineRow';

const MONTH_NAMES_NO = [
  'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Desember',
];

function monthLabel(yyyyMm) {
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
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/src/components/expenses/ExpenseTimeline.jsx
git commit -m "feat(ui): ExpenseTimeline component"
```

---

## Task 9: `ExpenseDetailPanel` component

**Files:**
- Create: `src/ui/src/components/expenses/ExpenseDetailPanel.jsx`

The panel slides in from the right, sits inside the page content column (not the full viewport), shows receipt thumbnail with a `<dialog>`-based lightbox, and has Rediger + Slett actions.

- [ ] **Step 1: Create the component**

```jsx
// src/ui/src/components/expenses/ExpenseDetailPanel.jsx
import { useEffect, useState, useRef } from 'react';

export function ExpenseDetailPanel({ expense, formatCurrency, onEdit, onDelete, onClose }) {
  const [visible, setVisible] = useState(false);
  const [attachmentSrc, setAttachmentSrc] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const dialogRef = useRef(null);

  // Slide in when expense mounts
  useEffect(() => {
    if (expense) {
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
    }
  }, [expense]);

  // Load attachment image
  useEffect(() => {
    if (!expense?.attachment_path) {
      setAttachmentSrc(null);
      return;
    }
    const api = window.fattern?.expense;
    if (!api?.readAttachment) return;
    api.readAttachment(expense.attachment_path)
      .then((data) => setAttachmentSrc(data))
      .catch(() => setAttachmentSrc(null));
  }, [expense?.attachment_path]);

  // Lightbox
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [lightboxOpen]);

  const handleClose = () => {
    setVisible(false);
    // Wait for slide-out transition before clearing selection
    setTimeout(() => onClose?.(), 220);
  };

  if (!expense) return null;

  const accentColor = expense.category_color || '#555555';

  // Derive VAT from items if present
  let vatAmount = null;
  let baseAmount = null;
  if (expense.items && expense.items.length > 0) {
    baseAmount = expense.items.reduce((s, item) => s + (item.unitPrice || 0) * (item.quantity || 1), 0);
    vatAmount = (expense.amount || 0) - baseAmount;
  }

  return (
    <>
      {/* Panel */}
      <div
        style={{
          width: 380,
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          maxHeight: '100vh',
          overflowY: 'auto',
          background: 'var(--f-surface)',
          border: '1px solid var(--f-border)',
          borderRadius: 20,
          padding: 24,
          transform: visible ? 'translateX(0)' : 'translateX(110%)',
          transition: 'transform 220ms ease-out',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'inline-block',
                  padding: '2px 10px',
                  borderRadius: 12,
                  background: `${accentColor}22`,
                  color: accentColor,
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {expense.category_name || 'Ukategorisert'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--f-text)', wordBreak: 'break-word' }}>
                {expense.vendor || 'Ukjent leverandør'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--f-text-subtle)', marginTop: 4 }}>
                {expense.date}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--f-text-subtle)',
                fontSize: 18,
                cursor: 'pointer',
                padding: 4,
                lineHeight: 1,
                flexShrink: 0,
              }}
              aria-label="Lukk"
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--f-text)', marginTop: 8 }}>
            {formatCurrency ? formatCurrency(expense.amount) : expense.amount}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--f-border)', marginBottom: 16 }} />

        {/* Receipt */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--f-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Kvittering
          </div>
          {attachmentSrc ? (
            <img
              src={attachmentSrc}
              alt="Kvittering"
              onClick={() => setLightboxOpen(true)}
              style={{
                width: '100%',
                borderRadius: 12,
                cursor: 'zoom-in',
                objectFit: 'cover',
                maxHeight: 180,
                border: '1px solid var(--f-border)',
              }}
            />
          ) : (
            <div
              style={{
                padding: '16px',
                borderRadius: 12,
                border: '1px dashed var(--f-border)',
                textAlign: 'center',
                color: 'var(--f-text-subtle)',
                fontSize: 12,
              }}
            >
              Ingen kvittering
            </div>
          )}
        </div>

        {/* Amounts (only if items present or VAT known) */}
        {(baseAmount !== null) && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--f-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Beløp
            </div>
            <div style={{ fontSize: 13, color: 'var(--f-text-soft)' }}>
              {[
                { label: 'Grunnbeløp', value: formatCurrency ? formatCurrency(baseAmount) : baseAmount },
                { label: 'MVA', value: vatAmount !== null ? (formatCurrency ? formatCurrency(vatAmount) : vatAmount) : '—' },
                { label: 'Totalt', value: formatCurrency ? formatCurrency(expense.amount) : expense.amount },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--f-border)' }}>
                  <span>{label}</span>
                  <span style={{ fontWeight: label === 'Totalt' ? 700 : 400 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {expense.notes && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--f-text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Notat
            </div>
            <p style={{ fontSize: 13, color: 'var(--f-text-soft)', margin: 0, lineHeight: 1.5 }}>
              {expense.notes}
            </p>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--f-border)', marginBottom: 16 }} />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => onEdit?.(expense)}
            className="f-btn-ghost"
            style={{ flex: 1, padding: '8px 0', borderRadius: 12, fontSize: 13, fontWeight: 600 }}
          >
            Rediger
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(expense.id)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              background: 'rgba(220,50,50,0.08)',
              color: 'var(--f-danger, #e05555)',
              border: '1px solid rgba(220,50,50,0.2)',
              cursor: 'pointer',
            }}
          >
            Slett
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && setLightboxOpen(false)}
        style={{
          border: 'none',
          background: 'rgba(0,0,0,0.85)',
          padding: 0,
          maxWidth: '90vw',
          maxHeight: '90vh',
          borderRadius: 12,
        }}
      >
        {attachmentSrc && (
          <img
            src={attachmentSrc}
            alt="Kvittering full størrelse"
            style={{ display: 'block', maxWidth: '100%', maxHeight: '85vh', borderRadius: 12 }}
          />
        )}
      </dialog>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/src/components/expenses/ExpenseDetailPanel.jsx
git commit -m "feat(ui): ExpenseDetailPanel with receipt lightbox"
```

---

## Task 10: Rewrite `ExpensesPage.jsx`

**Files:**
- Modify: `src/ui/src/pages/ExpensesPage.jsx`

- [ ] **Step 1: Rewrite the page**

Replace the entire file:

```jsx
// src/ui/src/pages/ExpensesPage.jsx
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpenseBreakdownBar } from '../components/expenses/ExpenseBreakdownBar';
import { ExpenseCategoryChips } from '../components/expenses/ExpenseCategoryChips';
import { ExpenseTimeline } from '../components/expenses/ExpenseTimeline';
import { ExpenseDetailPanel } from '../components/expenses/ExpenseDetailPanel';

export function ExpensesPage({
  expenses = [],
  breakdown = [],
  expenseCategories = [],
  formatCurrency: fmt,
  onCreateExpense,
  onEditExpense,
  onDeleteExpense,
  onManageCategories,
}) {
  const { t } = useTranslation();
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const panelOpen = selectedExpenseId !== null;

  // Filter by category then search
  const filteredExpenses = useMemo(() => {
    let list = expenses;
    if (activeCategoryId !== null) {
      // null id = uncategorised
      if (activeCategoryId === null) {
        list = list.filter((e) => !e.category_id);
      } else {
        list = list.filter((e) => e.category_id === activeCategoryId);
      }
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (e) =>
          (e.vendor || '').toLowerCase().includes(q) ||
          (e.notes || '').toLowerCase().includes(q) ||
          (e.category_name || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [expenses, activeCategoryId, query]);

  const totalAmount = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);

  const selectedExpense = useMemo(
    () => (selectedExpenseId ? expenses.find((e) => e.id === selectedExpenseId) || null : null),
    [selectedExpenseId, expenses],
  );

  const handleSelectCategory = (id) => {
    // id may be null (uncategorised) or a number — toggle
    setActiveCategoryId((prev) => (prev === id ? null : id));
  };

  const handleDeleteExpense = async (expenseId) => {
    await onDeleteExpense?.(expenseId);
    setSelectedExpenseId(null);
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <header className="f-glass rounded-3xl overflow-hidden" style={{ position: 'relative' }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(45,180,130,0.07) 0%, transparent 60%)' }} />
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--f-text-subtle)' }}>
                {t('expense.title')}
              </p>
              <h1 className="mt-2 text-3xl font-semibold" style={{ color: 'var(--f-text)' }}>
                {fmt ? fmt(totalAmount) : totalAmount}
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--f-text-soft)' }}>
                {filteredExpenses.length}{' '}
                {filteredExpenses.length === 1 ? t('expense.expense_singular') : t('expense.expense_plural')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onCreateExpense?.()}
                className="f-btn-primary rounded-2xl px-5 py-2 text-sm font-semibold"
              >
                {t('expense.new')}
              </button>
              <button
                type="button"
                onClick={() => onManageCategories?.()}
                className="f-btn-ghost rounded-2xl px-5 py-2 text-sm font-semibold"
              >
                {t('expense.manage_categories')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content + detail panel */}
      <div style={{ display: 'flex', gap: 16, position: 'relative', alignItems: 'flex-start' }}>
        {/* Main column */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            transition: 'margin-right 220ms ease-out',
            marginRight: panelOpen ? 0 : 0,
          }}
        >
          <div className="f-glass rounded-3xl p-6 space-y-4">
            {breakdown.length > 0 && (
              <ExpenseBreakdownBar
                breakdown={breakdown}
                totalAmount={totalAmount}
                activeCategory={activeCategoryId}
                onSelectCategory={handleSelectCategory}
              />
            )}

            <ExpenseCategoryChips
              breakdown={breakdown}
              activeCategory={activeCategoryId}
              onSelectCategory={handleSelectCategory}
              query={query}
              onQueryChange={setQuery}
            />

            <ExpenseTimeline
              expenses={filteredExpenses}
              formatCurrency={fmt}
              onSelectExpense={setSelectedExpenseId}
              selectedExpenseId={selectedExpenseId}
            />
          </div>
        </div>

        {/* Detail panel */}
        {panelOpen && (
          <ExpenseDetailPanel
            expense={selectedExpense}
            formatCurrency={fmt}
            onEdit={(expense) => onEditExpense?.(expense)}
            onDelete={handleDeleteExpense}
            onClose={() => setSelectedExpenseId(null)}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders (start dev server)**

```bash
cd /home/chris/Documents/GitHub/fattern
npm run electron:dev
# Open expenses page — should see header, breakdown bar, chips, timeline
# Click a row — detail panel should slide in from the right
# Ctrl+C to stop
```

- [ ] **Step 3: Commit**

```bash
git add src/ui/src/pages/ExpensesPage.jsx
git commit -m "feat(ui): rewrite ExpensesPage with breakdown bar, chips, timeline"
```

---

## Task 11: Add color swatches to `ExpenseCategoryManagementModal`

**Files:**
- Modify: `src/ui/src/components/expenses/ExpenseCategoryManagementModal.jsx`

- [ ] **Step 1: Find the category name rendering in the modal**

Open `src/ui/src/components/expenses/ExpenseCategoryManagementModal.jsx`. Find where category names are rendered in the tree list. It will look roughly like:

```jsx
<span className="...">{cat.name}</span>
```

Wrap it in a flex container and prepend a color swatch:

```jsx
<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
  <span
    style={{
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: cat.color || '#888',
      flexShrink: 0,
      display: 'inline-block',
    }}
  />
  {cat.name}
</span>
```

Apply the same change to child categories in the tree (they follow the same pattern).

- [ ] **Step 2: Commit**

```bash
git add src/ui/src/components/expenses/ExpenseCategoryManagementModal.jsx
git commit -m "feat(ui): show color swatch in ExpenseCategoryManagementModal"
```

---

## Task 12: Delete deprecated components

**Files:**
- Delete: `src/ui/src/components/expenses/ExpenseCategorySidebar.jsx`
- Delete: `src/ui/src/components/expenses/ExpenseCard.jsx`

- [ ] **Step 1: Remove the files**

```bash
rm src/ui/src/components/expenses/ExpenseCategorySidebar.jsx
rm src/ui/src/components/expenses/ExpenseCard.jsx
```

- [ ] **Step 2: Search for any remaining imports**

```bash
grep -r "ExpenseCategorySidebar\|ExpenseCard" src/ui/src --include="*.jsx" --include="*.js"
# Expected: no output (no remaining references)
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: delete ExpenseCategorySidebar and ExpenseCard (replaced by timeline)"
```

---

## Self-Review

### Spec coverage check

| Spec requirement | Task |
|---|---|
| `color TEXT` migration | Task 1 |
| `getExpenseCategoryBreakdown` | Task 2 |
| `listExpensesForBudgetYear` includes `category_color` | Task 2 |
| `createExpenseCategory` auto-assigns color | Task 2 |
| `updateExpenseCategory` accepts color | Task 2 |
| IPC handler `db:get-expense-category-breakdown` | Task 3 |
| Preload `getExpenseCategoryBreakdown` | Task 3 |
| `useExpenses` returns `breakdown` | Task 4 |
| `App.jsx` passes `breakdown` to `ExpensesPage` | Task 4 |
| `ExpenseBreakdownBar` stacked bar + legend | Task 5 |
| `ExpenseCategoryChips` chips + inline search | Task 6 |
| `ExpenseTimelineRow` accent bar, vendor, date, amount, attachment icon | Task 7 |
| `ExpenseTimeline` monthly groups with totals | Task 8 |
| `ExpenseDetailPanel` slide-in, receipt lightbox, VAT breakdown, actions | Task 9 |
| `ExpensesPage` rewrite — orchestration, filtering, panel margin | Task 10 |
| `ExpenseCategoryManagementModal` color swatch | Task 11 |
| Delete `ExpenseCategorySidebar`, `ExpenseCard` | Task 12 |

All spec requirements are covered. ✓

### Type consistency

- `breakdown` array: `[{ id, name, color, total }]` — consistent across Task 2 DB method, Task 3 IPC, Task 4 hook, Task 5 component, Task 6 component, Task 10 page.
- `category_color` on expense rows: added in Task 2, used in Task 7 (`expense.category_color`). ✓
- `onSelectCategory(id)` — id is a number or `null` (uncategorised) — consistent across Task 5, 6, 10. ✓
- `ExpenseDetailPanel` `onEdit` receives the full expense object — matches `onEditExpense?.(expense)` in Task 10. ✓
- `handleDeleteExpense` in Task 10 calls `onDeleteExpense?.(expenseId)` with the id, matches the existing App.jsx pattern. ✓
