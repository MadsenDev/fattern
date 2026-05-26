import { useState, useRef } from 'react';
import { IconTrash, IconAlertTriangle } from '@tabler/icons-react';
import { useToast } from '../../hooks/useToast';

const CONFIRM_PHRASE = 'SLETT ALT';

function WipeConfirmModal({ onConfirm, onCancel }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const matches = input === CONFIRM_PHRASE;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          width: 440,
          background: 'var(--f-surface-card)',
          border: '1px solid rgba(240,80,70,0.35)',
          borderRadius: 16,
          padding: '28px 28px 24px',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.4), 0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'rgba(240,80,70,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <IconAlertTriangle size={20} style={{ color: '#f05046' }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--f-text-body)' }}>
              Slett all data
            </div>
            <div style={{ fontSize: 12, color: 'var(--f-text-subtle)', marginTop: 1 }}>
              Denne handlingen kan ikke angres
            </div>
          </div>
        </div>

        {/* Warning text */}
        <p style={{ fontSize: 13, color: 'var(--f-text-soft)', lineHeight: 1.6, marginBottom: 20 }}>
          Dette vil permanent slette <strong style={{ color: 'var(--f-text-body)' }}>alle fakturaer, kunder, produkter,
          utgifter, budsjettår og selskapsdata</strong>. Appen starter som ny. Det finnes ingen angre-funksjon.
        </p>

        {/* Typed confirmation */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: 'var(--f-text-subtle)', display: 'block', marginBottom: 6 }}>
            Skriv <strong style={{ color: 'var(--f-text-body)', letterSpacing: '0.04em' }}>{CONFIRM_PHRASE}</strong> for å bekrefte:
          </label>
          <input
            ref={inputRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && matches) onConfirm(); if (e.key === 'Escape') onCancel(); }}
            placeholder={CONFIRM_PHRASE}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              letterSpacing: '0.05em',
              background: 'var(--f-surface-input, rgba(255,255,255,0.06))',
              border: `1px solid ${matches ? 'rgba(240,80,70,0.6)' : 'var(--f-border-subtle)'}`,
              color: matches ? '#f07060' : 'var(--f-text-body)',
              outline: 'none',
              transition: 'border-color 0.15s, color 0.15s',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
              background: 'none', border: '1px solid var(--f-border-subtle)',
              color: 'var(--f-text-soft)', cursor: 'pointer',
            }}
          >
            Avbryt
          </button>
          <button
            onClick={onConfirm}
            disabled={!matches}
            style={{
              padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: matches ? 'rgba(240,80,70,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${matches ? 'rgba(240,80,70,0.5)' : 'var(--f-border-faint)'}`,
              color: matches ? '#f07060' : 'var(--f-text-subtle)',
              cursor: matches ? 'pointer' : 'not-allowed',
              transition: 'all 0.15s',
            }}
          >
            Slett all data
          </button>
        </div>
      </div>
    </div>
  );
}

export function GeneralSettings({ onRefreshData }) {
  const { toast } = useToast();
  const [showFirstConfirm, setShowFirstConfirm] = useState(false);
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);
  const [wiping, setWiping] = useState(false);

  const handleWipe = async () => {
    setShowSecondConfirm(false);
    setWiping(true);
    try {
      await window.fattern.app.wipeAllData();
      toast.success('All data er slettet', 'Appen er nå tilbakestilt til fabrikktilstand');
      onRefreshData?.();
    } catch (err) {
      toast.error('Sletting feilet', err.message);
    } finally {
      setWiping(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--f-text-body)' }}>Generelle innstillinger</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--f-text-subtle)' }}>Generelle app-innstillinger og preferanser</p>
        </div>

        <div className="space-y-4">
          <div className="py-3" style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--f-text-subtle)' }}>Kommer snart</label>
            <p className="text-sm mt-1.5" style={{ color: 'var(--f-text-soft)' }}>Flere generelle innstillinger vil bli lagt til her</p>
          </div>
        </div>

        {/* ── Danger zone ─────────────────────────────────────────────────── */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(240,80,70,0.2)' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,80,70,0.55)', flexShrink: 0 }}>
              Faresone
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(240,80,70,0.2)' }} />
          </div>

          <div
            style={{
              borderRadius: 12,
              border: '1px solid rgba(240,80,70,0.2)',
              background: 'rgba(240,80,70,0.04)',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--f-text-body)', marginBottom: 3 }}>
                Slett all data
              </div>
              <div style={{ fontSize: 12, color: 'var(--f-text-subtle)', lineHeight: 1.5 }}>
                Fjerner alle fakturaer, kunder, utgifter og innstillinger permanent.
              </div>
            </div>
            <button
              onClick={() => setShowFirstConfirm(true)}
              disabled={wiping}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 14px', borderRadius: 8,
                fontSize: 12, fontWeight: 600, flexShrink: 0,
                background: 'rgba(240,80,70,0.08)',
                border: '1px solid rgba(240,80,70,0.3)',
                color: '#f07060',
                cursor: wiping ? 'not-allowed' : 'pointer',
                opacity: wiping ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,80,70,0.15)'; e.currentTarget.style.borderColor = 'rgba(240,80,70,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,80,70,0.08)'; e.currentTarget.style.borderColor = 'rgba(240,80,70,0.3)'; }}
            >
              <IconTrash size={13} />
              {wiping ? 'Sletter…' : 'Tilbakestill app'}
            </button>
          </div>
        </div>
      </div>

      {/* First confirmation popover */}
      {showFirstConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowFirstConfirm(false); }}
        >
          <div
            style={{
              background: 'var(--f-surface-card)',
              border: '1px solid rgba(240,80,70,0.25)',
              borderRadius: 14,
              padding: '22px 24px 20px',
              width: 340,
              boxShadow: '0 16px 48px rgba(0,0,0,0.45)',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--f-text-body)', marginBottom: 8 }}>
              Er du sikker?
            </div>
            <p style={{ fontSize: 12, color: 'var(--f-text-soft)', lineHeight: 1.6, marginBottom: 18 }}>
              Du er i ferd med å slette <em>all</em> data i Fattern. Dette inkluderer alle fakturaer, kunder, produkter og utgifter.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowFirstConfirm(false)}
                style={{
                  padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 500,
                  background: 'none', border: '1px solid var(--f-border-subtle)',
                  color: 'var(--f-text-soft)', cursor: 'pointer',
                }}
              >
                Avbryt
              </button>
              <button
                onClick={() => { setShowFirstConfirm(false); setShowSecondConfirm(true); }}
                style={{
                  padding: '7px 14px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  background: 'rgba(240,80,70,0.12)',
                  border: '1px solid rgba(240,80,70,0.4)',
                  color: '#f07060', cursor: 'pointer',
                }}
              >
                Ja, fortsett
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second confirmation — typed phrase */}
      {showSecondConfirm && (
        <WipeConfirmModal
          onConfirm={handleWipe}
          onCancel={() => setShowSecondConfirm(false)}
        />
      )}
    </>
  );
}
