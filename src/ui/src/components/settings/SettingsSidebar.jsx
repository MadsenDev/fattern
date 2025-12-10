import { SETTING_CATEGORIES } from '../../utils/settingsConstants';

export function SettingsSidebar({ activeCategory, onCategoryChange, showDevMenu }) {
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="rounded-2xl border border-sand/60 bg-white shadow-card p-3">
        <div className="mb-2 px-2 py-1.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">Kategorier</p>
        </div>
        <nav className="space-y-1">
          {SETTING_CATEGORIES.filter((category) => {
            // Hide dev menu unless explicitly shown
            if (category.hidden && !showDevMenu) return false;
            return true;
          }).map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.id)}
                className={`group relative w-full flex items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-100 shadow-sm'
                    : 'text-ink-soft hover:bg-cloud hover:text-ink border border-transparent'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                    isActive
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'bg-cloud text-ink-soft group-hover:bg-white/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{category.label}</div>
                  <div className={`text-xs mt-0.5 ${
                    isActive ? 'text-brand-600/80' : 'text-ink-subtle'
                  }`}>
                    {category.description}
                  </div>
                </div>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-brand-600" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

