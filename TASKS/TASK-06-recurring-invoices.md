# TASK 06 — Recurring Invoices

## Context
Fattern is a local-first Electron + React + SQLite invoicing app.
Many freelancers have retainer clients they invoice monthly or quarterly.
This task adds recurring invoice support — the ability to define an invoice
as recurring and have Fattern remind the user (or auto-generate) on schedule.

For v1, use **reminder-based** recurrence: Fattern notifies the user when a
recurring invoice is due, and the user confirms generation. Full auto-generation
without confirmation is a future feature.

---

## Part 1 — Database Schema

### Migration

File: `src/db/initDatabase.js`

Add to `applyMigrations(db)`:

```js
// Recurring invoices table
try {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS recurring_invoices (
      id INTEGER PRIMARY KEY,
      template_invoice_id INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
      customer_id INTEGER REFERENCES customers(id),
      frequency TEXT NOT NULL CHECK(frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
      interval INTEGER NOT NULL DEFAULT 1,
      next_due_date DATE NOT NULL,
      last_generated_date DATE,
      active INTEGER DEFAULT 1,
      auto_generate INTEGER DEFAULT 0,
      invoice_data TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
} catch (error) {
  if (!error.message.includes('already exists')) {
    console.warn('Migration warning (recurring_invoices):', error.message);
  }
}
```

The `invoice_data` column stores a JSON snapshot of the invoice template
(items, notes, references) so recurring invoices work even if the original
invoice is deleted.

---

## Part 2 — Database Methods

File: `src/db/fatternDatabase.js`

Add these methods:

```js
createRecurringInvoice({
  templateInvoiceId = null,
  customerId,
  frequency,
  interval = 1,
  nextDueDate,
  autoGenerate = false,
  invoiceData,
}) {
  const insert = this.db.prepare(`
    INSERT INTO recurring_invoices
      (template_invoice_id, customer_id, frequency, interval, next_due_date,
       auto_generate, invoice_data, created_at, updated_at)
    VALUES
      (@template_invoice_id, @customer_id, @frequency, @interval, @next_due_date,
       @auto_generate, @invoice_data, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `);
  const info = insert.run({
    template_invoice_id: templateInvoiceId || null,
    customer_id: customerId,
    frequency,
    interval,
    next_due_date: nextDueDate,
    auto_generate: autoGenerate ? 1 : 0,
    invoice_data: JSON.stringify(invoiceData),
  });
  return this.db.prepare('SELECT * FROM recurring_invoices WHERE id = ?')
    .get(info.lastInsertRowid);
}

listRecurringInvoices({ activeOnly = false } = {}) {
  const query = activeOnly
    ? `SELECT r.*, c.name as customer_name
       FROM recurring_invoices r
       LEFT JOIN customers c ON c.id = r.customer_id
       WHERE r.active = 1
       ORDER BY r.next_due_date ASC`
    : `SELECT r.*, c.name as customer_name
       FROM recurring_invoices r
       LEFT JOIN customers c ON c.id = r.customer_id
       ORDER BY r.next_due_date ASC`;
  return this.db.prepare(query).all();
}

updateRecurringInvoice(id, updates) {
  const existing = this.db.prepare('SELECT * FROM recurring_invoices WHERE id = ?').get(id);
  if (!existing) throw new Error('Recurring invoice not found');

  const payload = {
    id,
    customer_id: updates.customerId ?? existing.customer_id,
    frequency: updates.frequency ?? existing.frequency,
    interval: updates.interval ?? existing.interval,
    next_due_date: updates.nextDueDate ?? existing.next_due_date,
    active: updates.active !== undefined ? (updates.active ? 1 : 0) : existing.active,
    auto_generate: updates.autoGenerate !== undefined
      ? (updates.autoGenerate ? 1 : 0) : existing.auto_generate,
    invoice_data: updates.invoiceData
      ? JSON.stringify(updates.invoiceData) : existing.invoice_data,
  };

  this.db.prepare(`
    UPDATE recurring_invoices
    SET customer_id = @customer_id,
        frequency = @frequency,
        interval = @interval,
        next_due_date = @next_due_date,
        active = @active,
        auto_generate = @auto_generate,
        invoice_data = @invoice_data,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run(payload);

  return this.db.prepare('SELECT * FROM recurring_invoices WHERE id = ?').get(id);
}

