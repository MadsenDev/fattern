# Expenses Page Redesign — Spec

**Date:** 2026-05-26  
**Status:** Approved

## Summary

Replace the current card-grid + sidebar layout with a spend-intelligence focused page: a stacked category breakdown bar at the top, chip filters, and a chronological timeline feed grouped by month. Clicking a row opens a slide-in detail panel. The page prioritises reviewing spend over data entry (capture primarily happens via a companion mobile app).

## Design Reference

Mockups saved in `.superpowers/brainstorm/20512-1779830432/content/full-design.html`.

---

## 1. Database changes

### 1.1 New column: `expense_categories.color`

Add `color TEXT` to `expense_categories`. Colors are auto-assigned from a fixed palette of 10 hex values when a category is created (round-robin by count of existing categories). Users cannot currently change colors — this is reserved for a future enhancement.

**Palette (10 colors):**
```
#3fd9a0  #6ab0c8  #c47eb0  #e8a84a  #e87a6a
#7ab0e8  #a8c87a  #c8a06a  #8ab0c8  #b8b0e8
```

**Migration:** `ALTER TABLE expense_categories ADD COLUMN color TEXT`

Add to `applyMigrations` in `initDatabase.js`.

### 1.2 New DB method: `getExpenseCategoryBreakdown(budgetYearId)`

Returns per-category totals for the breakdown bar. Query:

```sql
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
```

Also include an `uncategorised` row for expenses with `category_id IS NULL`.

Returns: `[{ id, name, color, total }]` — only rows where `total > 0`.

### 1.3 Updated `listExpensesForBudgetYear`

Include `category_color` in the result rows (join against `expense_categories.color`).

### 1.4 Updated `createExpenseCategory` / `updateExpenseCategory`

- `createExpenseCategory`: accept optional `color`; if omitted, auto-assign from palette based on `SELECT COUNT(*) FROM expense_categories`.
- `updateExpenseCategory`: accept optional `color` update.

---

## 2. IPC / preload changes

### 2.1 New handler: `db:get-expense-category-breakdown`

```js
handle('db:get-expense-category-breakdown', ({ budgetYearId }) =>
  database.getExpenseCategoryBreakdown(budgetYearId)
);
```

### 2.2 Preload exposure

```js
getExpenseCategoryBreakdown: (budgetYearId) =>
  invoke('db:get-expense-category-breakdown', { budgetYearId }),
```

---

## 3. Component architecture

### Deleted
- `ExpenseCategorySidebar.jsx` — replaced by `ExpenseCategoryChips`
- `ExpenseCard.jsx` — replaced by `ExpenseTimelineRow`

### New components

#### `ExpenseBreakdownBar.jsx`
Props: `{ breakdown, totalAmount, activeCategory, onSelectCategory }`

Renders:
- A stacked horizontal bar (height 12px, rounded). Each segment is proportional to `total / grandTotal`. Segments separated by 2px gap.
- Below the bar: a legend row with color swatch, name, formatted amount, and percentage for each category.
- Clicking a legend item calls `onSelectCategory(id)` — same as clicking a chip. Active category gets a highlight ring around its swatch.
- "Alle" resets to `null`.

#### `ExpenseCategoryChips.jsx`
Props: `{ breakdown, activeCategory, onSelectCategory, query, onQueryChange }`

Renders:
- "Alle" chip (active when `activeCategory === null`)
- One chip per category in `breakdown`, with a colored dot and name
- Inline search input at the right end (no separate SearchBar row)
- Chips are scrollable horizontally on narrow layouts

#### `ExpenseTimeline.jsx`
Props: `{ expenses, formatCurrency, onSelectExpense, selectedExpenseId }`

Groups expenses by `YYYY-MM`, sorted descending (newest month first).

For each group renders:
- A divider row: month label (e.g. "April 2024") + line + group total
- One `ExpenseTimelineRow` per expense in the group

#### `ExpenseTimelineRow.jsx`
Props: `{ expense, formatCurrency, isSelected, onClick }`

Renders a single row:
- 4px left accent bar in `expense.category_color` (falls back to `#555` if uncategorised)
- Vendor name (bold, truncated)
- Date + category name (subtle, coloured with category color)
- Amount (right-aligned, bold)
- 📎 icon if `attachment_path` is set
- Active state: border color switches to category color, subtle background tint
- No hover-reveal actions — actions live in the detail panel

#### `ExpenseDetailPanel.jsx`
Props: `{ expense, formatCurrency, onEdit, onDelete, onClose }`

