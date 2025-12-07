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
    this.ensureCurrentBudgetYear();
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

  updateCompany(updates = {}) {
    const existing = this.ensureCompany();
    const payload = {
      id: existing.id,
      name: updates.name ?? existing.name,
      org_number: updates.org_number ?? existing.org_number,
      address: updates.address ?? existing.address,
      post_number: updates.post_number ?? existing.post_number,
      post_location: updates.post_location ?? existing.post_location,
      contact_email: updates.contact_email ?? existing.contact_email,
      contact_number: updates.contact_number ?? existing.contact_number,
      account_number: updates.account_number ?? existing.account_number,
      vat_rate:
        typeof updates.vat_rate === 'number'
          ? updates.vat_rate
          : existing.vat_rate ?? 0.25,
    };

    this.db.prepare(
      `UPDATE companies
       SET name = @name,
           org_number = @org_number,
           address = @address,
           post_number = @post_number,
           post_location = @post_location,
           contact_email = @contact_email,
           contact_number = @contact_number,
           account_number = @account_number,
           vat_rate = @vat_rate,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = @id`
    ).run(payload);

    return this.db.prepare('SELECT * FROM companies WHERE id = ?').get(existing.id);
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
      : this.ensureCurrentBudgetYear();

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
      INSERT INTO customers (name, contact_name, address, email, phone, org_number, post_number, post_location, vat_exempt, active, image_path)
      VALUES (@name, @contact_name, @address, @email, @phone, @org_number, @post_number, @post_location, @vat_exempt, @active, @image_path)
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
      image_path: customer.imagePath || null,
    });

    return this.db.prepare('SELECT * FROM customers WHERE id = ?').get(info.lastInsertRowid);
  }

  updateCustomer(customerId, updates) {
    const existing = this.db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
    if (!existing) {
      throw new Error('Customer not found');
    }

    const payload = {
      id: customerId,
      name: updates.name ?? existing.name,
      contact_name: updates.contactName !== undefined ? (updates.contactName || null) : existing.contact_name,
      address: updates.address !== undefined ? (updates.address || null) : existing.address,
      email: updates.email !== undefined ? (updates.email || null) : existing.email,
      phone: updates.phone !== undefined ? (updates.phone || null) : existing.phone,
      org_number: updates.orgNumber !== undefined ? (updates.orgNumber || null) : existing.org_number,
      post_number: updates.postNumber !== undefined ? (updates.postNumber || null) : existing.post_number,
      post_location: updates.postLocation !== undefined ? (updates.postLocation || null) : existing.post_location,
      vat_exempt: updates.vatExempt !== undefined ? (updates.vatExempt ? 1 : 0) : existing.vat_exempt,
      active: updates.active !== undefined ? (updates.active ? 1 : 0) : existing.active,
      image_path: updates.imagePath !== undefined ? (updates.imagePath || null) : existing.image_path,
    };

    this.db
      .prepare(
        `UPDATE customers
         SET name = @name,
             contact_name = @contact_name,
             address = @address,
             email = @email,
             phone = @phone,
             org_number = @org_number,
             post_number = @post_number,
             post_location = @post_location,
             vat_exempt = @vat_exempt,
             active = @active,
             image_path = @image_path,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = @id`
      )
      .run(payload);

    return this.db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
  }

  deleteCustomer(customerId) {
    const existing = this.db.prepare('SELECT * FROM customers WHERE id = ?').get(customerId);
    if (!existing) {
      throw new Error('Customer not found');
    }

    this.db.prepare('DELETE FROM customers WHERE id = ?').run(customerId);
    return true;
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

  getInvoice(invoiceId) {
    const invoice = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!invoice) return null;

    const items = this.db
      .prepare('SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id')
      .all(invoiceId);

    return {
      ...invoice,
      items: items.map((item) => ({
        id: item.id,
        productId: item.product_id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        vatRate: item.vat_rate,
        lineTotal: item.line_total,
      })),
    };
  }

  updateInvoice(invoiceId, invoice) {
    const existing = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!existing) {
      throw new Error('Invoice not found');
    }

    const items = invoice.items || [];
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate ?? 0), 0);
    const total = subtotal + vatTotal;

    const transaction = this.db.transaction(() => {
      // Update invoice
      const updateInvoice = this.db.prepare(`
        UPDATE invoices
        SET customer_id = @customer_id,
            invoice_date = @invoice_date,
            due_date = @due_date,
            vat_total = @vat_total,
            subtotal = @subtotal,
            total = @total,
            notes = @notes,
            status = @status,
            your_reference = @your_reference,
            our_reference = @our_reference,
            start_date = @start_date,
            end_date = @end_date,
            delivery_reference = @delivery_reference,
            reference = @reference,
            custom_fields = @custom_fields,
            credited = @credited,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
      `);

      updateInvoice.run({
        id: invoiceId,
        customer_id: invoice.customerId,
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

      // Delete existing items
      this.db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(invoiceId);

      // Insert new items
      const insertItem = this.db.prepare(`
        INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, vat_rate, line_total)
        VALUES (@invoice_id, @product_id, @description, @quantity, @unit_price, @vat_rate, @line_total)
      `);

      items.forEach((item) => {
        const lineTotal = item.quantity * item.unitPrice * (1 + (item.vatRate ?? 0));
        insertItem.run({
          invoice_id: invoiceId,
          product_id: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          vat_rate: item.vatRate ?? null,
          line_total: lineTotal,
        });
      });
    });

    transaction();
    return this.getInvoice(invoiceId);
  }

  deleteInvoice(invoiceId) {
    const existing = this.db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
    if (!existing) {
      throw new Error('Invoice not found');
    }

    // Items will be deleted via CASCADE
    this.db.prepare('DELETE FROM invoices WHERE id = ?').run(invoiceId);
    return true;
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

  createExpenseCategory(category) {
    const insert = this.db.prepare(`
      INSERT INTO expense_categories (name, parent_id)
      VALUES (@name, @parent_id)
    `);

    const info = insert.run({
      name: category.name,
      parent_id: category.parentId || null,
    });

    return this.db.prepare('SELECT * FROM expense_categories WHERE id = ?').get(info.lastInsertRowid);
  }

  listExpenseCategories() {
    return this.db.prepare('SELECT * FROM expense_categories ORDER BY name').all();
  }

  getBudgetYearRange(budgetYearId) {
    if (budgetYearId) {
      const record = this.db.prepare('SELECT * FROM budget_years WHERE id = ?').get(budgetYearId);
      if (record) {
        return {
          start: record.start_date,
          end: record.end_date,
        };
      }
    }

    const now = new Date();
    const start = `${now.getFullYear()}-01-01`;
    const end = `${now.getFullYear()}-12-31`;
    return { start, end };
  }

  listInvoicesForBudgetYear(budgetYearId, limit = 10) {
    const { start, end } = this.getBudgetYearRange(budgetYearId);

    const query = `
      SELECT
        invoices.id,
        invoices.invoice_number,
        invoices.invoice_date,
        invoices.total,
        invoices.status,
        customers.name as customer_name
      FROM invoices
      LEFT JOIN customers ON customers.id = invoices.customer_id
      WHERE invoices.invoice_date BETWEEN @start AND @end
      ORDER BY invoices.invoice_date DESC
      ${limit != null ? 'LIMIT @limit' : ''}
    `;

    const params = limit != null ? { start, end, limit } : { start, end };
    const rows = this.db.prepare(query).all(params);

    return rows.map((row) => ({
      dbId: row.id,
      id: row.invoice_number || `#${row.id}`,
      customer: row.customer_name || 'Ukjent kunde',
      amount: row.total ?? 0,
      status: row.status || 'draft',
      date: row.invoice_date,
    }));
  }

  listExpensesForBudgetYear(budgetYearId, limit = 10) {
    const { start, end } = this.getBudgetYearRange(budgetYearId);

    const query = `
      SELECT
        expenses.*,
        expense_categories.name as category_name
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
      category: row.category_name || 'Ukjent kategori',
      date: row.date,
    }));
  }

  listCustomers() {
    return this.db.prepare('SELECT * FROM customers ORDER BY name').all();
  }

  createProduct(product) {
    const insert = this.db.prepare(`
      INSERT INTO products (name, sku, description, unit_price, vat_rate, unit, active, image_path)
      VALUES (@name, @sku, @description, @unit_price, @vat_rate, @unit, @active, @image_path)
    `);

    const info = insert.run({
      name: product.name,
      sku: product.sku || null,
      description: product.description || null,
      unit_price: product.unitPrice,
      vat_rate: product.vatRate ?? null,
      unit: product.unit || null,
      active: product.active === false ? 0 : 1,
      image_path: product.imagePath || null,
    });

    return this.db.prepare('SELECT * FROM products WHERE id = ?').get(info.lastInsertRowid);
  }

  listProducts({ includeInactive = false } = {}) {
    const query = includeInactive
      ? 'SELECT * FROM products ORDER BY name'
      : 'SELECT * FROM products WHERE active = 1 ORDER BY name';

    return this.db.prepare(query).all();
  }

  setProductActive(productId, active) {
    const activeValue = active === true || active === 1 || active === '1' ? 1 : 0;
    this.db
      .prepare('UPDATE products SET active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(activeValue, productId);

    return this.db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  }

  updateProduct(productId, updates) {
    const existing = this.db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!existing) {
      throw new Error('Product not found');
    }

    const payload = {
      id: productId,
      name: updates.name ?? existing.name,
      sku: updates.sku ?? existing.sku,
      description: updates.description ?? existing.description,
      unit_price: updates.unitPrice ?? existing.unit_price,
      vat_rate: updates.vatRate ?? existing.vat_rate,
      unit: updates.unit ?? existing.unit,
      active: updates.active !== undefined ? (updates.active ? 1 : 0) : existing.active,
      image_path: updates.imagePath !== undefined ? (updates.imagePath || null) : existing.image_path,
    };

    this.db
      .prepare(
        `UPDATE products
         SET name = @name,
             sku = @sku,
             description = @description,
             unit_price = @unit_price,
             vat_rate = @vat_rate,
             unit = @unit,
             active = @active,
             image_path = @image_path,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = @id`
      )
      .run(payload);

    return this.db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
  }

  deleteProduct(productId) {
    const existing = this.db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!existing) {
      throw new Error('Product not found');
    }

    this.db.prepare('DELETE FROM products WHERE id = ?').run(productId);
    return true;
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
    
    // Calculate overdue and unpaid amounts
    const overdueRow = this.db
      .prepare('SELECT COALESCE(SUM(total), 0) as overdue FROM invoices WHERE invoice_date BETWEEN ? AND ? AND status = ?')
      .get(startDate, endDate, 'overdue');
    const unpaidRow = this.db
      .prepare('SELECT COALESCE(SUM(total), 0) as unpaid FROM invoices WHERE invoice_date BETWEEN ? AND ? AND status = ?')
      .get(startDate, endDate, 'sent');
    
    // Calculate paid amount (invoices with status 'paid')
    const paidRow = this.db
      .prepare('SELECT COALESCE(SUM(total), 0) as paid FROM invoices WHERE invoice_date BETWEEN ? AND ? AND status = ?')
      .get(startDate, endDate, 'paid');

    const income = incomeRow.income;
    const expenses = expenseRow.expenses;
    const overdue = overdueRow.overdue;
    const unpaid = unpaidRow.unpaid;
    const paid = paidRow.paid;

    return {
      budgetYear,
      income,
      expenses,
      net: income - expenses,
      overdue,
      unpaid,
      paid,
    };
  }

  listBudgetYears() {
    return this.db.prepare('SELECT * FROM budget_years ORDER BY start_date').all();
  }

  updateBudgetYear({ id, label, startDate, endDate }) {
    const existing = this.db.prepare('SELECT * FROM budget_years WHERE id = ?').get(id);
    if (!existing) {
      throw new Error('Budget year not found');
    }

    const payload = {
      id,
      label: label ?? existing.label,
      start_date: startDate ? toDateOnlyString(startDate) : existing.start_date,
      end_date: endDate ? toDateOnlyString(endDate) : existing.end_date,
    };

    this.db
      .prepare(
        `UPDATE budget_years
         SET label = @label,
             start_date = @start_date,
             end_date = @end_date,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = @id`
      )
      .run(payload);

    return this.db.prepare('SELECT * FROM budget_years WHERE id = ?').get(id);
  }

  deleteBudgetYear(id) {
    const existing = this.db.prepare('SELECT * FROM budget_years WHERE id = ?').get(id);
    if (!existing) {
      return false;
    }

    // Prevent deleting the current active year to avoid confusing state.
    if (existing.is_current) {
      throw new Error('Cannot delete the active budget year');
    }

    const result = this.db.prepare('DELETE FROM budget_years WHERE id = ?').run(id);
    return result.changes > 0;
  }

  setCurrentBudgetYear(budgetYearId) {
    const existing = this.db.prepare('SELECT * FROM budget_years WHERE id = ?').get(budgetYearId);
    if (!existing) {
      throw new Error('Budget year not found');
    }

    const transaction = this.db.transaction(() => {
      this.db.prepare('UPDATE budget_years SET is_current = 0').run();
      this.db.prepare('UPDATE budget_years SET is_current = 1 WHERE id = ?').run(budgetYearId);
    });

    transaction();
    return this.getCurrentBudgetYear();
  }

  getSetting(key, defaultValue = null) {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : defaultValue;
  }

  setSetting(key, value) {
    this.db
      .prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)')
      .run(key, String(value));
    return this.getSetting(key);
  }

  getAllSettings() {
    const rows = this.db.prepare('SELECT key, value FROM settings').all();
    return rows.reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
  }

  // Bulk import methods
  bulkCreateCustomers(customers) {
    const insert = this.db.prepare(`
      INSERT INTO customers (name, contact_name, address, email, phone, org_number, post_number, post_location, vat_exempt, active, image_path)
      VALUES (@name, @contact_name, @address, @email, @phone, @org_number, @post_number, @post_location, @vat_exempt, @active, @image_path)
    `);

    const transaction = this.db.transaction((customers) => {
      const results = [];
      for (const customer of customers) {
        const info = insert.run({
          name: customer.name || '',
          contact_name: customer.contact_name || customer.contactName || null,
          address: customer.address || null,
          email: customer.email || null,
          phone: customer.phone || null,
          org_number: customer.org_number || customer.orgNumber || null,
          post_number: customer.post_number || customer.postNumber || null,
          post_location: customer.post_location || customer.postLocation || null,
          vat_exempt: customer.vat_exempt || customer.vatExempt ? 1 : 0,
          active: customer.active !== false ? 1 : 0,
          image_path: customer.image_path || customer.imagePath || null,
        });
        results.push(info.lastInsertRowid);
      }
      return results;
    });

    return transaction(customers);
  }

  bulkCreateProducts(products) {
    const insert = this.db.prepare(`
      INSERT INTO products (name, sku, description, unit_price, vat_rate, unit, active, image_path)
      VALUES (@name, @sku, @description, @unit_price, @vat_rate, @unit, @active, @image_path)
    `);

    const transaction = this.db.transaction((products) => {
      const results = [];
      for (const product of products) {
        const info = insert.run({
          name: product.name || '',
          sku: product.sku || null,
          description: product.description || null,
          unit_price: product.unit_price || product.unitPrice || 0,
          vat_rate: product.vat_rate !== undefined ? product.vat_rate : (product.vatRate !== undefined ? product.vatRate : null),
          unit: product.unit || null,
          active: product.active !== false ? 1 : 0,
          image_path: product.image_path || product.imagePath || null,
        });
        results.push(info.lastInsertRowid);
      }
      return results;
    });

    return transaction(products);
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
