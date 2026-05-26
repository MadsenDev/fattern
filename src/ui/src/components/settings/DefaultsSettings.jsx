import { useSettings } from '../../hooks/useSettings';

export function DefaultsSettings() {
  const { getSetting, updateSetting, isLoading } = useSettings();
  const productsDefaultView = getSetting('products.defaultView', 'table');
  const customersDefaultView = getSetting('customers.defaultView', 'table');

  const handleDefaultViewChange = (type, value) => {
    updateSetting(`${type}.defaultView`, value);
  };

  const segmentActive = { background: 'var(--f-green-bg)', color: 'var(--f-green-text)', border: '1px solid var(--f-border-green)' };
  const segmentInactive = { color: 'var(--f-text-soft)' };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--f-text-body)' }}>Standard visninger</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--f-text-subtle)' }}>Velg standard visningsmodus for ulike sider</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
          <div className="flex-1">
            <label className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Produkter</label>
            <p className="text-xs mt-0.5" style={{ color: 'var(--f-text-subtle)' }}>Standard visning når du åpner produktsiden</p>
          </div>
          <div className="flex rounded-lg p-0.5" style={{ border: '1px solid var(--f-border)', background: 'rgba(255,255,255,0.04)' }}>
            <button
              type="button"
              onClick={() => handleDefaultViewChange('products', 'table')}
              disabled={isLoading}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
              style={productsDefaultView === 'table' ? segmentActive : segmentInactive}
              onMouseEnter={e => { if (productsDefaultView !== 'table') { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--f-text-body)'; } }}
              onMouseLeave={e => { if (productsDefaultView !== 'table') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--f-text-soft)'; } }}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => handleDefaultViewChange('products', 'card')}
              disabled={isLoading}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
              style={productsDefaultView === 'card' ? segmentActive : segmentInactive}
              onMouseEnter={e => { if (productsDefaultView !== 'card') { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--f-text-body)'; } }}
              onMouseLeave={e => { if (productsDefaultView !== 'card') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--f-text-soft)'; } }}
            >
              Kort
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
          <div className="flex-1">
            <label className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Kunder</label>
            <p className="text-xs mt-0.5" style={{ color: 'var(--f-text-subtle)' }}>Standard visning når du åpner kundesiden</p>
          </div>
          <div className="flex rounded-lg p-0.5" style={{ border: '1px solid var(--f-border)', background: 'rgba(255,255,255,0.04)' }}>
            <button
              type="button"
              onClick={() => handleDefaultViewChange('customers', 'table')}
              disabled={isLoading}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
              style={customersDefaultView === 'table' ? segmentActive : segmentInactive}
              onMouseEnter={e => { if (customersDefaultView !== 'table') { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--f-text-body)'; } }}
              onMouseLeave={e => { if (customersDefaultView !== 'table') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--f-text-soft)'; } }}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => handleDefaultViewChange('customers', 'card')}
              disabled={isLoading}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
              style={customersDefaultView === 'card' ? segmentActive : segmentInactive}
              onMouseEnter={e => { if (customersDefaultView !== 'card') { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--f-text-body)'; } }}
              onMouseLeave={e => { if (customersDefaultView !== 'card') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--f-text-soft)'; } }}
            >
              Kort
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
