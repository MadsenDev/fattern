const { parseSAFT } = require('./saftImporter');

/**
 * Imports SAF-T data into the Fattern database.
 * Returns a summary of what was imported.
 */
async function importSAFT(filepath, database, options = {}) {
  const {
    importCustomers = true,
    importInvoices = true,
    importExpenses = true,
    skipDuplicates = true,
  } = options;

  const parsed = await parseSAFT(filepath);
  const results = {
    customers:   { imported: 0, skipped: 0, errors: [] },
    invoices:    { imported: 0, skipped: 0, errors: [] },
    expenses:    { imported: 0, skipped: 0, errors: [] },
    budgetYears: { created: [] },
    header: parsed.header,
    summary: parsed.summary,
  };

  // ── 0. Auto-create missing budget years for the imported date range ──────
  // Collect every year covered by transactions so imported invoices are
  // immediately visible without the user having to set up budget years first.
  if (importInvoices) {
    const years = new Set(
      parsed.transactions
        .filter((t) => t.isInvoice && t.date)
        .map((t) => new Date(t.date).getFullYear())
        .filter((y) => !isNaN(y))
    );

    const existingYears = database.listBudgetYears();
    const existingYearLabels = new Set(existingYears.map((y) => y.label));

    for (const year of [...years].sort()) {
      const label = String(year);
      if (!existingYearLabels.has(label)) {
        database.createBudgetYear({
          label,
          startDate: `${year}-01-01`,
          endDate:   `${year}-12-31`,
          isCurrent: false, // don't displace the user's current year
        });
        results.budgetYears.created.push(label);
      }
    }
  }

  // ── 1. Import customers ──────────────────────────────────────────────────
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

  // ── 2. Import invoices (sales journal — customer transactions) ───────────
  if (importInvoices) {
    const invoiceTx = parsed.transactions.filter((t) => t.isInvoice);

    // Build a lookup: SAF-T CustomerID → DB customer row.
    // After customer import above, refresh the list so newly-imported ones are included.
    const dbCustomers = database.listCustomers();
    const dbByOrg  = new Map(dbCustomers.filter((c) => c.org_number).map((c) => [c.org_number, c]));
    const dbByName = new Map(dbCustomers.map((c) => [c.name.toLowerCase(), c]));

    // SAF-T CustomerID → parsed customer info
    const saftCustomerById = new Map(parsed.customers.map((c) => [c.customerId, c]));

    // Budget year label → DB budget year (refresh after auto-create above)
    const allBudgetYears = database.listBudgetYears();
    const budgetYearByLabel = new Map(allBudgetYears.map((y) => [y.label, y]));

    for (const tx of invoiceTx) {
      try {
        // Resolve DB customer
        const saftCust = saftCustomerById.get(tx.customerId);
        let dbCustomer = null;
        if (saftCust) {
          if (saftCust.orgNumber) dbCustomer = dbByOrg.get(saftCust.orgNumber) || null;
          if (!dbCustomer)        dbCustomer = dbByName.get(saftCust.name?.toLowerCase()) || null;
        }

        if (!dbCustomer) {
          results.invoices.skipped++;
          results.invoices.errors.push({
            item: tx.transactionId,
            error: `Fant ikke kunde i databasen (SAF-T CustomerID: ${tx.customerId})`,
          });
          continue;
        }

        // Reconstruct the invoice amount from journal totals.
        // In a sales journal the debit side (AR) = total incl. VAT.
        // The net (excl. VAT) line amount = total - VAT.
        const totalInclVat = tx.totalDebit || tx.totalCredit || 0;
        const vatAmount    = tx.vatAmount || 0;
        const net          = Math.max(totalInclVat - vatAmount, 0);
        const vatRate      = net > 0 ? tx.vatRate || (vatAmount / net) : 0;

        if (totalInclVat <= 0) {
          results.invoices.skipped++;
          continue;
        }

        // Check for duplicate (same transactionId already imported via the reference field)
        if (skipDuplicates && tx.transactionId) {
          const existing = database.db
            .prepare('SELECT id FROM invoices WHERE reference = ? LIMIT 1')
            .get(tx.transactionId);
          if (existing) {
            results.invoices.skipped++;
            continue;
          }
        }

        // Resolve the budget year for this invoice's date
        const invoiceYear = tx.date ? String(new Date(tx.date).getFullYear()) : null;
        const budgetYear  = invoiceYear ? budgetYearByLabel.get(invoiceYear) : null;

        database.createInvoice({
          customerId:   dbCustomer.id,
          budgetYearId: budgetYear?.id || null,
          invoiceDate:  tx.date,
          dueDate:      tx.date, // SAF-T doesn't carry due date; default to same day
          status:       'paid',  // Historical import — treat as paid
          notes:        tx.description || null,
          reference:    tx.transactionId || null,
          items: [
            {
              description: tx.description || 'Importert fra SAF-T',
              quantity:    1,
              unitPrice:   net,
              vatRate:     vatRate,
            },
          ],
        });
        results.invoices.imported++;
      } catch (error) {
        results.invoices.errors.push({
          item: tx.transactionId,
          error: error.message,
        });
      }
    }
  }

  // ── 3. Import expense transactions (supplier transactions) ───────────────
  if (importExpenses) {
    const expenseTransactions = parsed.transactions.filter((t) => t.isExpense);

    for (const tx of expenseTransactions) {
      try {
        const supplier = parsed.suppliers.find((s) => s.supplierId === tx.supplierId);
        const vendorName = supplier?.name || tx.supplierId || 'Ukjent leverandør';

        // Supplier invoices: credit side = amount owed to supplier (incl. VAT)
        const amount = tx.totalCredit || tx.totalDebit || 0;
        if (amount <= 0) {
          results.expenses.skipped++;
          continue;
        }

        database.addExpense({
          vendor:   vendorName,
          amount,
          currency: parsed.header.currency || 'NOK',
          date:     tx.date || new Date().toISOString().split('T')[0],
          notes:    tx.description || null,
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
