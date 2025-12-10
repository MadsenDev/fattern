import { useSettings } from '../../hooks/useSettings';

export function DefaultsSettings() {
  const { getSetting, updateSetting, isLoading } = useSettings();
  const productsDefaultView = getSetting('products.defaultView', 'table');
  const customersDefaultView = getSetting('customers.defaultView', 'table');

  const handleDefaultViewChange = (type, value) => {
    updateSetting(`${type}.defaultView`, value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">Standard visninger</h3>
        <p className="text-xs text-ink-subtle mb-4">Velg standard visningsmodus for ulike sider</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-sand/40">
          <div className="flex-1">
            <label className="text-sm font-medium text-ink">Produkter</label>
            <p className="text-xs text-ink-subtle mt-0.5">Standard visning når du åpner produktsiden</p>
          </div>
          <div className="flex rounded-lg border border-sand bg-white p-0.5">
            <button
              type="button"
              onClick={() => handleDefaultViewChange('products', 'table')}
              disabled={isLoading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                productsDefaultView === 'table'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-cloud'
              }`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => handleDefaultViewChange('products', 'card')}
              disabled={isLoading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                productsDefaultView === 'card'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-cloud'
              }`}
            >
              Kort
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-sand/40">
          <div className="flex-1">
            <label className="text-sm font-medium text-ink">Kunder</label>
            <p className="text-xs text-ink-subtle mt-0.5">Standard visning når du åpner kundesiden</p>
          </div>
          <div className="flex rounded-lg border border-sand bg-white p-0.5">
            <button
              type="button"
              onClick={() => handleDefaultViewChange('customers', 'table')}
              disabled={isLoading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                customersDefaultView === 'table'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-cloud'
              }`}
            >
              Liste
            </button>
            <button
              type="button"
              onClick={() => handleDefaultViewChange('customers', 'card')}
              disabled={isLoading}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                customersDefaultView === 'card'
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-ink-soft hover:text-ink hover:bg-cloud'
              }`}
            >
              Kort
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

