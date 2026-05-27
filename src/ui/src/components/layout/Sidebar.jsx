/**
 * 52 px icon-only navigation rail.
 * Icons come from @tabler/icons-react; tooltips are pure CSS.
 */
import { useTranslation } from 'react-i18next';
import {
  IconLayoutDashboard,
  IconFileInvoice,
  IconReceipt,
  IconUsers,
  IconPackage,
  IconCalendarStats,
  IconSettings,
} from '@tabler/icons-react';

/* Map nav labels (internal identifiers, always Norwegian) → i18n keys */
const NAV_KEY_MAP = {
  'Oversikt':      'nav.overview',
  'Fakturaer':     'nav.invoices',
  'Utgifter':      'nav.expenses',
  'Kunder':        'nav.customers',
  'Produkter':     'nav.products',
  'Budsjettår':    'nav.budget_years',
  'Innstillinger': 'nav.settings',
};

/* Map nav labels → icon components */
const ICON_MAP = {
  Oversikt:     <IconLayoutDashboard size={18} stroke={1.6} />,
  Fakturaer:    <IconFileInvoice     size={18} stroke={1.6} />,
  Utgifter:     <IconReceipt         size={18} stroke={1.6} />,
  Kunder:       <IconUsers           size={18} stroke={1.6} />,
  Produkter:    <IconPackage         size={18} stroke={1.6} />,
  Budsjettår:   <IconCalendarStats   size={18} stroke={1.6} />,
  Innstillinger:<IconSettings        size={18} stroke={1.6} />,
};

/* Groups separated by a divider */
const NAV_GROUPS = [
  ['Oversikt', 'Fakturaer', 'Utgifter'],
  ['Kunder', 'Produkter', 'Budsjettår'],
];
const BOTTOM_ITEMS = ['Innstillinger'];

/* Badges are now driven by live data passed as props — no hardcoded set */

function Divider() {
  return (
    <div
      style={{
        width: 20, height: 1,
        background: 'var(--f-border)',
        margin: '4px 0',
      }}
    />
  );
}

function RailItem({ label, isActive, onClick, badge }) {
  const { t } = useTranslation();
  const icon = ICON_MAP[label];
  const displayLabel = NAV_KEY_MAP[label] ? t(NAV_KEY_MAP[label]) : label;

  return (
    /* Tooltip wrapper — pure CSS, no JS needed */
    <div
      style={{ position: 'relative' }}
      className="f-tt-host"
    >
      <style>{`
        .f-tt-host .f-tooltip { opacity: 0; pointer-events: none; transition: opacity 0.12s; }
        .f-tt-host:hover .f-tooltip { opacity: 1; }
      `}</style>

      <button
        onClick={() => onClick?.(label)}
        aria-label={displayLabel}
        style={{
          width: 36, height: 36, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          border: isActive ? '1px solid var(--f-border-green)' : '1px solid transparent',
          background: isActive ? 'var(--f-green-bg)' : 'transparent',
          color: isActive ? 'var(--f-green-text)' : 'var(--f-text-subtle)',
          boxShadow: isActive ? '0 0 14px rgba(45,180,130,0.2)' : 'none',
          position: 'relative',
          transition: 'background 0.13s, color 0.13s, border-color 0.13s',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'var(--f-hover-elevated)';
            e.currentTarget.style.color = 'var(--f-text-soft)';
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--f-text-subtle)';
          }
        }}
      >
        {icon}
        {badge && (
          <span
            style={{
              position: 'absolute', top: 5, right: 5,
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--f-green)',
              border: '1.5px solid var(--f-badge-border)',
              boxShadow: '0 0 6px rgba(63,217,160,0.6)',
            }}
          />
        )}
      </button>

      {/* Tooltip */}
      <div
        className="f-tooltip"
        style={{
          position: 'absolute',
          left: 'calc(100% + 10px)',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'var(--f-tooltip-bg)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--f-tooltip-border)',
          color: 'var(--f-tooltip-text)',
          fontSize: 11.5,
          fontWeight: 500,
          fontFamily: 'var(--f-font-sans)',
          whiteSpace: 'nowrap',
          padding: '5px 10px',
          borderRadius: 7,
          zIndex: 999,
          boxShadow: '0 4px 12px var(--f-tooltip-shadow)',
        }}
      >
        <span
          style={{
            content: '',
            position: 'absolute',
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            border: '4px solid transparent',
            borderRightColor: 'var(--f-tooltip-border)',
          }}
        />
        {displayLabel}
      </div>
    </div>
  );
}

export function Sidebar({ navItems, activeNavItem, onNavigate, badges = {} }) {
  const allLabels = (navItems || []).map(n => n.label);

  const renderGroup = (group) =>
    group
      .filter(label => allLabels.includes(label) || ICON_MAP[label])
      .map(label => (
        <RailItem
          key={label}
          label={label}
          isActive={activeNavItem === label}
          onClick={onNavigate}
          badge={!!badges[label]}
        />
      ));

  return (
    <aside
      style={{
        width: 'var(--f-rail-w)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '14px 0',
        gap: 3,
        background: 'var(--f-surface-rail)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--f-border-subtle)',
        zIndex: 10,
      }}
    >
      {NAV_GROUPS.map((group, i) => (
        <div key={i} style={{ display: 'contents' }}>
          {renderGroup(group)}
          <Divider />
        </div>
      ))}

      {/* Spacer pushes settings to bottom */}
      <div style={{ flex: 1 }} />
      <Divider />
      {renderGroup(BOTTOM_ITEMS)}
    </aside>
  );
}
