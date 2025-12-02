export function StatCard({ title, value, subtitle, icon, tone = 'default' }) {
  const toneClasses = {
    default: 'bg-white border border-sand/60 text-ink',
    accent: 'bg-gradient-to-br from-brand-700 to-brand-500 text-white shadow-card',
    muted: 'bg-brand-50 border border-brand-100 text-brand-900',
    soft: 'bg-white border border-brand-200 text-brand-900',
  };

  const labelClass = tone === 'accent' ? 'text-white/80' : 'text-ink-subtle';
  const subClass = tone === 'accent' ? 'text-white/70' : 'text-ink-soft';
  const iconWrap =
    tone === 'accent' ? 'bg-white/15 text-white' : 'bg-brand-50 text-brand-700 border border-brand-100';

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wider ${labelClass}`}>{title}</p>
          <p className="mt-3 text-2xl font-semibold">{value}</p>
          {subtitle ? <p className={`mt-1 text-sm ${subClass}`}>{subtitle}</p> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconWrap}`}>{icon}</div>
      </div>
    </div>
  );
}

