import { IconCode, IconStar } from '@tabler/icons-react';
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
      <div className="f-glass relative overflow-hidden rounded-3xl" style={{ border: '2px dashed var(--f-border-green)' }}>
        <div className="relative p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 rounded-xl p-3" style={{ background: 'var(--f-green-bg)' }}>
              <IconCode className="h-6 w-6" style={{ color: 'var(--f-green-text)' }} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--f-text)' }}>Utviklermeny</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--f-text-soft)' }}>
                Verktøy og innstillinger for utviklere. Denne menyen er skjult og kan åpnes med tastatursnarveien.
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--f-text-subtle)' }}>
                <kbd className="px-2.5 py-1 rounded-lg text-xs font-mono" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--f-border)', color: 'var(--f-text-body)' }}>
                  Ctrl+Shift+D
                </kbd>
                <span>for å vise/skjule denne menyen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supporter Pack Toggle */}
      <div className="f-glass rounded-2xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-shrink-0 rounded-xl p-3" style={{ background: isSupporter ? 'rgba(103,185,153,0.12)' : 'var(--f-surface)' }}>
              <IconStar className="h-5 w-5" style={{ color: isSupporter ? 'var(--f-green)' : 'var(--f-green-text-dim)' }} />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold mb-1" style={{ color: 'var(--f-text)' }}>Supporter-pakke</h4>
              <p className="text-xs mb-4" style={{ color: 'var(--f-text-subtle)' }}>
                Aktiver eller deaktiver Supporter-pakken for testing. Dette påvirker tilgang til premium-funksjoner.
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 rounded-lg p-3" style={{
                  border: isSupporter ? '1px solid var(--f-border-green)' : '1px solid var(--f-border-subtle)',
                  background: isSupporter ? 'var(--f-green-bg)' : 'rgba(255,255,255,0.03)',
                }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--f-text-subtle)' }}>Status</p>
                  <p className="text-sm font-semibold" style={{ color: isSupporter ? 'var(--f-green-text)' : 'var(--f-text-soft)' }}>
                    {isSupporter ? 'Aktivert' : 'Deaktivert'}
                  </p>
                </div>
                {isSupporter && (
                  <div className="flex-1 rounded-lg p-3" style={{ border: '1px solid var(--f-border-subtle)', background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--f-text-subtle)' }}>AI-kreditter</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--f-text-body)' }}>{aiCredits.toLocaleString()}</p>
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
                        toast.success('Supporter-pakken er aktivert', 'Alle premium-funksjoner er nå tilgjengelige');
                        setTimeout(() => window.location.reload(), 500);
                      } catch (error) {
                        console.error('Failed to activate supporter pack', error);
                        toast.error('Kunne ikke aktivere Supporter-pakken');
                      }
                    })();
                  }
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition ${isSupporter ? 'f-btn-ghost' : 'f-btn-primary'}`}
              >
                {isSupporter ? 'Deaktiver Supporter-pakken' : 'Aktiver Supporter-pakken'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dev Tools */}
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--f-text)' }}>Utviklerverktøy</h4>
          <p className="text-xs" style={{ color: 'var(--f-text-subtle)' }}>Verktøy for testing og feilsøking</p>
        </div>

        <div className="f-glass rounded-2xl overflow-hidden">
          <div className="p-6">
            <TesseractTest />
          </div>
        </div>

        <div className="f-glass rounded-2xl overflow-hidden">
          <div className="p-6">
            <CreditLedgerViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
