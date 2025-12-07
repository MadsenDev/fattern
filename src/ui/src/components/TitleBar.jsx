import { useEffect, useState } from 'react';
import { FiMaximize2, FiX, FiMinus, FiSquare, FiTerminal } from 'react-icons/fi';

export function TitleBar({ variant = 'light', title = 'Fattern' }) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Check initial maximized state
    if (window.fattern?.window?.isMaximized) {
      window.fattern.window.isMaximized().then(setIsMaximized);
    }

    // Listen for maximize/unmaximize events
    const handleResize = () => {
      if (window.fattern?.window?.isMaximized) {
        window.fattern.window.isMaximized().then(setIsMaximized);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMinimize = () => {
    if (window.fattern?.window?.minimize) {
      window.fattern.window.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.fattern?.window?.maximize) {
      window.fattern.window.maximize();
    }
  };

  const handleClose = () => {
    if (window.fattern?.window?.close) {
      window.fattern.window.close();
    }
  };

  const handleToggleDevTools = () => {
    if (window.fattern?.window?.toggleDevTools) {
      window.fattern.window.toggleDevTools();
    }
  };

  const isDark = variant === 'dark';

  const baseStyles = isDark
    ? 'bg-brand-900 text-white'
    : 'bg-cloud border-b border-sand/50 text-ink';

  const buttonHoverStyles = isDark
    ? 'hover:bg-white/10'
    : 'hover:bg-sand/50';

  const closeButtonHoverStyles = isDark
    ? 'hover:bg-red-500/20 hover:text-red-300'
    : 'hover:bg-red-50 hover:text-red-600';

  return (
    <div
      className={`flex h-8 items-center justify-between px-2 ${baseStyles} select-none`}
      style={{ WebkitAppRegion: 'drag' }}
    >
      <div className="flex items-center gap-2 px-2">
        <img src="/fattern-monogram.svg" alt="Fattern" className="h-4 w-4" />
        <span className="text-xs font-medium">Fattern</span>
      </div>
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={handleToggleDevTools}
          className={`flex h-6 w-8 items-center justify-center transition-colors ${buttonHoverStyles}`}
          aria-label="Toggle Developer Tools"
          title="Toggle Developer Tools (F12)"
        >
          <FiTerminal className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleMinimize}
          className={`flex h-6 w-8 items-center justify-center transition-colors ${buttonHoverStyles}`}
          aria-label="Minimize"
        >
          <FiMinus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className={`flex h-6 w-8 items-center justify-center transition-colors ${buttonHoverStyles}`}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? (
            <FiSquare className="h-3 w-3" />
          ) : (
            <FiMaximize2 className="h-3 w-3" />
          )}
        </button>
        <button
          onClick={handleClose}
          className={`flex h-6 w-8 items-center justify-center transition-colors ${closeButtonHoverStyles}`}
          aria-label="Close"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

