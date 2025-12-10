import { FiCheck, FiStar, FiZap, FiShield } from 'react-icons/fi';
import { APP_VERSION } from '../../utils/version';
import { useSupporterPack } from '../../hooks/useSupporterPack';

export function AboutSettings() {
  const { isSupporter, features, aiCredits } = useSupporterPack();

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl border border-sand/60 bg-gradient-to-br from-brand-50 via-white to-brand-50/50 shadow-card">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-100/20 via-transparent to-transparent" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-brand-200/30 blur-xl" />
                <div className="relative rounded-2xl bg-white/80 backdrop-blur-sm p-4 shadow-lg border border-brand-200/50">
                  <img
                    src="/fattern-monogram.svg"
                    alt="Fattern"
                    className="h-16 w-16 md:h-20 md:w-20"
                  />
                </div>
              </div>
            </div>
            
            {/* App Info */}
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-bold text-ink mb-2">Fattern</h3>
              <p className="text-sm md:text-base text-ink-soft mb-4 max-w-2xl">
                En lokal-først faktureringsapplikasjon for norske bedrifter. 
                Designet for å være rask, privat og enkel å bruke.
              </p>
              <div className="flex flex-wrap gap-4 text-xs md:text-sm">
                <div className="flex items-center gap-2 text-ink-soft">
                  <span className="font-medium text-ink">Versjon:</span>
                  <span className="font-mono">{APP_VERSION}</span>
                </div>
                <div className="flex items-center gap-2 text-ink-soft">
                  <FiShield className="h-4 w-4 text-brand-600" />
                  <span>Lokal-først</span>
                </div>
                <div className="flex items-center gap-2 text-ink-soft">
                  <span className="font-medium text-ink">Lisens:</span>
                  <span>Open Source</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supporter Pack Status */}
      <div className={`rounded-3xl border shadow-card overflow-hidden ${
        isSupporter 
          ? 'border-moss/40 bg-gradient-to-br from-moss/5 via-white to-moss/5' 
          : 'border-sand/60 bg-white'
      }`}>
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 rounded-xl p-3 ${
              isSupporter ? 'bg-moss/10' : 'bg-brand-50'
            }`}>
              <FiStar className={`h-6 w-6 ${
                isSupporter ? 'text-moss' : 'text-brand-600'
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-lg font-semibold text-ink">Supporter Pack</h4>
                {isSupporter && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-moss/10 px-2.5 py-1 text-xs font-medium text-moss">
                    <FiCheck className="h-3 w-3" />
                    Aktivert
                  </span>
                )}
              </div>
              
              {isSupporter ? (
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-ink mb-2">Aktiverte funksjoner:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2 text-sm text-ink-soft">
                          <FiZap className="h-4 w-4 text-moss flex-shrink-0" />
                          <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-sand/60">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-ink-subtle mb-1">AI-kreditter</p>
                        <p className="text-2xl font-bold text-ink">{aiCredits.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-ink-subtle mb-1">Status</p>
                        <p className="text-sm font-semibold text-moss">Aktiv</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-sm text-ink-soft mb-4">
                    Støtt utviklingen av Fattern og få tilgang til eksklusive funksjoner, premium-temaer og AI-støtte.
                  </p>
                  <a
                    href="https://fattern.no/supporter"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-800 transition-colors"
                  >
                    <FiStar className="h-4 w-4" />
                    Lær mer om Supporter Pack
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