Slide-in panel, 380px wide, fixed to the right edge of the page content area (not the full viewport — it sits inside the main content column so the sidebar rail remains visible).

Sections (top to bottom):
1. **Header** — vendor name, category badge, date, close button (×), large amount
2. **Receipt** — if `attachment_path`: thumbnail image loaded via `window.fattern.expense.readAttachment`. Click opens full-screen in a lightbox (`<dialog>` overlay). If no attachment: a subtle "Geen kvittering" placeholder.
3. **Beløp** — three rows: Grunnbeløp, MVA (derived from items if present, otherwise shown as `—`), Totalt. Shown only if items exist or VAT is known.
4. **Notat** — shown only if `expense.notes` is non-empty.
5. **Lenket faktura** — shown only if `expense.linked_invoice_id` is set (future: fetch invoice number and render a link).
6. **Actions** — "Rediger" (ghost) and "Slett" (danger) buttons, full width.

Panel slides in with a CSS transition (`transform: translateX(100%) → 0`, 220ms ease-out). Closing slides it back out then sets `selectedExpenseId` to null after the transition completes.

### Modified

#### `ExpensesPage.jsx` (full rewrite)
Orchestration only. Layout:

```
<div style="display:flex;gap:0;position:relative">
  <div style="flex:1;min-width:0;transition:margin-right 220ms">   ← shrinks when panel open
    <header />          ← total + new expense button
    <ExpenseBreakdownBar />
    <ExpenseCategoryChips />
    <ExpenseTimeline />
  </div>
  <ExpenseDetailPanel />  ← conditionally rendered, position:sticky or absolute right
</div>
```

When `selectedExpenseId` is set, the main column gets `margin-right: 396px` (panel width 380 + 16px gap) so no content is hidden behind the panel.

State owned by `ExpensesPage`:
- `selectedExpenseId` — which expense has the panel open
- `activeCategoryId` — chip/bar filter
- `query` — search string

#### `useExpenses.js`
Add a `breakdown` field: call `getExpenseCategoryBreakdown` alongside `listExpenses`. Both calls share the same `budgetYearId` and `refreshKey`.

```js
return { expenses, breakdown, isLoading };
```

#### `ExpenseModal.jsx`
No structural changes. Ensure `color` is not exposed as a user field (it's auto-assigned). Pass `color` through if editing an existing category.

#### `ExpenseCategoryManagementModal.jsx`
Show a color swatch next to each category name (read-only for now).

---

## 4. Data flow

```
App.jsx
  → passes expenses, expenseCategories, breakdown to ExpensesPage
  └─ ExpensesPage
       ├─ ExpenseBreakdownBar   (breakdown, activeCategoryId)
       ├─ ExpenseCategoryChips  (breakdown, activeCategoryId, query)
       ├─ ExpenseTimeline       (filtered expenses)
       └─ ExpenseDetailPanel    (single expense, onEdit, onDelete)
```

Filtering (category + search) is pure client-side — `useMemo` in `ExpensesPage`, same as today.

---

## 5. Out of scope

- User-editable category colors (reserved for future)
- Bulk select / bulk delete
- CSV export
- Recurring expense detection
- The companion mobile app

---

## 6. Files changed

| File | Action |
|------|--------|
| `src/db/schema.js` | Add `color TEXT` to `expense_categories` |
| `src/db/initDatabase.js` | Add `color` migration |
| `src/db/fatternDatabase.js` | `getExpenseCategoryBreakdown`, update `createExpenseCategory`, `updateExpenseCategory`, `listExpensesForBudgetYear` |
| `src/electron/dbHandlers.js` | Register `db:get-expense-category-breakdown` |
| `src/electron/preload.js` | Expose `getExpenseCategoryBreakdown` |
| `src/ui/src/hooks/useExpenses.js` | Add `breakdown` return value |
| `src/ui/src/pages/ExpensesPage.jsx` | Full rewrite |
| `src/ui/src/components/expenses/ExpenseBreakdownBar.jsx` | New |
| `src/ui/src/components/expenses/ExpenseCategoryChips.jsx` | New |
| `src/ui/src/components/expenses/ExpenseTimeline.jsx` | New |
| `src/ui/src/components/expenses/ExpenseTimelineRow.jsx` | New |
| `src/ui/src/components/expenses/ExpenseDetailPanel.jsx` | New |
| `src/ui/src/components/expenses/ExpenseCategorySidebar.jsx` | Delete |
| `src/ui/src/components/expenses/ExpenseCard.jsx` | Delete |
| `src/ui/src/components/expenses/ExpenseCategoryManagementModal.jsx` | Add color swatch |
