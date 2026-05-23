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
  const [monthlyBreakdown, setMonthlyBreakdown] = useState([]);
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
        overdue: result?.overdue ?? 0,
        unpaid: result?.unpaid ?? 0,
        paid: result?.paid ?? 0,
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

  const refreshBreakdown = useCallback(async (yearId) => {
    const api = getDbApi();
    if (!api?.getMonthlyBreakdown || !yearId) return;
    try {
      const data = await api.getMonthlyBreakdown(yearId);
      setMonthlyBreakdown(data || []);
    } catch (error) {
      console.error('Kunne ikke hente månedlig oversikt', error);
    }
  }, []);

  useEffect(() => {
    refreshMetadata();
  }, [refreshMetadata]);

  useEffect(() => {
    if (selectedBudgetYearId) {
      refreshSummary(selectedBudgetYearId);
      refreshInvoices(selectedBudgetYearId);
      refreshExpenses(selectedBudgetYearId);
      refreshBreakdown(selectedBudgetYearId);
    }
  }, [selectedBudgetYearId, refreshSummary, refreshInvoices, refreshExpenses, refreshBreakdown]);

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

  const createBudgetYear = useCallback(async (payload) => {
    const api = getDbApi();
    if (!api?.createBudgetYear) return null;

    try {
      const created = await api.createBudgetYear(payload);
      await refreshMetadata();
      return created;
    } catch (error) {
      console.error('Kunne ikke opprette budsjettår', error);
      throw error;
    }
  }, [refreshMetadata]);

  const updateBudgetYear = useCallback(async (payload) => {
    const api = getDbApi();
    if (!api?.updateBudgetYear) return null;

    try {
      const updated = await api.updateBudgetYear(payload);
      await refreshMetadata();
      return updated;
    } catch (error) {
      console.error('Kunne ikke oppdatere budsjettår', error);
      throw error;
    }
  }, [refreshMetadata]);

  const deleteBudgetYear = useCallback(async (id) => {
    const api = getDbApi();
    if (!api?.deleteBudgetYear) return false;

    try {
      const result = await api.deleteBudgetYear(id);
      await refreshMetadata();
      return result;
    } catch (error) {
      console.error('Kunne ikke slette budsjettår', error);
      throw error;
    }
  }, [refreshMetadata]);

  return {
    company,
    budgetYears,
    summary,
    invoices,
    expenses,
    monthlyBreakdown,
    selectedBudgetYearId,
    selectBudgetYear,
    createBudgetYear,
    updateBudgetYear,
    deleteBudgetYear,
    refreshMetadata,
    refreshSummary,
    isLoading,
  };
}

