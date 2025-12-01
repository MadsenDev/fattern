import { useMemo, useState } from 'react';
import { FiBarChart2, FiCalendar, FiHome, FiLayers, FiSettings, FiUsers } from 'react-icons/fi';
import { MdOutlineReceiptLong } from 'react-icons/md';
import { TbCoin, TbReceipt } from 'react-icons/tb';

const navItems = [
  { label: 'Dashboard', icon: <FiHome className="h-5 w-5" /> },
  { label: 'Invoices', icon: <MdOutlineReceiptLong className="h-5 w-5" /> },
  { label: 'Expenses', icon: <TbReceipt className="h-5 w-5" /> },
  { label: 'Customers', icon: <FiUsers className="h-5 w-5" /> },
  { label: 'Products', icon: <FiLayers className="h-5 w-5" /> },
  { label: 'Budget Years', icon: <FiCalendar className="h-5 w-5" /> },
  { label: 'Settings', icon: <FiSettings className="h-5 w-5" /> }
];

const budgetYears = [
  { id: '2024', label: '2024', start: '2024-01-01', end: '2024-12-31' },
  { id: '2024/2025', label: '2024/2025', start: '2024-07-01', end: '2025-06-30' },
  { id: '2025', label: '2025', start: '2025-01-01', end: '2025-12-31' }
];

const invoices = [
  { id: '2025-004', customer: 'Nord Design Studio', amount: 87000, status: 'paid', date: '2025-02-10' },
  { id: '2025-005', customer: 'Oslo Creative', amount: 46000, status: 'sent', date: '2025-02-14' },
  { id: '2025-006', customer: 'Bergen Kaffe Co.', amount: 18000, status: 'draft', date: '2025-02-17' },
  { id: '2025-003', customer: 'Fjord Tech', amount: 120000, status: 'overdue', date: '2025-01-20' }
];

const expenses = [
  { id: 'EXP-102', vendor: 'Indie Cowork', amount: 5200, category: 'Workspace', date: '2025-02-06' },
  { id: 'EXP-103', vendor: 'Vy', amount: 1850, category: 'Travel', date: '2025-02-09' },
  { id: 'EXP-104', vendor: 'Fram Creative', amount: 4200, category: 'Subcontractor', date: '2025-02-12' },
  { id: 'EXP-105', vendor: 'Staples', amount: 750, category: 'Office', date: '2025-02-13' }
];

const statusBadge = {
  paid: 'badge-success',
  sent: 'badge-muted',
  draft: 'badge-ghost',
  overdue: 'badge-warn'
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    maximumFractionDigits: 0
  }).format(amount);
}

function StatCard({ title, value, subtitle, icon, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-white',
    accent: 'bg-accent text-white',
    muted: 'bg-sand'
  };

  return (
    <div className={`card relative overflow-hidden ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-ink/70">{title}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
          {subtitle ? <p className="text-sm text-ink/60 mt-1">{subtitle}</p> : null}
        </div>
        <div className="h-12 w-12 rounded-full bg-ink/5 flex items-center justify-center text-ink/80">
          {icon}
        </div>
      </div>
    </div>
  );
}

function Section({ title, action, children }) {
  return (
    <section className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {action ? <p className="text-sm text-ink/60 mt-1">{action}</p> : null}
        </div>
        <button className="text-sm text-accent font-medium hover:underline">View all</button>
      </div>
      {children}
    </section>
  );
}

function App() {
  const [selectedYear, setSelectedYear] = useState(budgetYears[0].id);

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
  }, []);

  return (
    <div className="min-h-screen flex bg-cloud">
      <aside className="w-64 border-r border-sand/80 bg-white/70 backdrop-blur-sm px-4 py-6 hidden lg:flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2 pb-6">
          <div className="h-10 w-10 rounded-2xl bg-ink text-white font-semibold flex items-center justify-center">F</div>
          <div>
            <p className="font-semibold">Fattern</p>
            <p className="text-sm text-ink/60">Local-first desktop</p>
          </div>
        </div>
        {navItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm hover:bg-sand/80 transition"
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
        <div className="mt-auto px-3 pt-4 border-t border-sand/70 text-xs text-ink/70">
          SQLite · Offline · v1 preview
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-ink/60">Budget year</p>
            <select
              className="mt-1 w-full md:w-56 rounded-lg border border-sand bg-white px-3 py-2 text-sm shadow-sm"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {budgetYears.map((year) => (
                <option key={year.id} value={year.id}>{`${year.label} (${year.start} → ${year.end})`}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium border border-sand shadow-sm hover:-translate-y-0.5 transition">
              New invoice
            </button>
            <button className="rounded-lg bg-ink text-white px-4 py-2 text-sm font-medium shadow-card hover:-translate-y-0.5 transition">
              Add expense
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard title="Income" value={formatCurrency(summaries.income)} subtitle="Year to date" icon={<TbCoin />} />
          <StatCard title="Expenses" value={formatCurrency(summaries.expenses)} subtitle="Year to date" icon={<TbReceipt />} />
          <StatCard title="Net" value={formatCurrency(summaries.net)} subtitle="Income - expenses" icon={<FiBarChart2 />} tone="accent" />
          <StatCard title="Overdue" value={formatCurrency(summaries.overdue)} subtitle="Needs attention" icon={<FiCalendar />} tone="muted" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <Section title="Invoices" action="Latest activity">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-ink/60">
                    <th className="py-2 pr-4">Invoice</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/80">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-sand/60">
                      <td className="py-3 pr-4 font-semibold text-ink">{invoice.id}</td>
                      <td className="py-3 pr-4">{invoice.customer}</td>
                      <td className="py-3 pr-4">
                        <span className={`badge ${statusBadge[invoice.status]}`}>
                          <span className="h-2 w-2 rounded-full bg-current/60"></span>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-ink/70">{invoice.date}</td>
                      <td className="py-3 text-right font-medium">{formatCurrency(invoice.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Expenses" action="Recent receipts">
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between rounded-lg border border-sand/70 bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="font-semibold text-ink">{expense.vendor}</p>
                    <p className="text-sm text-ink/60">{expense.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-ink/60">{expense.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Budget year status" action="Current period">
            <div className="space-y-4">
              {budgetYears.map((year) => (
                <div
                  key={year.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 shadow-sm transition ${
                    selectedYear === year.id ? 'border-accent/60 bg-accent/5' : 'border-sand/80 bg-white'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{year.label}</p>
                    <p className="text-xs text-ink/60">{year.start} → {year.end}</p>
                  </div>
                  <span className="badge badge-ghost">{year.id === selectedYear ? 'Active' : 'Available'}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

export default App;
