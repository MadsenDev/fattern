import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { ExpenseCategorySidebar } from '../components/expenses/ExpenseCategorySidebar';
import { SearchBar } from '../components/SearchBar';
import { useSearch } from '../hooks/useSearch';

export function ExpensesPage({ expenses, breakdown = [], expenseCategories = [], formatCurrency: fmt, onCreateExpense, onEditExpense, onDeleteExpense, onManageCategories }) {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Filter by category first
  const filteredByCategory = useMemo(() => {
    if (!selectedCategoryId) return expenses || [];
    return (expenses || []).filter((expense) => expense.category_id === selectedCategoryId);
  }, [expenses, selectedCategoryId]);

  // Then search within the category result
  const { query, setQuery, results: filteredExpenses } = useSearch(filteredByCategory, ['vendor', 'notes']);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return t('expense.all_expenses_label');
    const category = expenseCategories.find((c) => c.id === selectedCategoryId);
    return category?.name || t('expense.unknown_category');
  }, [selectedCategoryId, expenseCategories, t]);

  const emptyMessage = query
    ? t('expense.no_results', { query })
    : selectedCategoryId
      ? t('expense.try_other_category')
      : t('expense.register_first');

  return (
    <div className="space-y-6">
      <header className="f-glass rounded-3xl overflow-hidden" style={{ position: 'relative' }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(45,180,130,0.07) 0%, transparent 60%)' }} />
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--f-text-subtle)' }}>{t('expense.title')}</p>
              <h1 className="mt-3 text-3xl font-semibold" style={{ color: 'var(--f-text)' }}>{selectedCategoryName}</h1>
              <p className="mt-2 text-sm" style={{ color: 'var(--f-text-soft)' }}>
                {filteredExpenses.length}{' '}
                {filteredExpenses.length === 1
                  ? t('expense.expense_singular')
                  : t('expense.expense_plural')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onCreateExpense?.()}
                className="f-btn-primary rounded-2xl px-5 py-2 text-sm font-semibold"
              >
                {t('expense.new')}
              </button>
              <button
                type="button"
                onClick={() => onManageCategories?.()}
                className="f-btn-ghost rounded-2xl px-5 py-2 text-sm font-semibold"
              >
                {t('expense.manage_categories')}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Category Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="f-glass rounded-3xl overflow-hidden" style={{ minHeight: '600px' }}>
            <ExpenseCategorySidebar
              categories={expenseCategories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </div>
        </div>

        {/* Expenses Grid */}
        <div className="flex-1 min-w-0">
          <div className="f-glass rounded-3xl p-6">
            {/* Search bar above grid */}
            <div className="mb-4">
              <SearchBar value={query} onChange={setQuery} />
            </div>

            {filteredExpenses.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm font-medium" style={{ color: 'var(--f-text-soft)' }}>{t('expense.empty')}</p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--f-text-subtle)' }}>{emptyMessage}</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredExpenses.map((expense) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    formatCurrency={fmt}
                    onEdit={onEditExpense}
                    onDelete={onDeleteExpense}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
