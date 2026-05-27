import { useState, useEffect } from 'react';
import { IconMail, IconLock, IconCheck, IconAlertCircle, IconRefresh } from '@tabler/icons-react';
import { useToast } from '../../hooks/useToast';

function getEmailApi() {
  return typeof window !== 'undefined' ? window.fattern?.email ?? null : null;
}

export function EmailSettings() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    host: '',
    port: '587',
    secure: false,
    user: '',
    password: '',
  });
  const [hasStoredPassword, setHasStoredPassword] = useState(false);
  const [encryptionAvailable, setEncryptionAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | 'ok' | 'error'
  const [testError, setTestError] = useState('');

  useEffect(() => {
    const api = getEmailApi();
    if (!api) { setLoading(false); return; }
    api.getConfig().then((cfg) => {
      setForm((f) => ({
        ...f,
        host:   cfg.host   || '',
        port:   cfg.port   || '587',
        secure: cfg.secure || false,
        user:   cfg.user   || '',
        password: '',
      }));
      setHasStoredPassword(cfg.hasPassword);
      setEncryptionAvailable(cfg.encryptionAvailable);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setTestStatus(null);
  };

  const handleSave = async () => {
    const api = getEmailApi();
    if (!api) return;
    setSaving(true);
    try {
      await api.saveConfig(form);
      setHasStoredPassword(hasStoredPassword || Boolean(form.password));
      setForm((f) => ({ ...f, password: '' }));
      toast.success('E-postinnstillinger lagret', 'SMTP-konfigurasjon er oppdatert');
    } catch (err) {
      toast.error('Kunne ikke lagre', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    const api = getEmailApi();
    if (!api) return;
    setTesting(true);
    setTestStatus(null);
    setTestError('');
    try {
      await api.testConnection(form);
      setTestStatus('ok');
      toast.success('Tilkobling vellykket', `Tilkoblet ${form.host}:${form.port}`);
    } catch (err) {
      setTestStatus('error');
      setTestError(err.message || 'Tilkobling mislyktes');
      toast.error('Tilkobling mislyktes', err.message);
    } finally {
      setTesting(false);
    }
  };

  const isConfigured = form.host && form.user && (hasStoredPassword || form.password);

  if (loading) {
    return <div className="text-sm py-4" style={{ color: 'var(--f-text-subtle)' }}>Laster...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--f-text)' }}>E-postutsendelse</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--f-text-subtle)' }}>
          Koble til din egen e-postserver for å sende fakturaer direkte som PDF-vedlegg.
        </p>
      </div>

      {!encryptionAvailable && (
        <div
          className="flex items-start gap-2 rounded-xl p-3 text-xs"
          style={{ background: 'var(--f-warn-bg)', border: '1px solid var(--f-warn-border)', color: 'var(--f-warn)' }}
        >
          <IconAlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>Systemet støtter ikke kryptert lagring. Passordet lagres i klartekst.</span>
        </div>
      )}

      <div className="space-y-4 py-3" style={{ borderBottom: '1px solid var(--f-border-faint)' }}>
        <label className="f-label uppercase tracking-wider block">SMTP-server</label>

        {/* Host + Port */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs mb-1" style={{ color: 'var(--f-text-subtle)' }}>Server</label>
            <input
              className="f-input w-full text-sm rounded-lg px-3 py-2"
              placeholder="smtp.gmail.com"
              value={form.host}
              onChange={(e) => handleChange('host', e.target.value)}
              style={{ color: 'var(--f-text-body)' }}
            />
          </div>
          <div style={{ width: 100 }}>
            <label className="block text-xs mb-1" style={{ color: 'var(--f-text-subtle)' }}>Port</label>
            <input
              className="f-input w-full text-sm rounded-lg px-3 py-2"
              placeholder="587"
              value={form.port}
              onChange={(e) => handleChange('port', e.target.value)}
              style={{ color: 'var(--f-text-body)' }}
            />
          </div>
        </div>

        {/* SSL toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleChange('secure', !form.secure)}
            className="relative flex-shrink-0 rounded-full transition-colors"
            style={{
              width: 36, height: 20,
              background: form.secure ? 'var(--f-green)' : 'var(--f-border)',
            }}
          >
            <span
              className="absolute rounded-full bg-white transition-transform"
              style={{
                width: 14, height: 14,
                top: 3,
                left: form.secure ? 19 : 3,
              }}
            />
          </button>
          <span className="text-sm" style={{ color: 'var(--f-text-body)' }}>SSL/TLS (port 465)</span>
        </div>

        {/* User + Password */}
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--f-text-subtle)' }}>Brukernavn / e-postadresse</label>
          <input
            className="f-input w-full text-sm rounded-lg px-3 py-2"
            type="email"
            placeholder="deg@eksempel.no"
            value={form.user}
            onChange={(e) => handleChange('user', e.target.value)}
            style={{ color: 'var(--f-text-body)' }}
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--f-text-subtle)' }}>
            Passord
            {hasStoredPassword && !form.password && (
              <span className="ml-2 opacity-60">(lagret — la stå tom for å beholde)</span>
            )}
          </label>
          <div className="relative">
            <IconLock
              className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
              style={{ color: 'var(--f-text-muted)' }}
            />
            <input
              className="f-input w-full text-sm rounded-lg pl-9 pr-3 py-2"
              type="password"
              placeholder={hasStoredPassword ? '••••••••' : 'Passord eller app-passord'}
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              style={{ color: 'var(--f-text-body)' }}
              autoComplete="current-password"
            />
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--f-text-subtle)' }}>
            Tips: Gmail krever et <a
              href="#"
              onClick={(e) => { e.preventDefault(); if (typeof window !== 'undefined') window.fattern ? require('electron')?.shell?.openExternal('https://support.google.com/accounts/answer/185833') : window.open('https://support.google.com/accounts/answer/185833'); }}
              className="underline hover:opacity-80"
              style={{ color: 'var(--f-green-text-dim)' }}
            >app-passord</a> hvis totrinnsverifisering er aktivert.
          </p>
        </div>
      </div>

      {/* Test status banner */}
      {testStatus && (
        <div
          className="flex items-center gap-2 rounded-xl p-3 text-xs"
          style={{
            background: testStatus === 'ok' ? 'var(--f-green-bg)' : 'var(--f-danger-bg)',
            border: `1px solid ${testStatus === 'ok' ? 'var(--f-border-green)' : 'var(--f-danger-border)'}`,
            color: testStatus === 'ok' ? 'var(--f-green-text)' : 'var(--f-danger)',
          }}
        >
          {testStatus === 'ok'
            ? <IconCheck className="h-4 w-4 flex-shrink-0" />
            : <IconAlertCircle className="h-4 w-4 flex-shrink-0" />
          }
          {testStatus === 'ok' ? 'Tilkobling vellykket!' : testError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={handleTest}
          disabled={testing || !form.host || !form.user}
          className="flex items-center gap-2 text-sm font-medium rounded-xl px-4 py-2 transition-all disabled:opacity-40"
          style={{
            background: 'var(--f-btn-ghost-bg)',
            border: '1px solid var(--f-border)',
            color: 'var(--f-text-body)',
          }}
          onMouseEnter={e => { if (!testing) e.currentTarget.style.background = 'var(--f-btn-ghost-hover)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--f-btn-ghost-bg)'}
        >
          <IconRefresh className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
          Test tilkobling
        </button>

        <button
          onClick={handleSave}
          disabled={saving || (!form.host && !form.user)}
          className="flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2 transition-all disabled:opacity-40"
          style={{
            background: isConfigured ? 'var(--f-green)' : 'var(--f-surface)',
            border: `1px solid ${isConfigured ? 'var(--f-border-green)' : 'var(--f-border)'}`,
            color: isConfigured ? '#fff' : 'var(--f-text-subtle)',
          }}
        >
          <IconMail className="h-4 w-4" />
          {saving ? 'Lagrer...' : 'Lagre innstillinger'}
        </button>
      </div>

      {/* Quick-reference presets */}
      <div className="pt-2">
        <label className="f-label uppercase tracking-wider block mb-3">Vanlige leverandører</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { name: 'Gmail',    host: 'smtp.gmail.com',    port: '587' },
            { name: 'Outlook',  host: 'smtp.office365.com', port: '587' },
            { name: 'Yahoo',    host: 'smtp.mail.yahoo.com', port: '587' },
            { name: 'iCloud',   host: 'smtp.mail.me.com',  port: '587' },
            { name: 'Telenor',  host: 'smtp.online.no',    port: '587' },
            { name: 'Epost.no', host: 'smtp.epost.no',     port: '587' },
          ].map(({ name, host, port }) => (
            <button
              key={name}
              type="button"
              onClick={() => { handleChange('host', host); handleChange('port', port); }}
              className="text-xs rounded-lg px-3 py-2 text-left transition-all"
              style={{
                background: form.host === host ? 'var(--f-green-bg)' : 'var(--f-btn-ghost-bg)',
                border: `1px solid ${form.host === host ? 'var(--f-border-green)' : 'var(--f-border)'}`,
                color: form.host === host ? 'var(--f-green-text)' : 'var(--f-text-soft)',
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
