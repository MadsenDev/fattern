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
    updateBudgetYear: (payload) => invoke('db:update-budget-year', payload),
    deleteBudgetYear: (budgetYearId) => invoke('db:delete-budget-year', budgetYearId),
    createCustomer: (customer) => invoke('db:create-customer', customer),
    updateCustomer: (customerId, updates) => invoke('db:update-customer', customerId, updates),
    deleteCustomer: (customerId) => invoke('db:delete-customer', customerId),
    createInvoice: (invoice) => invoke('db:create-invoice', invoice),
    getInvoice: (invoiceId) => invoke('db:get-invoice', invoiceId),
    updateInvoice: (invoiceId, invoice) => invoke('db:update-invoice', invoiceId, invoice),
    deleteInvoice: (invoiceId) => invoke('db:delete-invoice', invoiceId),
    createExpense: (expense) => invoke('db:create-expense', expense),
    createExpenseCategory: (category) => invoke('db:create-expense-category', category),
    listExpenseCategories: () => invoke('db:list-expense-categories'),
    listInvoices: (options) => invoke('db:list-invoices', options),
    listExpenses: (options) => invoke('db:list-expenses', options),
    listCustomers: () => invoke('db:list-customers'),
    listProducts: (options) => invoke('db:list-products', options),
    createProduct: (product) => invoke('db:create-product', product),
    updateProduct: (productId, updates) => invoke('db:update-product', productId, updates),
    deleteProduct: (productId) => invoke('db:delete-product', productId),
    setProductActive: (productId, active) => invoke('db:set-product-active', productId, active),
    getSetting: (key, defaultValue) => invoke('db:get-setting', key, defaultValue),
    setSetting: (key, value) => invoke('db:set-setting', key, value),
    getAllSettings: () => invoke('db:get-all-settings'),
    bulkCreateCustomers: (customers) => invoke('db:bulk-create-customers', customers),
    bulkCreateProducts: (products) => invoke('db:bulk-create-products', products),
  },
  system: {
    getLocale: () => invoke('system:get-locale'),
  },
  window: {
    minimize: () => invoke('window:minimize'),
    maximize: () => invoke('window:maximize'),
    close: () => invoke('window:close'),
    isMaximized: () => invoke('window:is-maximized'),
    toggleDevTools: () => invoke('window:toggle-devtools'),
  },
  pdf: {
    generateInvoice: (invoiceId) => invoke('pdf:generate-invoice', invoiceId),
    openFile: (filepath) => invoke('pdf:open-file', filepath),
  },
  template: {
    list: () => invoke('template:list'),
    load: (templateId) => invoke('template:load', templateId),
    save: (template) => invoke('template:save', template),
    delete: (templateId) => invoke('template:delete', templateId),
    duplicate: (templateId, newId, newName) => invoke('template:duplicate', templateId, newId, newName),
    createDefault: () => invoke('template:create-default'),
    saveImage: (templateId, elementId, imageData) => invoke('template:save-image', templateId, elementId, imageData),
    getImagePath: (imagePath) => invoke('template:get-image-path', imagePath),
    readImage: (imagePath) => invoke('template:read-image', imagePath),
  },
});
