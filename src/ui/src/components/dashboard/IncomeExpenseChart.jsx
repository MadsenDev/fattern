import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function formatCurrencyShort(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toFixed(0);
}

const CustomTooltip = ({ active, payload, label, incomeLabel, expensesLabel }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 shadow-lg text-sm" style={{ background: 'rgba(12,22,18,0.96)', border: '1px solid var(--f-border)', backdropFilter: 'blur(20px)' }}>
      <p className="font-semibold mb-2" style={{ color: 'var(--f-text-body)' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name === 'income' ? incomeLabel : expensesLabel}:{' '}
          {new Intl.NumberFormat('nb-NO', {
            style: 'currency',
            currency: 'NOK',
            maximumFractionDigits: 0,
          }).format(entry.value)}
        </p>
      ))}
    </div>
  );
};

export function IncomeExpenseChart({ data = [] }) {
  const { t } = useTranslation();
  const incomeLabel = t('dashboard_view.income');
  const expensesLabel = t('dashboard_view.expenses_label');

  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm" style={{ color: 'var(--f-text-subtle)' }}>
        {t('dashboard_view.no_data_for_period')}
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'rgba(225,238,234,0.5)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatCurrencyShort}
          tick={{ fontSize: 11, fill: 'rgba(225,238,234,0.5)' }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          content={<CustomTooltip incomeLabel={incomeLabel} expensesLabel={expensesLabel} />}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8, color: 'rgba(225,238,234,0.7)' }}
          formatter={(value) => (value === 'income' ? incomeLabel : expensesLabel)}
        />
        <Bar dataKey="income" name="income" fill="#3fd9a0" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" name="expenses" fill="rgba(63,217,160,0.25)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
