import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiCalendar } from 'react-icons/fi';
import { TbCoin, TbReceipt } from 'react-icons/tb';
import { LoadingScreen } from './components/LoadingScreen';
import { OnboardingFlow } from './components/OnboardingFlow';
import { DashboardView } from './components/dashboard/DashboardView';
import {
  navItems,
  budgetYears as mockBudgetYears,
  invoices as mockInvoices,
  expenses as mockExpenses,
  workflowShortcuts,
  activityFeed as mockActivityFeed,
  clientHighlights as mockClientHighlights,
  statusBadge,
  statusLabel,
} from './data/mockData.jsx';
import { formatCurrency } from './utils/formatCurrency';
import { useDashboardData } from './hooks/useDashboardData';
import { useInvoices } from './hooks/useInvoices';
import { useExpenses } from './hooks/useExpenses';
import i18n from './i18n/config';

function hasCompletedOnboarding() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('fattern:onboardingComplete') === 'true';
}

function App() {
  const [activityFeed] = useState(mockActivityFeed);
  const [clientHighlights] = useState(mockClientHighlights);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasCompletedOnboarding());
  const [fallbackSelectedYear, setFallbackSelectedYear] = useState(mockBudgetYears[0]?.id ?? null);

  const {
    company,
    budgetYears,
    summary: dbSummary,
    selectedBudgetYearId,
    selectBudgetYear,
    refreshMetadata,
  } = useDashboardData();

  const { invoices: liveInvoices } = useInvoices(selectedBudgetYearId);
  const { expenses: liveExpenses } = useExpenses(selectedBudgetYearId);

  const invoices = useMemo(
    () => (Array.isArray(liveInvoices) && liveInvoices.length ? liveInvoices : mockInvoices),
    [liveInvoices]
  );

  const expenses = useMemo(
    () => (Array.isArray(liveExpenses) && liveExpenses.length ? liveExpenses : mockExpenses),
    [liveExpenses]
  );

  const fallbackSummary = useMemo(() => {
    const totals = {
      income: 0,
      expenses: 0,
      overdue: 0,
      unpaid: 0
    };

    invoices.forEach((invoice) => {
      totals.income += invoice.amount;
      if (invoice.status === 'overdue') totals.overdue += invoice.amount;
      if (invoice.status === 'sent') totals.unpaid += invoice.amount;
    });

    expenses.forEach((expense) => {
      totals.expenses += expense.amount;
    });

    return {
      ...totals,
      net: totals.income - totals.expenses
    };
  }, [expenses, invoices]);

  const summary = dbSummary ?? fallbackSummary;

  const availableBudgetYears = budgetYears.length ? budgetYears : mockBudgetYears;
  const selectedYear = selectedBudgetYearId ?? fallbackSelectedYear ?? availableBudgetYears[0]?.id;

  useEffect(() => {
    let isMounted = true;
    const minTimer = setTimeout(() => {
      if (isMounted) {
        setLoadingProgress(100);
        setTimeout(() => setIsLoading(false), 150);
      }
    }, 1400);

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => Math.min(prev + Math.random() * 15, 95));
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(minTimer);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (company && company.name !== 'Default Company' && hasCompletedOnboarding()) {
      setShowOnboarding(false);
    }
  }, [company]);

useEffect(() => {
  const api = typeof window !== 'undefined' ? window.fattern?.system : null;
  if (!api?.getLocale) return;

  api
    .getLocale()
    .then((locale) => {
      if (!locale) return;
      const normalized = locale.split?.('-')[0] || locale;
      i18n.changeLanguage(normalized);
    })
    .catch((err) => {
      console.error('Unable to detect locale', err);
    });
}, []);

  const utilization =
    summary.income > 0 ? Math.min(100, Math.round((summary.expenses / summary.income) * 100)) : 0;
  const collectionRate =
    summary.income > 0
      ? Math.max(0, 100 - Math.round(((summary.overdue + summary.unpaid) / summary.income) * 100))
      : 0;
  const netMargin = summary.income > 0 ? Math.round((summary.net / summary.income) * 100) : 0;

  const statHighlights = [
    { title: 'Inntekter', value: formatCurrency(summary.income), subtitle: 'Hittil i år', icon: <TbCoin /> },
    {
      title: 'Utgifter',
      value: formatCurrency(summary.expenses),
      subtitle: 'Registrerte kostnader',
      icon: <TbReceipt />,
      tone: 'soft',
    },
    {
      title: 'Netto margin',
      value: `${netMargin}%`,
      subtitle: 'av omsetning',
      icon: <FiBarChart2 />,
      tone: 'accent',
    },
    {
      title: 'Forfalt',
      value: formatCurrency(summary.overdue),
      subtitle: 'Krever oppfølging',
      icon: <FiCalendar />,
      tone: 'muted',
    },
  ];

  if (isLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  const activityWithCurrency = activityFeed.map((item) =>
    typeof item.amount === 'number'
      ? { ...item, formattedAmount: formatCurrency(Math.abs(item.amount)) }
      : item
  );

  const handleOnboardingComplete = () => {
    refreshMetadata();
    setShowOnboarding(false);
  };

  const handleSelectYear = (yearId) => {
    if (budgetYears.length) {
      selectBudgetYear(yearId);
    } else {
      setFallbackSelectedYear(yearId);
    }
  };

  return (
    <>
      <DashboardView
        company={company}
        navItems={navItems}
        workflowShortcuts={workflowShortcuts}
        budgetYears={availableBudgetYears}
        selectedYear={selectedYear}
        onSelectYear={handleSelectYear}
        statHighlights={statHighlights}
        invoices={invoices}
        expenses={expenses}
        activityFeed={activityWithCurrency}
        clientHighlights={clientHighlights}
        summaries={summary}
        utilization={utilization}
        collectionRate={collectionRate}
        statusBadge={statusBadge}
        statusLabel={statusLabel}
        formatCurrency={formatCurrency}
      />
      {showOnboarding ? (
        <OnboardingFlow initialCompany={company} onComplete={handleOnboardingComplete} />
      ) : null}
    </>
  );
}

export default App;
