const xml2js = require('xml2js');
const fs = require('fs');

/**
 * Parses a SAF-T XML file and returns structured data
 * ready for import into Fattern's SQLite database.
 */
async function parseSAFT(filepath) {
  const xml = fs.readFileSync(filepath, 'utf8');

  const parser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: false,
    trim: true,
    mergeAttrs: true,
  });

  const result = await parser.parseStringPromise(xml);

  // Handle namespace — SAF-T files use a namespace prefix
  const root =
    result['n1:AuditFile'] ||
    result['AuditFile'] ||
    result[Object.keys(result)[0]];

  if (!root) {
    throw new Error('Ugyldig SAF-T fil: finner ikke AuditFile-element');
  }

  const header = extractHeader(root);
  const customers = extractCustomers(root);
  const suppliers = extractSuppliers(root);
  const transactions = extractTransactions(root);

  return {
    header,
    customers,
    suppliers,
    transactions,
    summary: {
      customerCount: customers.length,
      supplierCount: suppliers.length,
      transactionCount: transactions.length,
      invoiceCount: transactions.filter((t) => t.isInvoice).length,
      expenseCount: transactions.filter((t) => t.isExpense).length,
      dateRange: {
        start: header.startDate,
        end: header.endDate,
      },
    },
  };
}

function getText(node) {
  if (!node) return null;
  if (typeof node === 'string') return node.trim();
  if (node._) return node._.trim();
  return null;
}

function extractHeader(root) {
  const h = root.Header || root['n1:Header'] || {};
  return {
    companyName: getText(h.CompanyIdent) || getText(h['n1:CompanyIdent']),
    orgNumber: getText(h.TaxRegistrationNumber) || getText(h['n1:TaxRegistrationNumber']),
    startDate: getText(h.StartDate) || getText(h['n1:StartDate']),
    endDate: getText(h.EndDate) || getText(h['n1:EndDate']),
    currency: getText(h.CurrencyCode) || getText(h['n1:CurrencyCode']) || 'NOK',
    software: getText(h.ProductName) || getText(h['n1:ProductName']),
  };
}

function extractCustomers(root) {
  try {
    const mf = root.MasterFiles || root['n1:MasterFiles'] || {};
    const customers = mf.Customers || mf['n1:Customers'] || {};
    let customerList = customers.Customer || customers['n1:Customer'] || [];

    if (!Array.isArray(customerList)) customerList = [customerList];

    return customerList
      .filter(Boolean)
      .map((c) => {
        const addr = c.Address || c['n1:Address'] || {};
        const contact = c.Contact || c['n1:Contact'] || {};
        const contactPerson = contact.ContactPerson || contact['n1:ContactPerson'] || {};

        const firstName = getText(contactPerson.FirstName || contactPerson['n1:FirstName']) || '';
        const lastName = getText(contactPerson.LastName || contactPerson['n1:LastName']) || '';
        const contactName = [firstName, lastName].filter(Boolean).join(' ') || null;

        return {
          customerId: getText(c.CustomerID || c['n1:CustomerID']),
          name: getText(c.Name || c['n1:Name']) || 'Ukjent kunde',
          orgNumber: getText(c.RegistrationNumber || c['n1:RegistrationNumber']),
          address: getText(addr.StreetName || addr['n1:StreetName']),
          postNumber: getText(addr.PostalCode || addr['n1:PostalCode']),
          postLocation: getText(addr.City || addr['n1:City']),
          contactName,
          phone: getText(contact.Telephone || contact['n1:Telephone']),
          email: getText(contact.Email || contact['n1:Email']),
        };
      });
  } catch (error) {
    console.warn('Failed to extract customers from SAF-T:', error.message);
    return [];
  }
}

function extractSuppliers(root) {
  try {
    const mf = root.MasterFiles || root['n1:MasterFiles'] || {};
    const suppliers = mf.Suppliers || mf['n1:Suppliers'] || {};
    let supplierList = suppliers.Supplier || suppliers['n1:Supplier'] || [];

    if (!Array.isArray(supplierList)) supplierList = [supplierList];

    return supplierList
      .filter(Boolean)
      .map((s) => {
        const addr = s.Address || s['n1:Address'] || {};
        return {
          supplierId: getText(s.SupplierID || s['n1:SupplierID']),
          name: getText(s.Name || s['n1:Name']) || 'Ukjent leverandør',
          orgNumber: getText(s.RegistrationNumber || s['n1:RegistrationNumber']),
          address: getText(addr.StreetName || addr['n1:StreetName']),
          postNumber: getText(addr.PostalCode || addr['n1:PostalCode']),
          postLocation: getText(addr.City || addr['n1:City']),
        };
      });
  } catch (error) {
    console.warn('Failed to extract suppliers from SAF-T:', error.message);
    return [];
  }
}

function extractTransactions(root) {
  try {
    const gle = root.GeneralLedgerEntries || root['n1:GeneralLedgerEntries'] || {};
    let journals = gle.Journal || gle['n1:Journal'] || [];
    if (!Array.isArray(journals)) journals = [journals];

    const transactions = [];

    journals.filter(Boolean).forEach((journal) => {
      let txList = journal.Transaction || journal['n1:Transaction'] || [];
      if (!Array.isArray(txList)) txList = [txList];

      txList.filter(Boolean).forEach((tx) => {
        const customerId = getText(tx.CustomerID || tx['n1:CustomerID']);
        const supplierId = getText(tx.SupplierID || tx['n1:SupplierID']);
        const date = getText(tx.TransactionDate || tx['n1:TransactionDate']);
        const description = getText(tx.Description || tx['n1:Description']);

        let lines = tx.Line || tx['n1:Line'] || [];
        if (!Array.isArray(lines)) lines = [lines];

        let totalDebit = 0;
        let totalCredit = 0;
        let vatAmount = 0;
        let vatRate = null;

        lines.filter(Boolean).forEach((line) => {
          const debit = parseFloat(
            getText(
              (line.DebitAmount || line['n1:DebitAmount'] || {}).Amount ||
                (line.DebitAmount || line['n1:DebitAmount'] || {})['n1:Amount']
            ) || '0'
          );
          const credit = parseFloat(
            getText(
              (line.CreditAmount || line['n1:CreditAmount'] || {}).Amount ||
                (line.CreditAmount || line['n1:CreditAmount'] || {})['n1:Amount']
            ) || '0'
          );
          totalDebit += debit;
          totalCredit += credit;

          const taxInfo = line.TaxInformation || line['n1:TaxInformation'];
          if (taxInfo) {
            const pct = parseFloat(
              getText(taxInfo.TaxPercentage || taxInfo['n1:TaxPercentage']) || '0'
            );
            if (pct > 0) {
              vatRate = pct / 100;
              vatAmount += parseFloat(
                getText(
                  (taxInfo.TaxAmount || taxInfo['n1:TaxAmount'] || {}).Amount ||
                    (taxInfo.TaxAmount || taxInfo['n1:TaxAmount'] || {})['n1:Amount']
                ) || '0'
              );
            }
          }
        });

        transactions.push({
          transactionId: getText(tx.TransactionID || tx['n1:TransactionID']),
          date,
          description,
          customerId,
          supplierId,
          totalDebit,
          totalCredit,
          vatAmount,
          vatRate,
          journalType: getText(journal.Type || journal['n1:Type']),
          isInvoice: Boolean(customerId),
          isExpense: Boolean(supplierId) && !customerId,
        });
      });
    });

    return transactions;
  } catch (error) {
    console.warn('Failed to extract transactions from SAF-T:', error.message);
    return [];
  }
}

module.exports = { parseSAFT };
