const schemaStatements = [
  "PRAGMA foreign_keys = ON;",
  `CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    org_number TEXT,
    address TEXT,
    post_number TEXT,
    post_location TEXT,
    contact_email TEXT,
    contact_number TEXT,
    account_number TEXT,
    vat_rate REAL DEFAULT 0.25,
    invoice_count INTEGER DEFAULT 0,
    invoice_reset_date DATE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    contact_name TEXT,
    address TEXT,
    email TEXT,
    phone TEXT,
    org_number TEXT,
    post_number TEXT,
    post_location TEXT,
    vat_exempt INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    image_path TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT,
    description TEXT,
    unit_price REAL NOT NULL,
    vat_rate REAL,
    unit TEXT,
    active INTEGER DEFAULT 1,
    image_path TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    invoice_number TEXT NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    vat_total REAL,
    subtotal REAL,
    total REAL,
    notes TEXT,
    status TEXT,
    your_reference TEXT,
    our_reference TEXT,
    start_date DATE,
    end_date DATE,
    delivery_reference TEXT,
    reference TEXT,
    custom_fields TEXT,
    credited INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    description TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    vat_rate REAL,
    line_total REAL
  );`,
  `CREATE TABLE IF NOT EXISTS expense_categories (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id INTEGER REFERENCES expense_categories(id) ON DELETE SET NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY,
    category_id INTEGER REFERENCES expense_categories(id),
    vendor TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'NOK',
    date DATE NOT NULL,
    notes TEXT,
    attachment_path TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS invoice_expense_links (
    invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    expense_id INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    PRIMARY KEY (invoice_id, expense_id)
  );`,
  `CREATE TABLE IF NOT EXISTS budget_years (
    id INTEGER PRIMARY KEY,
    label TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );`
];

module.exports = { schemaStatements };
