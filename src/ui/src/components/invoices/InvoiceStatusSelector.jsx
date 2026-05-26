import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  IconFile,
  IconSend,
  IconCircleCheck,
  IconAlertCircle,
  IconX,
  IconChevronDown,
} from '@tabler/icons-react';
import { statusBadge } from '../../data/mockData.jsx';

const STATUS_OPTIONS = [
  { value: 'draft',     label: 'Kladd',      Icon: IconFile         },
  { value: 'sent',      label: 'Sendt',       Icon: IconSend         },
  { value: 'paid',      label: 'Betalt',      Icon: IconCircleCheck  },
  { value: 'overdue',   label: 'Forfalt',     Icon: IconAlertCircle  },
  { value: 'cancelled', label: 'Kansellert',  Icon: IconX            },
];

export function InvoiceStatusSelector({ invoice, onStatusChange, showModal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);
  const dropRef = useRef(null);

  const current = STATUS_OPTIONS.find((o) => o.value === invoice.status) || STATUS_OPTIONS[0];
  const badgeClass = statusBadge[invoice.status] || 'f-pill-draft';

  // Position dropdown below the badge
  const open = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setIsOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleSelect = async (newStatus) => {
    setIsOpen(false);
    if (newStatus === invoice.status) return;
    if (newStatus === 'paid') {
      showModal?.(invoice, newStatus);
    } else {
      try {
        await onStatusChange?.(invoice, newStatus, null);
      } catch (err) {
        console.error('Kunne ikke oppdatere status', err);
      }
    }
  };

  const dropdown = isOpen ? createPortal(
    <div
      ref={dropRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        minWidth: 150,
        background: 'var(--f-surface-card, rgba(12,22,18,0.97))',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--f-border)',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        padding: 4,
      }}
    >
      {STATUS_OPTIONS.map(({ value, label, Icon }) => {
        const isActive = value === invoice.status;
        return (
          <button
            key={value}
            onClick={() => handleSelect(value)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              width: '100%', padding: '7px 10px',
              borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: isActive ? 600 : 400,
              background: isActive ? 'var(--f-green-bg)' : 'transparent',
              color: isActive ? 'var(--f-green-text)' : 'var(--f-text-soft)',
              transition: 'background 0.1s, color 0.1s',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--f-text-body)'; }}}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--f-text-soft)'; }}}
          >
            <Icon size={13} stroke={1.8} />
            {label}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        ref={btnRef}
        onClick={open}
        title="Endre status"
        className={badgeClass}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 500,
          borderRadius: 'var(--f-radius-xs)',
          padding: '3px 7px 3px 8px',
          fontFamily: 'var(--f-font-mono)',
          cursor: 'pointer',
          border: 'none',
          background: 'inherit',
        }}
      >
        <current.Icon size={12} stroke={2} />
        {current.label}
        <IconChevronDown size={10} stroke={2} style={{ opacity: 0.5, marginLeft: 1 }} />
      </button>
      {dropdown}
    </>
  );
}
