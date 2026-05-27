import { useTranslation } from 'react-i18next';
import { APP_VERSION } from '../../utils/version';

/**
 * Persistent status bar at the bottom of the shell.
 * Shows the active company, workflow shortcuts, and connection/version status.
 */
export function BottomBar({ company, onCreateInvoice, onRegisterPayment, onAddExpense }) {
  const { t } = useTranslation();

  const displayName = company?.name && company.name !== 'Default Company'
    ? company.name
    : 'Fattern';

  /* Derive initials from first two words */
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const shortcuts = [
    { labelKey: 'layout.shortcut_new_invoice',       key: '⌘ N', action: onCreateInvoice },
    { labelKey: 'layout.shortcut_register_payment',  key: '⌘ P', action: onRegisterPayment },
    { labelKey: 'layout.shortcut_add_expense',       key: '⌘ E', action: onAddExpense },
  ];

  return (
    <div
      style={{
        height: 'var(--f-bottom-h)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '0 18px',
        flexShrink: 0,
        background: 'var(--f-surface-bottom)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--f-border-top)',
        zIndex: 100,
      }}
    >
      {/* Company pill */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'var(--f-surface)',
          border: '1px solid var(--f-border)',
          borderRadius: 20,
          padding: '4px 12px 4px 6px',
          marginRight: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'rgba(45,180,130,0.25)',
            border: '1px solid rgba(63,217,160,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8, fontWeight: 700, color: 'var(--f-green)',
          }}
        >
          {initials}
        </div>
        <span
          style={{
            fontSize: 11,
            color: 'var(--f-text-soft)',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          {displayName}
        </span>
      </div>

      {/* Workflow shortcuts */}
      {shortcuts.map(({ labelKey, key, action }) => (
        <button
          key={labelKey}
          onClick={action}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '3px 8px',
            borderRadius: 6,
            background: 'none',
            border: 'none',
            cursor: action ? 'pointer' : 'default',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--f-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
          <span style={{ fontSize: 11.5, color: 'var(--f-text-subtle)' }}>{t(labelKey)}</span>
          <span
            style={{
              fontSize: 10,
              color: 'var(--f-text-muted)',
              background: 'var(--f-hover-elevated)',
              border: '1px solid var(--f-border)',
              borderRadius: 4,
              padding: '1px 5px',
              fontFamily: 'var(--f-font-mono)',
            }}
          >
            {key}
          </span>
        </button>
      ))}

      {/* Right: status indicator */}
      <div
        style={{
          marginLeft: 'auto',
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 10.5,
          color: 'var(--f-text-muted)',
          fontFamily: 'var(--f-font-mono)',
        }}
      >
        <span
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--f-green)',
            boxShadow: '0 0 6px rgba(63,217,160,0.7)',
            flexShrink: 0,
          }}
        />
        {t('layout.local')} · v{APP_VERSION}
      </div>
    </div>
  );
}
