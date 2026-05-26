import { useState } from 'react';
import { StatusBadge } from '../StatusBadge';
import { Select } from '../Select';
import {
  IconFile,
  IconSend,
  IconCircleCheck,
  IconAlertCircle,
  IconX,
} from '@tabler/icons-react';

const statusOptions = [
  { value: 'draft',     label: 'Kladd',      icon: <IconFile         size={14} stroke={1.8} /> },
  { value: 'sent',      label: 'Sendt',       icon: <IconSend         size={14} stroke={1.8} /> },
  { value: 'paid',      label: 'Betalt',      icon: <IconCircleCheck  size={14} stroke={1.8} /> },
  { value: 'overdue',   label: 'Forfalt',     icon: <IconAlertCircle  size={14} stroke={1.8} /> },
  { value: 'cancelled', label: 'Kansellert',  icon: <IconX            size={14} stroke={1.8} /> },
];

export function InvoiceStatusSelector({ invoice, onStatusChange, showModal }) {
  const handleStatusChange = async (newStatus) => {
    if (newStatus === invoice.status) return;
    
    // Statuses that require a date
    const statusesRequiringDate = ['paid'];
    
    if (statusesRequiringDate.includes(newStatus)) {
      // Show modal for statuses that need dates
      showModal?.(invoice, newStatus);
    } else {
      // Direct status update for statuses that don't need dates
      try {
        await onStatusChange?.(invoice, newStatus, null);
      } catch (error) {
        console.error('Kunne ikke oppdatere status', error);
      }
    }
  };

  return (
    <div className="min-w-[120px]">
      <Select
        value={invoice.status}
        onChange={handleStatusChange}
        options={statusOptions}
        placeholder="Status"
      />
    </div>
  );
}

