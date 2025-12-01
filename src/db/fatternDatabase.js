const Database = require('better-sqlite3');
const { initializeDatabase, DB_PATH } = require('./initDatabase');

function toDateOnlyString(dateLike) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

class FatternDatabase {
  constructor() {
    const { db } = initializeDatabase();
    this.db = db;
  }

  close() {
    this.db?.close();
  }

  /**
   * Ensures a company record exists and returns it.
   */
  ensureCompany(defaults = {}) {
    const existing = this.db.prepare('SELECT * FROM companies LIMIT 1').get();
    if (existing) return existing;

    const insert = this.db.prepare(
      `INSERT INTO companies (name, vat_rate, created_at, updated_at)
       VALUES (@name, @vat_rate, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    );

    const info = insert.run({
      name: defaults.name || 'Default Company',
      vat_rate: defaults.vat_rate ?? 0.25,
    });

    return this.db.prepare('SELECT * FROM companies WHERE id = ?').get(info.lastInsertRowid);
  }

  getCurrentBudgetYear() {
    const row = this.db.prepare('SELECT * FROM budget_years WHERE is_current = 1 LIMIT 1').get();
    return row || null;
  }

  createBudgetYear({ label, startDate, endDate, isCurrent = false }) {
    const statement = this.db.prepare(`
      INSERT INTO budget_years (label, start_date, end_date, is_current, created_at, updated_at)
      VALUES (@label, @start_date, @end_date, @is_current, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const info = statement.run({
      label,
      start_date: toDateOnlyString(startDate),
      end_date: toDateOnlyString(endDate),
      is_current: isCurrent ? 1 : 0,
    });

    if (isCurrent) {
      this.db.prepare('UPDATE budget_years SET is_current = 0 WHERE id != ?').run(info.lastInsertRowid);
    }

    return this.db.prepare('SELECT * FROM budget_years WHERE id = ?').get(info.lastInsertRowid);
  }

  ensureCurrentBudgetYear() {
    const current = this.getCurrentBudgetYear();
    if (current) return current;

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31);
    const label = `${start.getFullYear()}`;

    return this.createBudgetYear({ label, startDate: start, endDate: end, isCurrent: true });
  }

  generateInvoiceNumber({ invoiceDate = new Date(), budgetYearId } = {}) {
    const company = this.ensureCompany();
    const date = invoiceDate instanceof Date ? invoiceDate : new Date(invoiceDate);
    const budgetYear = budgetYearId
      ? this.db.prepare('SELECT * FROM budget_years WHERE id = ?').get(budgetYearId)
      : this.getCurrentBudgetYear();

    const label = budgetYear ? budgetYear.label || `${date.getFullYear()}` : `${date.getFullYear()}`;
    const resetBoundary = budgetYear ? new Date(budgetYear.start_date) : new Date(date.getFullYear(), 0, 1);
    const hasResetDate = company.invoice_reset_date ? new Date(company.invoice_reset_date) : null;
    const resetRequired = !hasResetDate || hasResetDate < resetBoundary;

    if (resetRequired) {
      this.db
        .prepare('UPDATE companies SET invoice_count = 0, invoice_reset_date = ? WHERE id = ?')
        .run(toDateOnlyString(resetBoundary), company.id);
      company.invoice_count = 0;
    }

    const nextCount = (company.invoice_count || 0) + 1;
    this.db
      .prepare('UPDATE companies SET invoice_count = ?, invoice_reset_date = ? WHERE id = ?')
      .run(nextCount, toDateOnlyString(resetBoundary), company.id);
    company.invoice_count = nextCount;

    const padded = `${nextCount}`.padStart(3, '0');
    return `${label}-${padded}`;
  }

  createCustomer(customer) {
    const insert = this.db.prepare(`
      INSERT INTO customers (name, contact_name, address, email, phone, org_number, post_number, post_location, vat_exempt, active)
      VALUES (@name, @contact_name, @address, @email, @phone, @org_number, @post_number, @post_location, @vat_exempt, @active)
    `);

    const info = insert.run({
      name: customer.name,
      contact_name: customer.contactName || null,
      address: customer.address || null,
      email: customer.email || null,
      phone: customer.phone || null,
      org_number: customer.orgNumber || null,
      post_number: customer.postNumber || null,
      post_location: customer.postLocation || null,
      vat_exempt: customer.vatExempt ? 1 : 0,
      active: customer.active === false ? 0 : 1,
    });

    return this.db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);
  }

