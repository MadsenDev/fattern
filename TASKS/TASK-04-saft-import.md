# TASK 04 — SAF-T Import

## Context
Fattern is a local-first Electron + React + SQLite invoicing app for Norwegian freelancers.
SAF-T (Standard Audit File for Tax) is a Norwegian government-mandated XML export format
supported by all major Norwegian accounting systems: Fiken, Tripletex, Visma, Mamut, Conta, Debet.

This task implements SAF-T import so users can migrate their existing data into Fattern.

The stub parser exists at `src/ui/src/utils/saftParser.js` but does nothing. Replace it entirely.

---

## SAF-T XML Structure Reference

SAF-T files are XML with this top-level structure:

```xml
<AuditFile xmlns="urn:StandardAuditFile-Taxation-Financial:NO">
  <Header>
    <AuditFileVersion>1.10</AuditFileVersion>
    <CompanyIdent>...</CompanyIdent>
    <TaxRegistrationNumber>...</TaxRegistrationNumber>
    <FileCreationDate>...</FileCreationDate>
    <SoftwareCompanyName>...</SoftwareCompanyName>
    <ProductName>...</ProductName>
    <StartDate>...</StartDate>
    <EndDate>...</EndDate>
    <CurrencyCode>NOK</CurrencyCode>
    <DateCreated>...</DateCreated>
    <PeriodStart>...</PeriodStart>
    <PeriodEnd>...</PeriodEnd>
  </Header>
  <MasterFiles>
    <Customers>
      <Customer>
        <RegistrationNumber>...</RegistrationNumber>
        <Name>...</Name>
        <Address>
          <StreetName>...</StreetName>
          <PostalCode>...</PostalCode>
          <City>...</City>
          <Country>...</Country>
        </Address>
        <Contact>
          <ContactPerson>
            <FirstName>...</FirstName>
            <LastName>...</LastName>
          </ContactPerson>
          <Telephone>...</Telephone>
          <Email>...</Email>
        </Contact>
        <CustomerID>...</CustomerID>
      </Customer>
    </Customers>
    <Suppliers>...</Suppliers>
    <Accounts>...</Accounts>
  </MasterFiles>
  <GeneralLedgerEntries>
    <NumberOfEntries>...</NumberOfEntries>
    <TotalDebit>...</TotalDebit>
    <TotalCredit>...</TotalCredit>
    <Journal>
      <JournalID>...</JournalID>
      <Description>...</Description>
      <Type>...</Type>
      <Transaction>
        <TransactionID>...</TransactionID>
        <Period>...</Period>
        <PeriodYear>...</PeriodYear>
        <TransactionDate>...</TransactionDate>
        <SourceID>...</SourceID>
        <Description>...</Description>
        <SystemEntryDate>...</SystemEntryDate>
        <GLPostingDate>...</GLPostingDate>
        <CustomerID>...</CustomerID>
        <SupplierID>...</SupplierID>
        <Line>
          <RecordID>...</RecordID>
          <AccountID>...</AccountID>
          <Description>...</Description>
          <DebitAmount>
            <Amount>...</Amount>
          </DebitAmount>
          <CreditAmount>
            <Amount>...</Amount>
          </CreditAmount>
          <TaxInformation>
            <TaxType>MVA</TaxType>
            <TaxCode>...</TaxCode>
            <TaxPercentage>...</TaxPercentage>
            <TaxBase>...</TaxBase>
            <TaxAmount>
              <Amount>...</Amount>
            </TaxAmount>
          </TaxInformation>
        </Line>
      </Transaction>
    </Journal>
  </GeneralLedgerEntries>
</AuditFile>
```

---

## Part 1 — Parser (Main Process)

SAF-T files can be large (10MB+). Parse them in the main process, not the renderer.

### Install xml2js

```bash
npm install xml2js
```

### Create the parser

Create `src/electron/saftImporter.js`:

```js
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
  // xml2js may wrap the root in a namespace key
  const root = result['n1:AuditFile'] || 
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

        // Calculate totals from lines
        let totalDebit = 0;
        let totalCredit = 0;
        let vatAmount = 0;
        let vatRate = null;

        lines.filter(Boolean).forEach((line) => {
          const debit = parseFloat(
            getText((line.DebitAmount || line['n1:DebitAmount'] || {}).Amount ||
                    (line.DebitAmount || line['n1:DebitAmount'] || {})['n1:Amount']) || '0'
          );
          const credit = parseFloat(
            getText((line.CreditAmount || line['n1:CreditAmount'] || {}).Amount ||
                    (line.CreditAmount || line['n1:CreditAmount'] || {})['n1:Amount']) || '0'
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
                getText((taxInfo.TaxAmount || taxInfo['n1:TaxAmount'] || {}).Amount ||
                        (taxInfo.TaxAmount || taxInfo['n1:TaxAmount'] || {})['n1:Amount']) || '0'
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
          // Sales journal entries (customer transactions) become invoices
          // Purchase journal entries (supplier transactions) become expenses
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
```

