const { parseSAFT } = require('./saftImporter');

/**
 * Imports SAF-T data into the Fattern database.
 * Returns a summary of what was imported.
 */
async function importSAFT(filepath, database, options = {}) {
  const {
    importCustomers = true,
    importExpenses = true,
    skipDuplicates = true,
  } = options;

  const parsed = await parseSAFT(filepath);
  const results = {
    customers: { imported: 0, skipped: 0, errors: [] },
    expenses: { imported: 0, skipped: 0, errors: [] },
    header: parsed.header,
    summary: parsed.summary,
  };

  // Import customers
  if (importCustomers && parsed.customers.length > 0) {
    const existing = database.listCustomers();
    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));
    const existingOrgs = new Set(
      existing.filter((c) => c.org_number).map((c) => c.org_number)
    );

    for (const customer of parsed.customers) {
      try {
        if (skipDuplicates) {
          if (customer.orgNumber && existingOrgs.has(customer.orgNumber)) {
            results.customers.skipped++;
            continue;
          }
          if (!customer.orgNumber && existingNames.has(customer.name.toLowerCase())) {
            results.customers.skipped++;
            continue;
          }
        }

        database.createCustomer({
          name: customer.name,
          contactName: customer.contactName,
          address: customer.address,
          postNumber: customer.postNumber,
          postLocation: customer.postLocation,
          orgNumber: customer.orgNumber,
          phone: customer.phone,
          email: customer.email,
          active: true,
        });
        results.customers.imported++;
      } catch (error) {
        results.customers.errors.push({
          item: customer.name,
          error: error.message,
        });
      }
    }
  }

  // Import expense transactions (supplier transactions)
  if (importExpenses) {
    const expenseTransactions = parsed.transactions.filter((t) => t.isExpense);

    for (const tx of expenseTransactions) {
      try {
        const supplier = parsed.suppliers.find((s) => s.supplierId === tx.supplierId);
        const vendorName = supplier?.name || tx.supplierId || 'Ukjent leverandør';

        // Use credit amount as expense amount (supplier invoices are credits)
        const amount = tx.totalCredit || tx.totalDebit || 0;
        if (amount <= 0) {
          results.expenses.skipped++;
          continue;
        }

        database.addExpense({
          vendor: vendorName,
          amount,
          currency: parsed.header.currency || 'NOK',
          date: tx.date || new Date().toISOString().split('T')[0],
          notes: tx.description || null,
        });
        results.expenses.imported++;
      } catch (error) {
        results.expenses.errors.push({
          item: tx.transactionId,
          error: error.message,
        });
      }
    }
  }

  return results;
}

module.exports = { importSAFT };
