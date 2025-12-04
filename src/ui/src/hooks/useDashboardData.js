import { useCallback, useEffect, useState } from 'react';

function getDbApi() {
  if (typeof window === 'undefined') return null;
  return window.fattern?.db ?? null;
}

export function useDashboardData() {
  const [company, setCompany] = useState(null);
  const [budgetYears, setBudgetYears] = useState([]);
  const [selectedBudgetYearId, setSelectedBudgetYearId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [invoices, setInvoices] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMetadata = useCallback(async () => {
    const api = getDbApi();
    if (!api?.ensureCompany || !api?.listBudgetYears) return;

    setIsLoading(true);
    try {
      const [companyRecord, years] = await Promise.all([api.ensureCompany(), api.listBudgetYears()]);
      setCompany(companyRecord);
      setBudgetYears(years);
      const active = years.find((year) => year.is_current) || years[0];
      if (active) {
        setSelectedBudgetYearId(active.id);
      }
    } catch (error) {
      console.error('Kunne ikke hente selskapsdata', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSummary = useCallback(async (yearId) => {
    const api = getDbApi();
    if (!api?.getIncomeExpenseSummary || !yearId) return;

    setIsLoading(true);
    try {
      const result = await api.getIncomeExpenseSummary(yearId);
      setSummary({
        income: result?.income ?? 0,
        expenses: result?.expenses ?? 0,
        net: result?.net ?? 0,
        overdue: 0,
        unpaid: 0,
      });
    } catch (error) {
      console.error('Kunne ikke hente sammendrag', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshInvoices = useCallback(
    async (yearId) => {
      const api = getDbApi();
      if (!api?.listInvoices || !yearId) return;

      try {
        const rows = await api.listInvoices({ budgetYearId: yearId, limit: 10 });
        setInvoices(rows);
      } catch (error) {
        console.error('Kunne ikke hente fakturaer', error);
      }
    },
    []
  );

  const refreshExpenses = useCallback(
    async (yearId) => {
      const api = getDbApi();
      if (!api?.listExpenses || !yearId) return;

      try {
        const rows = await api.listExpenses({ budgetYearId: yearId, limit: 10 });
        setExpenses(rows);
      } catch (error) {
        console.error('Kunne ikke hente utgifter', error);
      }
    },
    []
  );

  useEffect(() => {
    refreshMetadata();
  }, [refreshMetadata]);

  useEffect(() => {
    if (selectedBudgetYearId) {
      refreshSummary(selectedBudgetYearId);
      refreshInvoices(selectedBudgetYearId);
      refreshExpenses(selectedBudgetYearId);
    }
  }, [selectedBudgetYearId, refreshSummary, refreshInvoices, refreshExpenses]);

  const selectBudgetYear = useCallback(async (yearId) => {
    setSelectedBudgetYearId(yearId);
    const api = getDbApi();
    if (api?.setCurrentBudgetYear) {
      try {
        await api.setCurrentBudgetYear(yearId);
      } catch (error) {
        console.error('Kunne ikke sette aktivt budsjettår', error);
      }
    }
  }, []);

  return {
    company,
    budgetYears,
    summary,
    invoices,
    expenses,
    selectedBudgetYearId,
    selectBudgetYear,
    refreshMetadata,
    isLoading,
  };
}

