import { useMemo, useState } from 'react';
import { ExpenseCard } from '../components/expenses/ExpenseCard';
import { ExpenseCategorySidebar } from '../components/expenses/ExpenseCategorySidebar';
import { formatCurrency } from '../utils/formatCurrency';

export function ExpensesPage({ expenses, expenseCategories = [], formatCurrency: fmt, onCreateExpense, onEditExpense, onDeleteExpense, onManageCategories }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  // Filter expenses by selected category
  const filteredExpenses = useMemo(() => {
    if (!selectedCategoryId) return expenses || [];
    return (expenses || []).filter((expense) => expense.category_id === selectedCategoryId);
  }, [expenses, selectedCategoryId]);

  // Get category name for display
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return 'Alle utgifter';
    const category = expenseCategories.find((c) => c.id === selectedCategoryId);
    return category?.name || 'Ukjent kategori';
  }, [selectedCategoryId, expenseCategories]);

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-subtle">Utgifter</p>
              <h1 className="mt-3 text-3xl font-semibold text-ink">{selectedCategoryName}</h1>
              <p className="mt-2 text-sm text-ink-soft">
                {filteredExpenses.length} {filteredExpenses.length === 1 ? 'utgift' : 'utgifter'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => onCreateExpense?.()}
                className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:-translate-y-0.5"
              >
                Registrer utgift
              </button>
              <button
                type="button"
                onClick={() => onManageCategories?.()}
                className="rounded-2xl border border-sand/60 bg-white px-5 py-2 text-sm font-semibold text-ink shadow-card transition hover:-translate-y-0.5"
              >
                Behandle kategorier
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex gap-6">
        {/* Category Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="rounded-3xl border border-sand/60 bg-white shadow-card overflow-hidden" style={{ minHeight: '600px' }}>
            <ExpenseCategorySidebar
              categories={expenseCategories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={setSelectedCategoryId}
            />
          </div>
        </div>

        {/* Expenses Grid */}
        <div className="flex-1 min-w-0">
          <div className="rounded-3xl border border-sand/60 bg-white shadow-card p-6">
            {filteredExpenses.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="text-sm font-medium text-ink-soft">Ingen utgifter funnet</p>
                  <p className="mt-1 text-xs text-ink-subtle">
                    {selectedCategoryId ? 'Prøv å velge en annen kategori' : 'Registrer din første utgift'}
                  </p>
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

