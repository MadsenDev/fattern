import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../../hooks/useToast';

export function InvoiceSettings() {
  const { getSetting, updateSetting, isLoading } = useSettings();
  const { toast } = useToast();

  // Get current settings with defaults
  const defaultPaymentTerms = parseInt(getSetting('invoice.defaultPaymentTerms', '14'), 10);
  const autoCalculateDueDate = getSetting('invoice.autoCalculateDueDate', 'true') === 'true';
  const defaultStatus = getSetting('invoice.defaultStatus', 'draft');
  const autoIncrementNumbers = getSetting('invoice.autoIncrementNumbers', 'true') === 'true';

  const handlePaymentTermsChange = (days) => {
    updateSetting('invoice.defaultPaymentTerms', days.toString());
    toast.success('Standard betalingsfrist oppdatert', `${days} dager`);
  };

  const handleAutoCalculateDueDate = (enabled) => {
    updateSetting('invoice.autoCalculateDueDate', enabled.toString());
    toast.success('Automatisk forfallsdato', enabled ? 'Aktivert' : 'Deaktivert');
  };

  const handleDefaultStatusChange = (status) => {
    updateSetting('invoice.defaultStatus', status);
    toast.success('Standard status oppdatert', status === 'draft' ? 'Utkast' : status === 'sent' ? 'Sendt' : 'Betalt');
  };

  const handleAutoIncrementChange = (enabled) => {
    updateSetting('invoice.autoIncrementNumbers', enabled.toString());
    toast.success('Automatisk nummerering', enabled ? 'Aktivert' : 'Deaktivert');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--f-text-body)' }}>Faktura innstillinger</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--f-text-subtle)' }}>Standardverdier for nye fakturaer</p>
      </div>

      <div className="space-y-4">
        {/* Payment Terms */}
        <div className="py-3" style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Standard betalingsfrist</label>
              <p className="text-xs mt-0.5" style={{ color: 'var(--f-text-subtle)' }}>Antall dager fra faktureringsdato til forfallsdato</p>
            </div>
            <div className="flex rounded-lg p-0.5" style={{ border: '1px solid var(--f-border)', background: 'rgba(255,255,255,0.04)' }}>
              {[14, 21, 30, 45, 60].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handlePaymentTermsChange(days)}
                  disabled={isLoading}
                  className="rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
                  style={defaultPaymentTerms === days
                    ? { background: 'var(--f-green-bg)', color: 'var(--f-green-text)', border: '1px solid var(--f-border-green)' }
                    : { color: 'var(--f-text-soft)' }}
                  onMouseEnter={e => { if (defaultPaymentTerms !== days) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--f-text-body)'; } }}
                  onMouseLeave={e => { if (defaultPaymentTerms !== days) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--f-text-soft)'; } }}
                >
                  {days} dager
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <input
              type="number"
              min="1"
              max="365"
              value={defaultPaymentTerms}
              onChange={(e) => {
                const days = parseInt(e.target.value, 10);
                if (days >= 1 && days <= 365) {
                  handlePaymentTermsChange(days);
                }
              }}
              className="f-input w-24 rounded-lg px-2 py-1 text-sm"
              placeholder="Egendefinert"
            />
            <span className="ml-2 text-xs" style={{ color: 'var(--f-text-subtle)' }}>dager</span>
          </div>
        </div>

        {/* Auto-calculate Due Date */}
        <div className="py-3" style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Automatisk forfallsdato</label>
              <p className="text-xs mt-0.5" style={{ color: 'var(--f-text-subtle)' }}>
                Beregn forfallsdato automatisk basert på faktureringsdato og betalingsfrist
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAutoCalculateDueDate(!autoCalculateDueDate)}
              disabled={isLoading}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60"
              style={{ background: autoCalculateDueDate ? 'var(--f-green)' : 'rgba(255,255,255,0.12)' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoCalculateDueDate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Default Status */}
        <div className="py-3" style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Standard status</label>
              <p className="text-xs mt-0.5" style={{ color: 'var(--f-text-subtle)' }}>Standard status for nye fakturaer</p>
            </div>
            <div className="flex rounded-lg p-0.5" style={{ border: '1px solid var(--f-border)', background: 'rgba(255,255,255,0.04)' }}>
              <button
                type="button"
                onClick={() => handleDefaultStatusChange('draft')}
                disabled={isLoading}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
                style={defaultStatus === 'draft' ? { background: 'var(--f-green-bg)', color: 'var(--f-green-text)', border: '1px solid var(--f-border-green)' } : { color: 'var(--f-text-soft)' }}
                onMouseEnter={e => { if (defaultStatus !== 'draft') { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
                onMouseLeave={e => { if (defaultStatus !== 'draft') { e.currentTarget.style.background = 'transparent'; } }}
              >
                Utkast
              </button>
              <button
                type="button"
                onClick={() => handleDefaultStatusChange('sent')}
                disabled={isLoading}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60"
                style={defaultStatus === 'sent' ? { background: 'var(--f-green-bg)', color: 'var(--f-green-text)', border: '1px solid var(--f-border-green)' } : { color: 'var(--f-text-soft)' }}
                onMouseEnter={e => { if (defaultStatus !== 'sent') { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
                onMouseLeave={e => { if (defaultStatus !== 'sent') { e.currentTarget.style.background = 'transparent'; } }}
              >
                Sendt
              </button>
            </div>
          </div>
        </div>

        {/* Auto-increment Invoice Numbers */}
        <div className="py-3" style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium" style={{ color: 'var(--f-text-body)' }}>Automatisk fakturanummerering</label>
              <p className="text-xs mt-0.5" style={{ color: 'var(--f-text-subtle)' }}>
                Generer fakturanummer automatisk (format: YYYY-XXX eller budsjettår-XXX)
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAutoIncrementChange(!autoIncrementNumbers)}
              disabled={isLoading}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-60"
              style={{ background: autoIncrementNumbers ? 'var(--f-green)' : 'rgba(255,255,255,0.12)' }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoIncrementNumbers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="rounded-lg p-4" style={{ border: '1px solid var(--f-border-subtle)', background: 'rgba(255,255,255,0.03)' }}>
          <p className="text-xs" style={{ color: 'var(--f-text-soft)' }}>
            <strong style={{ color: 'var(--f-text-body)' }}>Merk:</strong> Disse innstillingene gjelder for nye fakturaer.
            Eksisterende fakturaer påvirkes ikke. Fakturanummerering følger budsjettår-grenser og nullstilles automatisk ved årsskifte.
          </p>
        </div>
      </div>
    </div>
  );
}
