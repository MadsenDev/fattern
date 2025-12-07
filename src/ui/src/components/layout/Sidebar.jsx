export function Sidebar({ company, navItems, workflowShortcuts, activeNavItem, onNavigate }) {
  const displayName = company?.name && company.name !== 'Default Company' ? company.name : 'Fattern';

  return (
    <aside className="hidden flex-col gap-6 lg:sticky lg:top-6 lg:flex lg:self-start lg:h-[calc(100vh-3rem)] lg:overflow-y-auto xl:top-6 xl:h-[calc(100vh-3rem)]">
      <div className="rounded-3xl border border-sand/60 bg-white/80 p-6 shadow-card backdrop-blur-sm">
        <div className="rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 p-5 text-white shadow-inner">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-wider text-white/70">Arbeidsområde</p>
              <p className="mt-3 text-2xl font-semibold">{displayName}</p>
              <p className="mt-2 text-sm text-white/80">Lokal-først økonomiverktøy</p>
            </div>
            <img
              src="/fattern-monogram.svg"
              alt="Fattern monogram"
              className="hidden h-16 w-auto shrink-0 drop-shadow-2xl sm:block"
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-2xl border border-white/40 px-3 py-1 text-xs font-medium text-white/90">
              Synk konto
            </button>
            <button className="rounded-2xl border border-white/40 px-3 py-1 text-xs font-medium text-white/90">
              Inviter team
            </button>
          </div>
        </div>

        <nav className="mt-6 space-y-1">
          {navItems.map((item) => {
            const isActive = activeNavItem === item.label;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate?.(item.label)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-100'
                    : 'text-ink-soft hover:bg-cloud'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isActive ? 'bg-white text-brand-600' : 'bg-cloud text-ink-soft'
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl border border-sand/70 bg-cloud/60 p-4">
          <p className="text-xs uppercase tracking-widest text-ink-subtle">Arbeidsflyt</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            {workflowShortcuts.map((shortcut) => (
              <li key={shortcut.label} className="flex items-center justify-between rounded-xl px-2 py-1">
                <span>{shortcut.label}</span>
                <span className="rounded-xl border border-sand/70 px-2 py-0.5 text-xs font-semibold">
                  {shortcut.helper}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-2xl border border-sand/70 p-4 text-xs text-ink-subtle">
          SQLite · Frakoblet · v1 forhåndsvisning
        </div>
      </div>
    </aside>
  );
}

