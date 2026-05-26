import {
  IconCircleCheck,
  IconSend,
  IconFile,
  IconAlertCircle,
} from '@tabler/icons-react';
import { statusBadge, statusLabel } from '../data/mockData.jsx';

const statusIcons = {
  paid:    IconCircleCheck,
  sent:    IconSend,
  draft:   IconFile,
  overdue: IconAlertCircle,
};

export function StatusBadge({ status, className = '' }) {
  const Icon = statusIcons[status] || IconFile;
  const badgeClass = statusBadge[status] || 'f-pill-draft';
  const label = statusLabel[status] || status || 'Ukjent';

  return (
    <span
      className={badgeClass}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 11,
        fontWeight: 500,
        borderRadius: 'var(--f-radius-xs)',
        padding: '3px 8px',
        fontFamily: 'var(--f-font-mono)',
      }}
    >
      <Icon size={12} stroke={2} />
      {label}
    </span>
  );
}
