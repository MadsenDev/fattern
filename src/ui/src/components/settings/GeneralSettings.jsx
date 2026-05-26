export function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--f-text-body)' }}>Generelle innstillinger</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--f-text-subtle)' }}>Generelle app-innstillinger og preferanser</p>
      </div>

      <div className="space-y-4">
        <div className="py-3" style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--f-text-subtle)' }}>Kommer snart</label>
          <p className="text-sm mt-1.5" style={{ color: 'var(--f-text-soft)' }}>Flere generelle innstillinger vil bli lagt til her</p>
        </div>
      </div>
    </div>
  );
}

