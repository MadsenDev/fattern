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
        <h3 className="text-sm font-semibold text-ink mb-1">Faktura innstillinger</h3>
        <p className="text-xs text-ink-subtle mb-4">Standardverdier for nye fakturaer</p>
      </div>

      <div className="space-y-4">
        {/* Payment Terms */}
        <div className="py-3 border-b border-sand/40">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-ink">Standard betalingsfrist</label>
              <p className="text-xs text-ink-subtle mt-0.5">Antall dager fra faktureringsdato til forfallsdato</p>
            </div>
            <div className="flex rounded-lg border border-sand bg-white p-0.5">
              {[14, 21, 30, 45, 60].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handlePaymentTermsChange(days)}
                  disabled={isLoading}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                    defaultPaymentTerms === days
                      ? 'bg-brand-700 text-white shadow-sm'
                      : 'text-ink-soft hover:text-ink hover:bg-cloud'
                  }`}
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
              className="w-24 rounded-lg border border-sand bg-white px-2 py-1 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Egendefinert"
            />
            <span className="ml-2 text-xs text-ink-subtle">dager</span>
          </div>
        </div>

        {/* Auto-calculate Due Date */}
        <div className="py-3 border-b border-sand/40">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-ink">Automatisk forfallsdato</label>
              <p className="text-xs text-ink-subtle mt-0.5">
                Beregn forfallsdato automatisk basert på faktureringsdato og betalingsfrist
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAutoCalculateDueDate(!autoCalculateDueDate)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 disabled:opacity-60 ${
                autoCalculateDueDate ? 'bg-brand-700' : 'bg-sand'
              }`}
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
        <div className="py-3 border-b border-sand/40">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-ink">Standard status</label>
              <p className="text-xs text-ink-subtle mt-0.5">Standard status for nye fakturaer</p>
            </div>
            <div className="flex rounded-lg border border-sand bg-white p-0.5">
              <button
                type="button"
                onClick={() => handleDefaultStatusChange('draft')}
                disabled={isLoading}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                  defaultStatus === 'draft'
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'text-ink-soft hover:text-ink hover:bg-cloud'
                }`}
              >
                Utkast
              </button>
              <button
                type="button"
                onClick={() => handleDefaultStatusChange('sent')}
                disabled={isLoading}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-60 ${
                  defaultStatus === 'sent'
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'text-ink-soft hover:text-ink hover:bg-cloud'
                }`}
              >
                Sendt
              </button>
            </div>
          </div>
        </div>

        {/* Auto-increment Invoice Numbers */}
        <div className="py-3 border-b border-sand/40">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-ink">Automatisk fakturanummerering</label>
              <p className="text-xs text-ink-subtle mt-0.5">
                Generer fakturanummer automatisk (format: YYYY-XXX eller budsjettår-XXX)
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAutoIncrementChange(!autoIncrementNumbers)}
              disabled={isLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 disabled:opacity-60 ${
                autoIncrementNumbers ? 'bg-brand-700' : 'bg-sand'
              }`}
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
        <div className="rounded-lg border border-brand-200 bg-brand-50/50 p-4">
          <p className="text-xs text-ink-soft">
            <strong className="text-ink">Merk:</strong> Disse innstillingene gjelder for nye fakturaer. 
            Eksisterende fakturaer påvirkes ikke. Fakturanummerering følger budsjettår-grenser og nullstilles automatisk ved årsskifte.
          </p>
        </div>
      </div>
    </div>
  );
}

