import { Sidebar } from './Sidebar';

export function Layout({ children, company, navItems, workflowShortcuts, activeNavItem, onNavigate }) {
  return (
    <div className="bg-brand-50/60 px-4 py-6 lg:px-8 xl:px-12">
      <div className="grid w-full gap-6 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
        <Sidebar
          company={company}
          navItems={navItems}
          workflowShortcuts={workflowShortcuts}
          activeNavItem={activeNavItem}
          onNavigate={onNavigate}
        />
        <main className="flex-1 space-y-6">{children}</main>
      </div>
    </div>
  );
}

