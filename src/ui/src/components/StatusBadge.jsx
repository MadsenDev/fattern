import { FiCheckCircle, FiSend, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { statusBadge, statusLabel } from '../data/mockData.jsx';

const statusIcons = {
  paid: FiCheckCircle,
  sent: FiSend,
  draft: FiFileText,
  overdue: FiAlertCircle,
};

export function StatusBadge({ status, className = '' }) {
  const Icon = statusIcons[status] || FiFileText;
  const badgeClass = statusBadge[status] || 'badge-ghost';
  const label = statusLabel[status] || status || 'Ukjent';

  return (
    <span className={`badge ${badgeClass} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}