---

## Part 2 — Import Logic

Create `src/electron/saftImportHandler.js`:

```js
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
        // Skip duplicates based on org number or name
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
        // Find matching supplier name
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
```

---

## Part 3 — IPC Handler

File: `src/electron/main.js`

Add after the template handlers section:

```js
const { importSAFT } = require('./saftImportHandler');

ipcMain.handle('saft:parse-preview', async (event, filepath) => {
  const { parseSAFT } = require('./saftImporter');
  const parsed = await parseSAFT(filepath);
  return parsed.summary;
});

ipcMain.handle('saft:import', async (event, filepath, options) => {
  return await importSAFT(filepath, database, options);
});
```

### Preload

File: `src/electron/preload.js`

Add a new `saft` object:
```js
saft: {
  parsePreview: (filepath) => invoke('saft:parse-preview', filepath),
  import: (filepath, options) => invoke('saft:import', filepath, options),
},
```

---

## Part 4 — UI

File: `src/ui/src/components/settings/ImportSettings.jsx`

Replace the SAF-T stub section with a full implementation:

```jsx
// Add state
const [saftImporting, setSaftImporting] = useState(false);
const [saftPreview, setSaftPreview] = useState(null);
const [saftFilePath, setSaftFilePath] = useState(null);
const [saftOptions, setSaftOptions] = useState({
  importCustomers: true,
  importExpenses: true,
  skipDuplicates: true,
});

const handleSAFTSelect = async () => {
  const dialogApi = window.fattern?.dialog;
  if (!dialogApi) return;

  const result = await dialogApi.showOpenDialog({
    title: 'Velg SAF-T fil',
    filters: [
      { name: 'SAF-T XML', extensions: ['xml'] },
      { name: 'Alle filer', extensions: ['*'] },
    ],
    properties: ['openFile'],
  });

  if (result.canceled || !result.filePaths?.length) return;

  const filepath = result.filePaths[0];
  setSaftFilePath(filepath);

  try {
    const preview = await window.fattern.saft.parsePreview(filepath);
    setSaftPreview(preview);
  } catch (error) {
    toast.error('Kunne ikke lese SAF-T fil: ' + error.message);
    setSaftFilePath(null);
  }
};

const handleSAFTImport = async () => {
  if (!saftFilePath) return;
  setSaftImporting(true);
  try {
    const results = await window.fattern.saft.import(saftFilePath, saftOptions);
    
    const messages = [];
    if (results.customers.imported > 0)
      messages.push(`${results.customers.imported} kunder importert`);
    if (results.customers.skipped > 0)
      messages.push(`${results.customers.skipped} kunder hoppet over (duplikater)`);
    if (results.expenses.imported > 0)
      messages.push(`${results.expenses.imported} utgifter importert`);

    toast.success(messages.join(', ') || 'Import fullført');
    setSaftPreview(null);
    setSaftFilePath(null);
    onRefreshData?.();
  } catch (error) {
    toast.error('Import feilet: ' + error.message);
  } finally {
    setSaftImporting(false);
  }
};
```

The SAF-T UI section should show:

1. **Before file selection:** A description of SAF-T, which systems support it, and a "Velg SAF-T fil" button.

2. **After file selection (preview):** A summary card showing:
   - Fil: `filename.xml`
   - Periode: startDate → endDate
   - Kunder funnet: N
   - Leverandørtransaksjoner funnet: N (will become expenses)
   - Checkboxes for import options (importCustomers, importExpenses, skipDuplicates)
   - "Importer" button and "Avbryt" button

3. **During import:** A loading state on the button.

4. **After import:** Toast notification with results, UI resets.

---

## Acceptance Criteria
- `npm install xml2js` succeeds
- Parser handles SAF-T files from at least: Fiken, Tripletex (test with sample files from the Norwegian Tax Authority's SAF-T documentation)
- Namespace handling works — SAF-T files from different vendors use `n1:` or no prefix
- Customers import with: name, orgNumber, address, postNumber, postLocation, email, phone
- Duplicate detection works — importing the same file twice does not create duplicate customers
- Expenses import with: vendor name, amount, date, currency, description as notes
- Preview shows accurate counts before import
- Error handling: malformed XML shows a user-friendly error message in Norwegian
- Large files (10MB+) do not freeze the UI (parsing is in main process)
- The SAF-T section in ImportSettings no longer says "kommer snart"

## Test Files
The Norwegian Tax Administration publishes sample SAF-T files:
https://www.skatteetaten.no/bedrift-og-organisasjon/starte-og-drive/rutiner-regnskap-og-kassasystem/saf-t-regnskap/

Download a sample file and test against it before considering this task complete.
