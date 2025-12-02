import {
  FiCalendar,
  FiHome,
  FiLayers,
  FiSettings,
  FiUsers
} from 'react-icons/fi';
import { MdOutlineReceiptLong } from 'react-icons/md';
import { TbReceipt } from 'react-icons/tb';

export const navItems = [
  { label: 'Overview', icon: <FiHome className="h-5 w-5" /> },
  { label: 'Invoices', icon: <MdOutlineReceiptLong className="h-5 w-5" /> },
  { label: 'Expenses', icon: <TbReceipt className="h-5 w-5" /> },
  { label: 'Customers', icon: <FiUsers className="h-5 w-5" /> },
  { label: 'Products', icon: <FiLayers className="h-5 w-5" /> },
  { label: 'Budget years', icon: <FiCalendar className="h-5 w-5" /> },
  { label: 'Settings', icon: <FiSettings className="h-5 w-5" /> }
];

export const budgetYears = [
  { id: '2024', label: '2024', start: '2024-01-01', end: '2024-12-31' },
  { id: '2024/2025', label: '2024/2025', start: '2024-07-01', end: '2025-06-30' },
  { id: '2025', label: '2025', start: '2025-01-01', end: '2025-12-31' }
];

export const invoices = [
  { id: '2025-004', customer: 'Nord Design Studio', amount: 87000, status: 'paid', date: '2025-02-10' },
  { id: '2025-005', customer: 'Oslo Creative', amount: 46000, status: 'sent', date: '2025-02-14' },
  { id: '2025-006', customer: 'Bergen Kaffe Co.', amount: 18000, status: 'draft', date: '2025-02-17' },
  { id: '2025-003', customer: 'Fjord Tech', amount: 120000, status: 'overdue', date: '2025-01-20' }
];

export const expenses = [
  { id: 'EXP-102', vendor: 'Indie Cowork', amount: 5200, category: 'Workspace', date: '2025-02-06' },
  { id: 'EXP-103', vendor: 'Vy', amount: 1850, category: 'Travel', date: '2025-02-09' },
  { id: 'EXP-104', vendor: 'Fram Creative', amount: 4200, category: 'Subcontractor', date: '2025-02-12' },
  { id: 'EXP-105', vendor: 'Staples', amount: 750, category: 'Office supplies', date: '2025-02-13' }
];

export const workflowShortcuts = [
  { label: 'Record payment', helper: '⌘ P' },
  { label: 'Upload receipt', helper: '⌘ U' },
  { label: 'Open command bar', helper: '⌘ K' }
];

export const activityFeed = [
  {
    id: 'act-1',
    title: 'Payment received',
    detail: 'Invoice 2025-004 · Nord Design Studio',
    time: '2h ago',
    amount: 87000,
    status: 'success'
  },
  {
    id: 'act-2',
    title: 'Reminder sent',
    detail: 'Invoice 2025-003 · Fjord Tech',
    time: '5h ago',
    status: 'warn'
  },
  {
    id: 'act-3',
    title: 'Expense logged',
    detail: 'Vy · Travel',
    time: 'Yesterday',
    amount: -1850,
    status: 'neutral'
  },
  {
    id: 'act-4',
    title: 'Budget year updated',
    detail: 'Cycle 2024/2025',
    time: '2 days ago',
    status: 'info'
  }
];

export const clientHighlights = [
  { name: 'Nord Design Studio', value: 87000, meta: 'Retainer · +18% QoQ' },
  { name: 'Oslo Creative', value: 46000, meta: 'Product design · On track' },
  { name: 'Fjord Tech', value: 120000, meta: 'Enterprise · Overdue' }
];

export const statusBadge = {
  paid: 'badge-success',
  sent: 'badge-muted',
  draft: 'badge-ghost',
  overdue: 'badge-warn'
};

export const statusLabel = {
  paid: 'Paid',
  sent: 'Sent',
  draft: 'Draft',
  overdue: 'Overdue'
};

