# TASK 03 — Dashboard Chart & Expense-Invoice Linking

## Context
Fattern is a local-first Electron + React + SQLite invoicing app.
This task adds two features:
1. An income vs expenses bar chart on the dashboard (Recharts is already installed)
2. Completing the expense-to-invoice linking feature (schema exists, UI does not)

---

## Part 1 — Income vs Expenses Chart

### Backend: Add monthly breakdown query

File: `src/db/fatternDatabase.js`

Add a new method `getMonthlyBreakdown(budgetYearId)` that returns monthly income and expense totals:

```js
getMonthlyBreakdown(budgetYearId) {
  const budgetYear = budgetYearId
    ? this.db.prepare('SELECT * FROM budget_years WHERE id = ?').get(budgetYearId)
    : this.ensureCurrentBudgetYear();

  const startDate = budgetYear.start_date;
  const endDate = budgetYear.end_date;

  // Get monthly invoice totals (only paid and sent invoices count as income)
  const invoiceRows = this.db.prepare(`
    SELECT
      strftime('%Y-%m', invoice_date) as month,
      SUM(total) as total
    FROM invoices
    WHERE invoice_date BETWEEN ? AND ?
      AND status IN ('paid', 'sent', 'overdue')
    GROUP BY month
    ORDER BY month
  `).all(startDate, endDate);

  // Get monthly expense totals
  const expenseRows = this.db.prepare(`
    SELECT
      strftime('%Y-%m', date) as month,
      SUM(amount) as total
    FROM expenses
    WHERE date BETWEEN ? AND ?
    GROUP BY month
    ORDER BY month
  `).all(startDate, endDate);

  // Build a complete month list for the budget year range
  const months = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
    months.push(key);
    current.setMonth(current.getMonth() + 1);
  }

  // Map results to full month list
  const incomeByMonth = Object.fromEntries(invoiceRows.map((r) => [r.month, r.total]));
  const expenseByMonth = Object.fromEntries(expenseRows.map((r) => [r.month, r.total]));

  return months.map((month) => ({
    month,
    // Format as short Norwegian month name
    label: new Date(month + '-01').toLocaleDateString('nb-NO', { month: 'short', year: '2-digit' }),
    income: incomeByMonth[month] || 0,
    expenses: expenseByMonth[month] || 0,
    net: (incomeByMonth[month] || 0) - (expenseByMonth[month] || 0),
  }));
}
```

### IPC Registration

File: `src/electron/dbHandlers.js`

Add:
```js
handle('db:get-monthly-breakdown', (budgetYearId) =>
  database.getMonthlyBreakdown(budgetYearId)
);
```

### Preload

File: `src/electron/preload.js`

Add to the `db` object:
```js
getMonthlyBreakdown: (budgetYearId) => invoke('db:get-monthly-breakdown', budgetYearId),
```

### Frontend: Chart Component

Create `src/ui/src/components/dashboard/IncomeExpenseChart.jsx`:

```jsx
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function formatCurrencyShort(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toFixed(0);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-sand/60 bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-ink mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {new Intl.NumberFormat('nb-NO', {
            style: 'currency', currency: 'NOK', maximumFractionDigits: 0
          }).format(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function IncomeExpenseChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-ink-subtle">
        Ingen data å vise for denne perioden
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6e8b97' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatCurrencyShort}
          tick={{ fontSize: 11, fill: '#6e8b97' }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => value === 'income' ? 'Inntekter' : 'Utgifter'}
        />
        <Bar dataKey="income" name="income" fill="#2f8981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="expenses" fill="#e1f1eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Wire into Dashboard

File: `src/ui/src/hooks/useDashboardData.js`

Add monthly breakdown fetch:
```js
const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);

// Add to the effect that runs when selectedBudgetYearId changes:
const refreshBreakdown = useCallback(async (yearId) => {
  const api = getDbApi();
  if (!api?.getMonthlyBreakdown || !yearId) return;
  try {
    const data = await api.getMonthlyBreakdown(yearId);
    setMonthlyBreakdown(data || []);
  } catch (error) {
    console.error('Kunne ikke hente månedlig oversikt', error);
  }
}, []);

// Call it alongside refreshSummary in the yearId effect
// Return it from the hook
return {
  ...,
  monthlyBreakdown,
};
```

File: `src/ui/src/components/dashboard/DashboardView.jsx`

Add a new section below the stat cards and above the invoice pipeline:

```jsx
import { IncomeExpenseChart } from './IncomeExpenseChart';

