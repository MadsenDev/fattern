import { useState } from 'react';
import { StatusBadge } from '../StatusBadge';
import { Select } from '../Select';
import { FiFileText, FiSend, FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const statusOptions = [
  { value: 'draft', label: 'Kladd', icon: <FiFileText className="h-4 w-4" /> },
  { value: 'sent', label: 'Sendt', icon: <FiSend className="h-4 w-4" /> },
  { value: 'paid', label: 'Betalt', icon: <FiCheckCircle className="h-4 w-4" /> },
  { value: 'overdue', label: 'Forfalt', icon: <FiAlertCircle className="h-4 w-4" /> },
  { value: 'cancelled', label: 'Kansellert', icon: <FiX className="h-4 w-4" /> },
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

