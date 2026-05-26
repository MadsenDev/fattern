import { useEffect, useState } from 'react';
import { IconTerminal2 } from '@tabler/icons-react';

export function TitleBar({ title = 'Fattern' }) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.fattern?.window?.isMaximized) {
      window.fattern.window.isMaximized().then(setIsMaximized);
    }
    const handleResize = () => {
      if (window.fattern?.window?.isMaximized) {
        window.fattern.window.isMaximized().then(setIsMaximized);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMinimize = () => window.fattern?.window?.minimize?.();
  const handleMaximize = () => window.fattern?.window?.maximize?.();
  const handleClose    = () => window.fattern?.window?.close?.();
  const handleDevTools = () => window.fattern?.window?.toggleDevTools?.();

  return (
    <div
      style={{
        height: 'var(--f-topbar-h)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        flexShrink: 0,
        background: 'var(--f-surface-topbar)',
        backdropFilter: 'blur(30px)',
        borderBottom: '1px solid var(--f-border-top)',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        zIndex: 100,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div
          style={{
            width: 22, height: 22, borderRadius: 6,
            background: 'linear-gradient(135deg, rgba(45,180,130,0.9), rgba(30,140,100,0.7))',
            border: '1px solid rgba(80,220,160,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px rgba(45,180,130,0.3)',
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>F</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--f-text)', letterSpacing: '-0.01em' }}>
          {title}
        </span>
      </div>

      {/* Window controls — no-drag zone */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 6, WebkitAppRegion: 'no-drag' }}
      >
        {/* Dev tools — subtle icon button */}
        <button
          onClick={handleDevTools}
          title="Utviklerverktøy (F12)"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--f-text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: 5,
            transition: 'color 0.12s',
            marginRight: 4,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--f-text-subtle)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--f-text-muted)')}
        >
          <IconTerminal2 size={13} stroke={1.6} />
        </button>

        {/* macOS-style traffic lights */}
        {[
          { color: '#f0c060', label: 'Minimiser', action: handleMinimize },
          { color: '#70c87a', label: isMaximized ? 'Gjenopprett' : 'Maksimer', action: handleMaximize },
          { color: '#f07060', label: 'Lukk', action: handleClose },
        ].map(({ color, label, action }) => (
          <button
            key={label}
            onClick={action}
            aria-label={label}
            style={{
              width: 12, height: 12, borderRadius: '50%',
              background: color,
              border: 'none', cursor: 'pointer', padding: 0,
              boxShadow: `0 0 0 0.5px rgba(0,0,0,0.25)`,
              transition: 'filter 0.1s',
            }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
            onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
          />
        ))}
      </div>
    </div>
  );
}
