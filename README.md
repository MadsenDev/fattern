# Fattern (Local-First Desktop Core)

Fattern is a modern, local-first invoicing and expense manager for freelancers and small Norwegian businesses. The desktop app stores everything in SQLite on the user's machine—no logins, no cloud dependency.

This repository currently contains the groundwork for the data layer described in `PROJECT.md`, including a reproducible SQLite schema and a helper script to create the database in the expected filesystem layout.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Initialize the local database (creates `~/Fattern/data/fattern.db` and supporting folders):
   ```bash
   npm run init-db
   ```
3. The script will confirm the paths and ensure the schema tables exist:
   - companies
   - customers
   - products
   - invoices
   - invoice_items
   - expense_categories
   - expenses
   - invoice_expense_links
   - budget_years
   - settings

## Database helpers

The `FatternDatabase` class wraps `better-sqlite3` to apply the schema, ensure filesystem folders exist, and expose convenience helpers for the workflows described in `PROJECT.md`.

```js
const { FatternDatabase } = require('./src/db/fatternDatabase');

const db = new FatternDatabase();
const customer = db.createCustomer({ name: 'Oslo Bikes AS', email: 'post@oslobikes.no' });
const invoice = db.createInvoice({
  customerId: customer.id,
  invoiceDate: '2025-01-10',
  dueDate: '2025-01-24',
  items: [
    { description: 'Workshop time', quantity: 5, unitPrice: 1200, vatRate: 0.25 },
    { description: 'Parts', quantity: 1, unitPrice: 800, vatRate: 0.25 },
  ],
});

const expense = db.addExpense({ vendor: 'Flytoget', amount: 220, date: '2025-01-08' });
db.linkExpenseToInvoice(invoice.id, expense.id);

const summary = db.getIncomeExpenseSummary();
console.log(summary);

db.close();
```

### Helper highlights

- **Filesystem safety**: uses `~/Fattern/data`, `~/Fattern/exports`, and `~/Fattern/logs` as outlined in `PROJECT.md`.
- **Invoice numbers**: sequential numbering with yearly (or budget-year) resets using the `companies.invoice_count` and `invoice_reset_date` columns.
- **Budget years**: auto-creates the current budget year if none exists and allows summaries scoped to a selected period.
- **Offline-first**: no external services; all state lives in SQLite on disk.

## Project direction

The intended stack for the desktop app is Electron + React (Vite) with TailwindCSS, Framer Motion, and `better-sqlite3` for data storage (see `PROJECT.md`). Future work will connect the renderer and main processes to this schema via IPC while keeping the app fully offline and private.
