import { FiCheck, FiLock } from 'react-icons/fi';
import { useTheme } from '../../hooks/useTheme';
import { useSupporterPack } from '../../hooks/useSupporterPack';
import { useToast } from '../../hooks/useToast';

export function AppearanceSettings() {
  const { toast } = useToast();
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const { isSupporter } = useSupporterPack();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-ink mb-1">Utseende</h3>
        <p className="text-xs text-ink-subtle mb-4">Tilpass appens utseende og visning</p>
      </div>

      <div className="space-y-4">
        <div className="py-3 border-b border-sand/40">
          <label className="text-xs font-medium text-ink-subtle uppercase tracking-wider mb-4 block">Tema</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableThemes.map((theme) => {
              const isSelected = currentTheme?.id === theme.id;
              const isLocked = theme.premium && !isSupporter;
              
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    if (isLocked) {
                      toast.info('Premium tema', 'Dette temaet krever Supporter-pakken');
                      return;
                    }
                    try {
                      setTheme(theme.id);
                      toast.success('Tema endret', `"${theme.name}" er nå aktivt`);
                    } catch (error) {
                      toast.error('Kunne ikke endre tema', error.message);
                    }
                  }}
                  disabled={isLocked}
                  className={`relative rounded-xl border-2 overflow-hidden transition-all ${
                    isSelected
                      ? 'border-brand-600 shadow-lg shadow-brand-600/20'
                      : 'border-sand/60 hover:border-brand-300 hover:shadow-md'
                  } ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {/* Theme Preview */}
                  <div 
                    className="h-24 relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${theme.colors.cloud} 0%, ${theme.colors.mist} 50%, ${theme.colors.brand[100]} 100%)`
                    }}
                  >
                    {/* Preview Content */}
                    <div className="absolute inset-0 p-3 flex flex-col gap-1.5">
                      {/* Preview Header */}
                      <div 
                        className="h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.brand[600], width: '60%' }}
                      />
                      {/* Preview Cards */}
                      <div className="flex gap-1.5 mt-1">
                        <div 
                          className="h-8 rounded flex-1"
                          style={{ backgroundColor: theme.colors.white }}
                        >
                          <div 
                            className="h-full rounded flex items-center px-2"
                            style={{ backgroundColor: theme.colors.brand[50] }}
                          >
                            <div 
                              className="h-1.5 rounded-full"
                              style={{ backgroundColor: theme.colors.brand[400], width: '40%' }}
                            />
                          </div>
                        </div>
                        <div 
                          className="h-8 rounded flex-1"
                          style={{ backgroundColor: theme.colors.white }}
                        >
                          <div 
                            className="h-full rounded flex items-center px-2"
                            style={{ backgroundColor: theme.colors.mist }}
                          >
                            <div 
                              className="h-1.5 rounded-full"
                              style={{ backgroundColor: theme.colors.ink, opacity: 0.3, width: '50%' }}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Preview Accent */}
                      <div className="flex gap-1 mt-auto">
                        <div 
                          className="h-1.5 rounded-full flex-1"
                          style={{ backgroundColor: theme.colors.brand[500] }}
                        />
                        <div 
                          className="h-1.5 rounded-full flex-1"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                      </div>
                    </div>
                    
                    {/* Lock Icon */}
                    {isLocked && (
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
                        <FiLock className="h-3.5 w-3.5 text-ink-subtle" />
                      </div>
                    )}
                    
                    {/* Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-brand-600 rounded-full p-1.5 shadow-lg">
                        <FiCheck className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Card Footer */}
                  <div className="p-4 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full border border-sand/60 flex-shrink-0"
                          style={{ backgroundColor: theme.colors.brand[600] }}
                        />
                        <span className="text-sm font-semibold text-ink truncate">{theme.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {/* Accent color options for free themes - Supporter only */}
                        {theme.accentOptions && !isLocked && (
                          <div className="flex items-center gap-1.5">
                            {isSupporter ? (
                              theme.accentOptions.map((accent, idx) => {
                                const isCurrentAccent = currentTheme?.id === theme.id && 
                                  currentTheme?.colors?.accent === accent.color;
                                return (
                                  <button
                                    key={idx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      try {
                                        setTheme(theme.id, accent.color);
                                        toast.success('Tema endret', `"${theme.name}" med ${accent.name.toLowerCase()} aksent`);
                                      } catch (error) {
                                        toast.error('Kunne ikke endre tema', error.message);
                                      }
                                    }}
                                    className={`w-5 h-5 rounded-md border-2 transition-all hover:scale-110 ${
                                      isCurrentAccent
                                        ? 'border-ink shadow-sm scale-110 ring-1 ring-ink/20'
                                        : 'border-sand/60 hover:border-ink/60'
                                    }`}
                                    style={{ backgroundColor: accent.color }}
                                    title={accent.name}
                                  />
                                );
                              })
                            ) : (
                              <div className="flex items-center gap-1 opacity-60" title="Krever Supporter-pakken">
                                <FiLock className="h-3.5 w-3.5 text-ink-subtle" />
                                <span className="text-xs text-ink-subtle">Aksentfarger</span>
                              </div>
                            )}
                          </div>
                        )}
                        {theme.premium && (
                          <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {!isSupporter && (
            <p className="text-xs text-ink-subtle mt-4">
              Låste temaer krever Supporter-pakken. <a href="#" className="text-brand-600 hover:underline">Les mer</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

