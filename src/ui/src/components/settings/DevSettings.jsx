import { FiCode, FiStar, FiCheck } from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';
import { useSupporterPack } from '../../hooks/useSupporterPack';
import { TesseractTest } from '../dev/TesseractTest';
import { CreditLedgerViewer } from '../dev/CreditLedgerViewer';

export function DevSettings() {
  const { toast } = useToast();
  const { isSupporter, activateSupporterPack, aiCredits } = useSupporterPack();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-brand-300 bg-gradient-to-br from-brand-50/50 via-white to-brand-50/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-100/20 via-transparent to-transparent" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-xl bg-brand-100 p-3">
              <FiCode className="h-6 w-6 text-brand-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-ink mb-2">Utviklermeny</h3>
              <p className="text-sm text-ink-soft mb-3">
                Verktøy og innstillinger for utviklere. Denne menyen er skjult og kan åpnes med tastatursnarveien.
              </p>
              <div className="flex items-center gap-2 text-xs text-ink-subtle">
                <kbd className="px-2.5 py-1 bg-white rounded-lg border border-brand-200 text-xs font-mono shadow-sm">
                  Ctrl+Shift+D
                </kbd>
                <span>for å vise/skjule denne menyen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supporter Pack Toggle */}
      <div className="rounded-2xl border border-sand/60 bg-white shadow-card overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 rounded-xl p-3 ${
              isSupporter ? 'bg-moss/10' : 'bg-brand-50'
            }`}>
              <FiStar className={`h-5 w-5 ${
                isSupporter ? 'text-moss' : 'text-brand-600'
              }`} />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-ink mb-1">Supporter Pack Toggle</h4>
              <p className="text-xs text-ink-subtle mb-4">
                Aktiver eller deaktiver Supporter Pack for testing. Dette påvirker tilgang til premium-funksjoner.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex-1 rounded-lg border p-3 ${
                  isSupporter 
                    ? 'border-moss/40 bg-moss/5' 
                    : 'border-sand/60 bg-cloud/30'
                }`}>
                  <p className="text-xs text-ink-subtle mb-1">Status</p>
                  <p className={`text-sm font-semibold ${
                    isSupporter ? 'text-moss' : 'text-ink-soft'
                  }`}>
                    {isSupporter ? 'Aktivert' : 'Deaktivert'}
                  </p>
                </div>
                {isSupporter && (
                  <div className="flex-1 rounded-lg border border-sand/60 bg-cloud/30 p-3">
                    <p className="text-xs text-ink-subtle mb-1">AI-kreditter</p>
                    <p className="text-sm font-semibold text-ink">{aiCredits.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (isSupporter) {
                    localStorage.removeItem('fattern:supporter');
                    window.location.reload();
                  } else {
                    (async () => {
                      try {
                        await activateSupporterPack({
                          features: ['premium_themes', 'premium_templates', 'ai'],
                          ai_credits: 1000,
                        });
                        toast.success('Supporter Pack aktivert', 'Alle premium-funksjoner er nå tilgjengelige');
                        setTimeout(() => window.location.reload(), 500);
                      } catch (error) {
                        console.error('Failed to activate supporter pack', error);
                        toast.error('Kunne ikke aktivere Supporter Pack');
                      }
                    })();
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isSupporter
                    ? 'bg-sand text-ink hover:bg-sand/80 border border-sand/60'
                    : 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm'
                }`}
              >
                {isSupporter ? 'Deaktiver Supporter Pack' : 'Aktiver Supporter Pack'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dev Tools */}
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-ink mb-1">Utviklerverktøy</h4>
          <p className="text-xs text-ink-subtle">Verktøy for testing og debugging</p>
        </div>

        {/* Tesseract Test */}
        <div className="rounded-2xl border border-sand/60 bg-white shadow-card overflow-hidden">
          <div className="p-6">
            <TesseractTest />
          </div>
        </div>

        {/* Credit Ledger Viewer */}
        <div className="rounded-2xl border border-sand/60 bg-white shadow-card overflow-hidden">
          <div className="p-6">
            <CreditLedgerViewer />
          </div>
        </div>
      </div>
    </div>
  );
}

