import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiEdit2, FiTrash2, FiCheck, FiPlus, FiTrendingUp, FiTrendingDown, FiDollarSign, FiCreditCard, FiAlertCircle } from 'react-icons/fi';
import { TbCoin, TbReceipt } from 'react-icons/tb';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';

function getDbApi() {
  return typeof window !== 'undefined' ? window.fattern?.db : null;
}

export function BudgetYearsPage({
  budgetYears,
  selectedYearId,
  onSelectYear,
  onCreateYear,
  onEditYear,
  onDeleteYear,
  formatCurrency: formatCurrencyProp,
}) {
  const [yearSummaries, setYearSummaries] = useState({});
  const [loadingSummaries, setLoadingSummaries] = useState({});

  const formatCurrencyFn = formatCurrencyProp || formatCurrency;

  // Load summaries for all budget years
  useEffect(() => {
    const loadSummaries = async () => {
      const api = getDbApi();
      if (!api?.getIncomeExpenseSummary) return;

      const summaries = {};
      const loading = {};

      for (const year of budgetYears) {
        loading[year.id] = true;
        try {
          const summary = await api.getIncomeExpenseSummary(year.id);
          summaries[year.id] = {
            income: summary?.income ?? 0,
            expenses: summary?.expenses ?? 0,
            net: summary?.net ?? 0,
            paid: summary?.paid ?? 0,
            unpaid: summary?.unpaid ?? 0,
            overdue: summary?.overdue ?? 0,
          };
        } catch (error) {
          console.error(`Failed to load summary for year ${year.id}`, error);
          summaries[year.id] = {
            income: 0,
            expenses: 0,
            net: 0,
            paid: 0,
            unpaid: 0,
            overdue: 0,
          };
        } finally {
          loading[year.id] = false;
        }
      }

      setYearSummaries(summaries);
      setLoadingSummaries(loading);
    };

    if (budgetYears.length > 0) {
      loadSummaries();
    }
  }, [budgetYears]);

  const handleSetActive = (yearId) => {
    onSelectYear?.(yearId);
  };

  // Calculate days remaining/elapsed for each year
  const getYearProgress = (year) => {
    const start = year.start ?? year.start_date;
    const end = year.end ?? year.end_date;
    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
    const daysRemaining = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
    const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));

    return {
      totalDays,
      daysElapsed,
      daysRemaining,
      progress,
      isActive: today >= startDate && today <= endDate,
      isFuture: today < startDate,
      isPast: today > endDate,
    };
  };

  const sortedYears = useMemo(() => {
    return [...budgetYears].sort((a, b) => {
      const aStart = a.start ?? a.start_date;
      const bStart = b.start ?? b.start_date;
      if (!aStart || !bStart) return 0;
      return new Date(bStart) - new Date(aStart); // Most recent first
    });
  }, [budgetYears]);

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-sand/60 bg-white shadow-card">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent" />
        <div className="relative z-10 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-subtle">Budsjettår</p>
              <h1 className="mt-3 text-3xl font-semibold text-ink">Administrer budsjettår</h1>
              <p className="mt-2 text-sm text-ink-soft">
                Oversikt over alle budsjettår med detaljert statistikk og finansielle nøkkeltall
              </p>
            </div>
            <button
              type="button"
              onClick={onCreateYear}
              className="flex items-center gap-2 rounded-2xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-card hover:bg-brand-800 transition"
            >
              <FiPlus className="h-4 w-4" />
              Nytt budsjettår
            </button>
          </div>
        </div>
      </header>

      {budgetYears.length === 0 ? (
        <div className="rounded-3xl border border-sand/60 bg-white p-12 shadow-card text-center">
          <FiCalendar className="h-12 w-12 text-ink-subtle mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-ink mb-2">Ingen budsjettår</h3>
          <p className="text-sm text-ink-soft mb-6">
            Opprett ditt første budsjettår for å begynne å organisere fakturaer og utgifter
          </p>
          <button
            type="button"
            onClick={onCreateYear}
            className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card hover:bg-brand-800 transition"
          >
            Opprett budsjettår
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedYears.map((year) => {
            const isActive = selectedYearId === year.id;
            const start = year.start ?? year.start_date;
            const end = year.end ?? year.end_date;
            const summary = yearSummaries[year.id] || {
              income: 0,
              expenses: 0,
              net: 0,
              paid: 0,
              unpaid: 0,
              overdue: 0,
            };
            const isLoading = loadingSummaries[year.id];
            const progress = getYearProgress(year);

            return (
              <motion.div
                key={year.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: sortedYears.indexOf(year) * 0.05 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={`rounded-3xl border shadow-card overflow-hidden transition ${
                  isActive
                    ? 'border-brand-200 bg-white ring-2 ring-brand-200'
                    : 'border-sand/60 bg-white'
                }`}
              >
                {/* Header */}
                <div className="relative overflow-hidden border-b border-sand/40 bg-gradient-to-br from-brand-50/60 via-transparent to-transparent p-6">
                  <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-semibold text-ink">{year.label}</h2>
                        {isActive && (
                          <div className="flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1">
                            <FiCheck className="h-3.5 w-3.5 text-white" />
                            <span className="text-xs font-semibold text-white">Aktivt år</span>
                          </div>
                        )}
                        {progress?.isFuture && (
                          <span className="rounded-full bg-cloud px-3 py-1 text-xs font-semibold text-ink-soft">
                            Fremtidig
                          </span>
                        )}
                        {progress?.isPast && (
                          <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-ink-soft">
                            Avsluttet
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                        <div className="flex items-center gap-1.5">
                          <FiCalendar className="h-4 w-4" />
                          <span>
                            {start ? formatDate(start) : '—'} → {end ? formatDate(end) : '—'}
                          </span>
                        </div>
                        {progress && (
                          <>
                            {progress.isActive && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs">
                                  {Math.round(progress.progress)}% gjennomført · {progress.daysRemaining} dager igjen
                                </span>
                              </div>
                            )}
                            {progress.isFuture && (
                              <span className="text-xs">Starter om {progress.daysRemaining} dager</span>
                            )}
                            {progress.isPast && (
                              <span className="text-xs">Avsluttet for {Math.abs(progress.daysRemaining)} dager siden</span>
                            )}
                          </>
                        )}
                      </div>
                      {progress?.isActive && progress.progress > 0 && (
                        <div className="mt-3 h-2 w-full rounded-full bg-sand/40 overflow-hidden relative">
                          <motion.div
                            className="h-full bg-brand-600 relative overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress.progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          >
                            {/* Continuous shimmer animation - moves left to right repeatedly */}
                            <motion.div
                              className="absolute top-0 bottom-0"
                              style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                                width: '50%',
                              }}
                              animate={{
                                x: ['-50%', '150%'],
                              }}
                              transition={{
                                duration: 2.5,
                                repeat: Infinity,
                                ease: 'linear',
                                repeatDelay: 0,
                              }}
                            />
                          </motion.div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => handleSetActive(year.id)}
                          className="rounded-xl border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 transition"
                        >
                          Sett som aktivt
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onEditYear?.(year)}
                        className="rounded-xl border border-sand/60 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-cloud transition flex items-center gap-1.5"
                      >
                        <FiEdit2 className="h-4 w-4" />
                        Rediger
                      </button>
                      {!isActive && (
                        <button
                          type="button"
                          onClick={() => onDeleteYear?.(year)}
                          className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 transition flex items-center gap-1.5"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          Slett
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="p-6">
                  {isLoading ? (
                    <div className="py-8 text-center text-sm text-ink-subtle">Laster statistikk...</div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {/* Income */}
                      <div className="rounded-2xl border border-sand/40 bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-lg bg-brand-100 p-2">
                            <TbCoin className="h-5 w-5 text-brand-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-ink-subtle uppercase tracking-wider">Inntekter</p>
                            <p className="text-xl font-semibold text-ink mt-0.5">
                              {formatCurrencyFn(summary.income)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-sand/40 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-ink-soft">Betalt</span>
                            <span className="font-medium text-moss">{formatCurrencyFn(summary.paid)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-ink-soft">Ikke betalt</span>
                            <span className="font-medium text-ink">{formatCurrencyFn(summary.unpaid)}</span>
                          </div>
                          {summary.overdue > 0 && (
                            <div className="flex items-center justify-between">
                              <span className="text-ink-soft flex items-center gap-1">
                                <FiAlertCircle className="h-3 w-3" />
                                Forfalt
                              </span>
                              <span className="font-medium text-rose-600">{formatCurrencyFn(summary.overdue)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Expenses */}
                      <div className="rounded-2xl border border-sand/40 bg-white p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="rounded-lg bg-rose-100 p-2">
                            <TbReceipt className="h-5 w-5 text-rose-700" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-ink-subtle uppercase tracking-wider">Utgifter</p>
                            <p className="text-xl font-semibold text-ink mt-0.5">
                              {formatCurrencyFn(summary.expenses)}
                            </p>
                          </div>
                        </div>
                        {summary.income > 0 && (
                          <div className="mt-3 pt-3 border-t border-sand/40">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-ink-soft">Andel av inntekter</span>
                              <span className="font-medium text-ink">
                                {Math.round((summary.expenses / summary.income) * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Net */}
                      <div className={`rounded-2xl border p-4 ${
                        summary.net >= 0
                          ? 'border-moss/40 bg-moss/5'
                          : 'border-rose-200 bg-rose-50/50'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`rounded-lg p-2 ${
                            summary.net >= 0 ? 'bg-moss/20' : 'bg-rose-100'
                          }`}>
                            {summary.net >= 0 ? (
                              <FiTrendingUp className="h-5 w-5 text-moss" />
                            ) : (
                              <FiTrendingDown className="h-5 w-5 text-rose-700" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-ink-subtle uppercase tracking-wider">Netto</p>
                            <p className={`text-xl font-semibold mt-0.5 ${
                              summary.net >= 0 ? 'text-moss' : 'text-rose-700'
                            }`}>
                              {formatCurrencyFn(summary.net)}
                            </p>
                          </div>
                        </div>
                        {summary.income > 0 && (
                          <div className="mt-3 pt-3 border-t border-sand/40">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-ink-soft">Margin</span>
                              <span className={`font-medium ${
                                summary.net >= 0 ? 'text-moss' : 'text-rose-700'
                              }`}>
                                {summary.net >= 0 ? '+' : ''}{Math.round((summary.net / summary.income) * 100)}%
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