// Add monthlyBreakdown to props
// Add section:
<section className="rounded-3xl border border-sand/60 bg-white p-6 shadow-card">
  <div className="mb-4">
    <h3 className="text-lg font-semibold">Inntekter vs utgifter</h3>
    <p className="mt-1 text-sm text-ink-subtle">Månedlig oversikt for aktivt budsjettår</p>
  </div>
  <IncomeExpenseChart data={monthlyBreakdown} />
</section>
```

Pass `monthlyBreakdown` from `App.jsx` through to `DashboardView`.

---

## Part 2 — Expense-Invoice Linking

### Backend: Add link/unlink queries

File: `src/db/fatternDatabase.js`

Add these methods:

```js
getExpensesForInvoice(invoiceId) {
  return this.db.prepare(`
    SELECT expenses.*, expense_categories.name as category_name
    FROM expenses
    JOIN invoice_expense_links ON invoice_expense_links.expense_id = expenses.id
    LEFT JOIN expense_categories ON expense_categories.id = expenses.category_id
    WHERE invoice_expense_links.invoice_id = ?
    ORDER BY expenses.date DESC
  `).all(invoiceId);
}

getUnlinkedExpenses(budgetYearId) {
  const { start, end } = this.getBudgetYearRange(budgetYearId);
  return this.db.prepare(`
    SELECT expenses.*, expense_categories.name as category_name
    FROM expenses
    LEFT JOIN invoice_expense_links ON invoice_expense_links.expense_id = expenses.id
    LEFT JOIN expense_categories ON expense_categories.id = expenses.category_id
    WHERE invoice_expense_links.invoice_id IS NULL
      AND expenses.date BETWEEN ? AND ?
    ORDER BY expenses.date DESC
  `).all(start, end);
}

unlinkExpenseFromInvoice(invoiceId, expenseId) {
  this.db.prepare(
    'DELETE FROM invoice_expense_links WHERE invoice_id = ? AND expense_id = ?'
  ).run(invoiceId, expenseId);
  return true;
}
```

### IPC Registration

File: `src/electron/dbHandlers.js`

Add:
```js
handle('db:get-expenses-for-invoice', (invoiceId) =>
  database.getExpensesForInvoice(invoiceId)
);
handle('db:get-unlinked-expenses', (budgetYearId) =>
  database.getUnlinkedExpenses(budgetYearId)
);
handle('db:link-expense-to-invoice', (invoiceId, expenseId) =>
  database.linkExpenseToInvoice(invoiceId, expenseId)
);
handle('db:unlink-expense-from-invoice', (invoiceId, expenseId) =>
  database.unlinkExpenseFromInvoice(invoiceId, expenseId)
);
```

### Preload

File: `src/electron/preload.js`

Add to `db`:
```js
getExpensesForInvoice: (invoiceId) => invoke('db:get-expenses-for-invoice', invoiceId),
getUnlinkedExpenses: (budgetYearId) => invoke('db:get-unlinked-expenses', budgetYearId),
linkExpenseToInvoice: (invoiceId, expenseId) => invoke('db:link-expense-to-invoice', invoiceId, expenseId),
unlinkExpenseFromInvoice: (invoiceId, expenseId) => invoke('db:unlink-expense-from-invoice', invoiceId, expenseId),
```

### Frontend: Linked Expenses Tab in Invoice View Modal

File: `src/ui/src/components/invoices/InvoiceViewModal.jsx`

Add a "Tilknyttede utgifter" tab to the invoice view modal.

When the tab is active:
1. Load linked expenses via `db.getExpensesForInvoice(invoice.id)`
2. Show them in a simple list with vendor, date, amount, and an unlink button
3. Show an "Koble til utgift" button that opens a picker

The expense picker:
- Loads unlinked expenses for the current budget year via `db.getUnlinkedExpenses(budgetYearId)`
- Shows them in a scrollable list with checkboxes
- On confirm, calls `db.linkExpenseToInvoice` for each selected expense
- Refreshes the linked expenses list

Keep this UI simple — a modal-within-a-modal is fine here since the feature is secondary.

---

## Acceptance Criteria

**Chart:**
- Bar chart appears on dashboard between stat cards and invoice pipeline
- Shows one bar pair per month in the active budget year
- Income bars are teal (#2f8981), expense bars are light teal (#e1f1eb)
- Tooltip shows formatted NOK amounts on hover
- Empty state shows a message when no data exists
- Chart updates when budget year selection changes

**Expense-Invoice Linking:**
- Invoice view modal has a "Tilknyttede utgifter" tab
- Tab shows all expenses linked to the invoice
- Expenses can be unlinked with a button
- "Koble til utgift" button opens a picker showing unlinked expenses
- Expenses can be linked from the picker
- Changes persist to SQLite immediately
