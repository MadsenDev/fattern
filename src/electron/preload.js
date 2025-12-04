const { contextBridge, ipcRenderer } = require('electron');

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('fattern', {
  version: () => process.versions.electron,
  ping: () => invoke('ping'),
  db: {
    ensureCompany: (defaults) => invoke('db:ensure-company', defaults),
    updateCompany: (payload) => invoke('db:update-company', payload),
    getIncomeExpenseSummary: (budgetYearId) =>
      invoke('db:get-income-expense-summary', budgetYearId),
    listBudgetYears: () => invoke('db:list-budget-years'),
    createBudgetYear: (payload) => invoke('db:create-budget-year', payload),
    setCurrentBudgetYear: (budgetYearId) =>
      invoke('db:set-current-budget-year', budgetYearId),
    createCustomer: (customer) => invoke('db:create-customer', customer),
    createInvoice: (invoice) => invoke('db:create-invoice', invoice),
    createExpense: (expense) => invoke('db:create-expense', expense),
    createExpenseCategory: (category) => invoke('db:create-expense-category', category),
    listExpenseCategories: () => invoke('db:list-expense-categories'),
    listInvoices: (options) => invoke('db:list-invoices', options),
    listExpenses: (options) => invoke('db:list-expenses', options),
  },
  system: {
    getLocale: () => invoke('system:get-locale'),
  },
});
