import { Sidebar } from './Sidebar';

/**
 * 2026 shell layout: narrow icon rail + scrollable main column.
 * The outer flex-column frame + ambient background live in App.jsx.
 */
export function Layout({ children, company, navItems, workflowShortcuts, activeNavItem, onNavigate }) {
  return (
    <>
      <Sidebar
        navItems={navItems}
        activeNavItem={activeNavItem}
        onNavigate={onNavigate}
      />
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {children}
      </main>
    </>
  );
}
