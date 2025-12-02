const { ipcMain } = require('electron');

function toDate(value, fallback = new Date()) {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function registerDatabaseHandlers(database) {
  if (!database) {
    throw new Error('Database instance is required to register handlers');
  }

  const handle = (channel, handler) => {
    ipcMain.handle(channel, async (event, ...args) => {
      try {
        return await handler(...args);
      } catch (error) {
        console.error(`[IPC:${channel}]`, error);
        throw error;
      }
    });
  };

  handle('db:ensure-company', (defaults = {}) => database.ensureCompany(defaults));
  handle('db:update-company', (updates = {}) => database.updateCompany(updates));
  handle('db:get-income-expense-summary', (budgetYearId) =>
    database.getIncomeExpenseSummary(budgetYearId)
  );
  handle('db:list-budget-years', () => database.listBudgetYears());
  handle('db:create-budget-year', (payload = {}) =>
    database.createBudgetYear({
      label: payload.label || `${toDate(payload.startDate).getFullYear()}`,
      startDate: toDate(payload.startDate),
      endDate: toDate(payload.endDate, toDate(payload.startDate)),
      isCurrent: Boolean(payload.isCurrent),
    })
  );
  handle('db:set-current-budget-year', (budgetYearId) =>
    database.setCurrentBudgetYear(budgetYearId)
  );

  handle('db:create-customer', (customer) => database.createCustomer(customer));
  handle('db:create-invoice', (invoice) => database.createInvoice(invoice));

  handle('db:create-expense', (expense = {}) =>
    database.addExpense({
      ...expense,
      date: toDate(expense.date),
    })
  );
  handle('db:create-expense-category', (category) => database.createExpenseCategory(category));
  handle('db:list-expense-categories', () => database.listExpenseCategories());
}

module.exports = {
  registerDatabaseHandlers,
};

