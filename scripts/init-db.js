#!/usr/bin/env node
const { initializeDatabase, DB_PATH, DATA_ROOT } = require('../src/db/initDatabase');

function main() {
  const { db, dbPath } = initializeDatabase();
  db.close();

  console.log('✅ Fattern database ready.');
  console.log(` Data root: ${DATA_ROOT}`);
  console.log(` Database: ${dbPath}`);
  console.log(' Tables created: companies, customers, products, invoices, invoice_items, expense_categories, expenses, invoice_expense_links, budget_years, settings');
}

if (require.main === module) {
  main();
}
