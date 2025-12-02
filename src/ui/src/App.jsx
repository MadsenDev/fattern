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
} from './data/mockData';
import { formatCurrency } from './utils/formatCurrency';
import i18n from './i18n/config';

function hasCompletedOnboarding() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('fattern:onboardingComplete') === 'true';
}

function App() {
  const [selectedYear, setSelectedYear] = useState(mockBudgetYears[0].id);
  const [budgetYears] = useState(mockBudgetYears);
  const [invoices] = useState(mockInvoices);
  const [expenses] = useState(mockExpenses);
  const [activityFeed] = useState(mockActivityFeed);
  const [clientHighlights] = useState(mockClientHighlights);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(() => !hasCompletedOnboarding());
  const [company, setCompany] = useState(null);

  const summaries = useMemo(() => {
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
    let isMounted = true;
    const api = typeof window !== 'undefined' ? window.fattern?.db : null;

    if (!api?.ensureCompany) {
      return () => {
        isMounted = false;
      };
    }

    (async () => {
      try {
        const existing = await api.ensureCompany();
        if (isMounted) {
          setCompany(existing);
          if (existing && existing.name !== 'Default Company' && hasCompletedOnboarding()) {
            setShowOnboarding(false);
          }
        }
      } catch (error) {
        console.error('Kunne ikke hente selskap', error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

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
    summaries.income > 0 ? Math.min(100, Math.round((summaries.expenses / summaries.income) * 100)) : 0;
  const collectionRate =
    summaries.income > 0
      ? Math.max(0, 100 - Math.round(((summaries.overdue + summaries.unpaid) / summaries.income) * 100))
      : 0;
  const netMargin = summaries.income > 0 ? Math.round((summaries.net / summaries.income) * 100) : 0;

  const statHighlights = [
    { title: 'Inntekter', value: formatCurrency(summaries.income), subtitle: 'Hittil i år', icon: <TbCoin /> },
    {
      title: 'Expenses',
      value: formatCurrency(summaries.expenses),
      subtitle: 'Committed spend',
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
      value: formatCurrency(summaries.overdue),
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

  const handleOnboardingComplete = (updatedCompany) => {
    setCompany(updatedCompany);
    setShowOnboarding(false);
  };

  return (
    <>
      <DashboardView
        company={company}
        navItems={navItems}
        workflowShortcuts={workflowShortcuts}
        budgetYears={budgetYears}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
        statHighlights={statHighlights}
        invoices={invoices}
        expenses={expenses}
        activityFeed={activityWithCurrency}
        clientHighlights={clientHighlights}
        summaries={summaries}
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