deleteRecurringInvoice(id) {
  this.db.prepare('DELETE FROM recurring_invoices WHERE id = ?').run(id);
  return true;
}

getDueRecurringInvoices() {
  const today = new Date().toISOString().split('T')[0];
  return this.db.prepare(`
    SELECT r.*, c.name as customer_name
    FROM recurring_invoices r
    LEFT JOIN customers c ON c.id = r.customer_id
    WHERE r.active = 1 AND r.next_due_date <= ?
    ORDER BY r.next_due_date ASC
  `).all(today);
}

generateFromRecurring(recurringId, budgetYearId) {
  const recurring = this.db.prepare('SELECT * FROM recurring_invoices WHERE id = ?')
    .get(recurringId);
  if (!recurring) throw new Error('Recurring invoice not found');

  const invoiceData = JSON.parse(recurring.invoice_data);
  const today = new Date().toISOString().split('T')[0];

  // Calculate due date (payment terms: 14 days from today by default)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  // Create the invoice
  const invoice = this.createInvoice({
    customerId: recurring.customer_id,
    invoiceDate: today,
    dueDate: dueDateStr,
    status: 'draft',
    notes: invoiceData.notes || null,
    yourReference: invoiceData.yourReference || null,
    ourReference: invoiceData.ourReference || null,
    items: invoiceData.items || [],
    budgetYearId,
  });

  // Calculate next due date
  const nextDate = calculateNextDueDate(recurring.next_due_date, recurring.frequency, recurring.interval);

  // Update recurring invoice
  this.db.prepare(`
    UPDATE recurring_invoices
    SET last_generated_date = ?,
        next_due_date = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(today, nextDate, recurringId);

  return invoice;
}
```

Add this helper function (outside the class):

```js
function calculateNextDueDate(currentDate, frequency, interval = 1) {
  const date = new Date(currentDate);
  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + (7 * interval));
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + interval);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + (3 * interval));
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + interval);
      break;
  }
  return date.toISOString().split('T')[0];
}
```

---

## Part 3 — IPC Handlers

File: `src/electron/dbHandlers.js`

Add:
```js
handle('db:create-recurring-invoice', (data) => database.createRecurringInvoice(data));
handle('db:list-recurring-invoices', (options) => database.listRecurringInvoices(options));
handle('db:update-recurring-invoice', (id, updates) => database.updateRecurringInvoice(id, updates));
handle('db:delete-recurring-invoice', (id) => database.deleteRecurringInvoice(id));
handle('db:get-due-recurring-invoices', () => database.getDueRecurringInvoices());
handle('db:generate-from-recurring', (recurringId, budgetYearId) =>
  database.generateFromRecurring(recurringId, budgetYearId)
);
```

### Preload

File: `src/electron/preload.js`

Add to `db`:
```js
createRecurringInvoice: (data) => invoke('db:create-recurring-invoice', data),
listRecurringInvoices: (options) => invoke('db:list-recurring-invoices', options),
updateRecurringInvoice: (id, updates) => invoke('db:update-recurring-invoice', id, updates),
deleteRecurringInvoice: (id) => invoke('db:delete-recurring-invoice', id),
getDueRecurringInvoices: () => invoke('db:get-due-recurring-invoices'),
generateFromRecurring: (recurringId, budgetYearId) =>
  invoke('db:generate-from-recurring', recurringId, budgetYearId),
```

---

## Part 4 — Due Invoice Notifications

File: `src/electron/main.js`

After the database is set up in `app.whenReady()`, add a startup check
and a daily interval check for due recurring invoices:

```js
async function checkDueRecurringInvoices() {
  try {
    const due = database.getDueRecurringInvoices();
    if (due.length > 0) {
      // Send to renderer via the focused window
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        win.webContents.send('recurring:due-invoices', due);
      }
    }
  } catch (error) {
    console.error('Error checking recurring invoices:', error);
  }
}

// Check on startup (after a short delay to let UI load)
setTimeout(checkDueRecurringInvoices, 3000);

// Check daily
setInterval(checkDueRecurringInvoices, 24 * 60 * 60 * 1000);
```

### Preload — add IPC listener

File: `src/electron/preload.js`

Add:
```js
const { ipcRenderer } = require('electron');

// Add to the contextBridge expose:
recurring: {
  onDueInvoices: (callback) => {
    ipcRenderer.on('recurring:due-invoices', (event, due) => callback(due));
  },
  removeListeners: () => {
    ipcRenderer.removeAllListeners('recurring:due-invoices');
  },
},
```

---

## Part 5 — UI

### 5a. Due Invoice Banner

File: `src/ui/src/App.jsx`

Add a listener for due recurring invoices:

```js
useEffect(() => {
  const api = typeof window !== 'undefined' ? window.fattern?.recurring : null;
  if (!api?.onDueInvoices) return;

  api.onDueInvoices((due) => {
    if (due.length === 1) {
      toast.info(`Gjentakende faktura forfaller: ${due[0].customer_name}. Klikk for å generere.`);
    } else if (due.length > 1) {
      toast.info(`${due.length} gjentakende fakturaer forfaller. Gå til Fakturaer for å generere.`);
    }
  });

  return () => api.removeListeners?.();
}, []);
```

### 5b. Recurring Invoices Section in Invoices Page

File: `src/ui/src/pages/InvoicesPage.jsx`

Add a collapsible "Gjentakende fakturaer" section above the main invoice list.

This section shows:
- A list of active recurring invoice schedules
- For each: customer name, frequency label (Månedlig, Kvartalsvis, etc.), next due date
- Status indicator: green (not due), amber (due within 7 days), red (overdue)
- Actions: Generate now, Edit schedule, Pause, Delete

Add a "+ Ny gjentakende faktura" button that opens the `RecurringInvoiceModal`.

### 5c. RecurringInvoiceModal

Create `src/ui/src/components/invoices/RecurringInvoiceModal.jsx`.

This modal has two tabs:
1. **Tidsplan** — Schedule settings:
   - Customer picker (reuse the customer selector from InvoiceModal)
   - Frequency: Ukentlig / Månedlig / Kvartalsvis / Årlig
   - Interval: "Hver X [frekvens]" (e.g., "Hver 2 måneder")
   - Start date (first due date)
   - Toggle: Auto-generer (off by default for v1)

2. **Fakturainnhold** — A simplified version of the invoice line items editor:
   - Line items (same as InvoiceModal items section)
   - Notes
   - References

On save, calls `db.createRecurringInvoice` with the combined data.

Frequency labels in Norwegian:
```js
const FREQUENCY_LABELS = {
  weekly: 'Ukentlig',
  monthly: 'Månedlig',
  quarterly: 'Kvartalsvis',
  yearly: 'Årlig',
};
```

### 5d. Generate Invoice Confirmation

When the user clicks "Generer nå" for a due recurring invoice, show a confirmation:

```
Generer faktura for [Kundenavn]?
Fakturadato: [dagens dato]
Neste forfall: [calculated next date]

[Avbryt] [Generer]
```

On confirm, calls `db.generateFromRecurring(recurringId, selectedBudgetYearId)`,
then refreshes the invoice list and shows a success toast.

---

## Acceptance Criteria
- Recurring invoices table is created via migration without errors
- `calculateNextDueDate` correctly advances by week/month/quarter/year
- Monthly recurrence on the 31st wraps correctly (e.g., Jan 31 → Feb 28/29)
- Due invoice check runs on app startup and shows a toast for due items
- Recurring invoice list shows in InvoicesPage with correct status colors
- Creating a recurring invoice via modal saves to database
- Generating from a recurring invoice creates a draft invoice and advances the next_due_date
- Pausing a recurring invoice sets `active = 0` and stops notifications
- Deleting a recurring invoice prompts confirmation before deletion
- All UI strings are in Norwegian