  createInvoice(invoice) {
    const customerId = invoice.customerId;
    const invoiceNumber = this.generateInvoiceNumber({
      invoiceDate: invoice.invoiceDate,
      budgetYearId: invoice.budgetYearId,
    });

    const items = invoice.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate ?? 0), 0);
    const total = subtotal + vatTotal;

    const transaction = this.db.transaction(() => {
      const insertInvoice = this.db.prepare(`
        INSERT INTO invoices (customer_id, invoice_number, invoice_date, due_date, vat_total, subtotal, total, notes, status, your_reference, our_reference, start_date, end_date, delivery_reference, reference, custom_fields, credited)
        VALUES (@customer_id, @invoice_number, @invoice_date, @due_date, @vat_total, @subtotal, @total, @notes, @status, @your_reference, @our_reference, @start_date, @end_date, @delivery_reference, @reference, @custom_fields, @credited)
      `);

      const invoiceInfo = insertInvoice.run({
        customer_id: customerId,
        invoice_number: invoiceNumber,
        invoice_date: toDateOnlyString(invoice.invoiceDate || new Date()),
        due_date: toDateOnlyString(invoice.dueDate || new Date()),
        vat_total: vatTotal,
        subtotal,
        total,
        notes: invoice.notes || null,
        status: invoice.status || 'draft',
        your_reference: invoice.yourReference || null,
        our_reference: invoice.ourReference || null,
        start_date: invoice.startDate ? toDateOnlyString(invoice.startDate) : null,
        end_date: invoice.endDate ? toDateOnlyString(invoice.endDate) : null,
        delivery_reference: invoice.deliveryReference || null,
        reference: invoice.reference || null,
        custom_fields: invoice.customFields ? JSON.stringify(invoice.customFields) : null,
        credited: invoice.credited ? 1 : 0,
      });

      const insertItem = this.db.prepare(`
        INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, vat_rate, line_total)
        VALUES (@invoice_id, @product_id, @description, @quantity, @unit_price, @vat_rate, @line_total)
      `);

      items.forEach((item) => {
        const lineTotal = item.quantity * item.unitPrice * (1 + (item.vatRate ?? 0));
        insertItem.run({
          invoice_id: invoiceInfo.lastInsertRowid,
          product_id: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          vat_rate: item.vatRate ?? null,
          line_total: lineTotal,
        });
      });

      return invoiceInfo.lastInsertRowid;
    });

    const invoiceId = transaction();
    return this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
  }

  addExpense(expense) {
    const insert = this.db.prepare(`
      INSERT INTO expenses (category_id, vendor, amount, currency, date, notes, attachment_path)
      VALUES (@category_id, @vendor, @amount, @currency, @date, @notes, @attachment_path)
    `);

    const info = insert.run({
      category_id: expense.categoryId || null,
      vendor: expense.vendor || null,
      amount: expense.amount,
      currency: expense.currency || 'NOK',
      date: toDateOnlyString(expense.date || new Date()),
      notes: expense.notes || null,
      attachment_path: expense.attachmentPath || null,
    });

    return this.db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
  }

  linkExpenseToInvoice(invoiceId, expenseId) {
    this.db
      .prepare('INSERT OR IGNORE INTO invoice_expense_links (invoice_id, expense_id) VALUES (?, ?)')
      .run(invoiceId, expenseId);
  }

  getIncomeExpenseSummary(budgetYearId) {
    const budgetYear = budgetYearId
      ? this.db.prepare('SELECT * FROM budget_years WHERE id = ?').get(budgetYearId)
      : this.ensureCurrentBudgetYear();

    const startDate = toDateOnlyString(budgetYear.start_date);
    const endDate = toDateOnlyString(budgetYear.end_date);

    const incomeRow = this.db
      .prepare('SELECT COALESCE(SUM(total), 0) as income FROM invoices WHERE invoice_date BETWEEN ? AND ?')
      .get(startDate, endDate);
    const expenseRow = this.db
      .prepare('SELECT COALESCE(SUM(amount), 0) as expenses FROM expenses WHERE date BETWEEN ? AND ?')
      .get(startDate, endDate);

    const income = incomeRow.income;
    const expenses = expenseRow.expenses;

    return {
      budgetYear,
      income,
      expenses,
      net: income - expenses,
    };
  }
}

function openFatternDatabase() {
  // initializeDatabase already applies the schema and opens the same DB path.
  // This helper mirrors better-sqlite3's API for advanced usage when the class is not needed.
  initializeDatabase();
  return new Database(DB_PATH);
}

module.exports = {
  FatternDatabase,
  openFatternDatabase,
};
