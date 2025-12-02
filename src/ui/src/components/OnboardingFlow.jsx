import { useState } from 'react';

const defaultCompanyValues = {
  name: '',
  org_number: '',
  address: '',
  post_number: '',
  post_location: '',
  contact_email: '',
  contact_number: '',
  account_number: '',
  vat_rate: 0.25
};

function safeElectron() {
  if (typeof window === 'undefined') return null;
  return window.fattern?.db ?? null;
}

function markComplete() {
  if (typeof window === 'undefined') return;
  localStorage.setItem('fattern:onboardingComplete', 'true');
}

export function OnboardingFlow({ initialCompany, onComplete }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => ({
    ...defaultCompanyValues,
    ...initialCompany,
    name:
      !initialCompany || initialCompany.name === 'Default Company' ? '' : initialCompany.name || '',
  }));

  const steps = [
    {
      id: 'intro',
      title: 'Welcome to Fattern',
      description: 'Set up your company profile so invoices are labeled correctly.',
      actionLabel: 'Get started',
    },
    {
      id: 'company',
      title: 'Tell us about your company',
      description: 'This information appears on invoices and inside the app.',
      actionLabel: 'Save and start',
    },
  ];

  const current = steps[stepIndex];

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name: form.name?.trim(),
      org_number: form.org_number?.trim() || null,
      address: form.address?.trim() || null,
      post_number: form.post_number?.trim() || null,
      post_location: form.post_location?.trim() || null,
      contact_email: form.contact_email?.trim() || null,
      contact_number: form.contact_number?.trim() || null,
      account_number: form.account_number?.trim() || null,
      vat_rate: Number.isNaN(Number(form.vat_rate)) ? 0.25 : Number(form.vat_rate)
    };

    if (!payload.name) {
      setError('Company name is required.');
      setSaving(false);
      return;
    }

    try {
      const api = safeElectron();
      let updated = payload;

      if (api?.updateCompany) {
        updated = await api.updateCompany(payload);
      }

      markComplete();
      onComplete?.(updated);
    } catch (err) {
      console.error('Failed to save company', err);
      setError('Something went wrong while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (stepIndex === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm">
        <div className="flex h-full items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-3xl bg-white/95 p-8 shadow-2xl">
            <div className="flex items-center gap-4">
              <img src="/fattern-monogram.svg" alt="Fattern" className="h-12 w-12 drop-shadow-xl" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-ink-subtle">Onboarding</p>
                <h2 className="text-2xl font-semibold text-ink">{current.title}</h2>
              </div>
            </div>
            <p className="mt-6 text-ink-soft">{current.description}</p>
            <div className="mt-10 flex justify-end">
              <button
                className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card"
                onClick={() => setStepIndex(1)}
              >
                {current.actionLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm">
      <div className="flex h-full items-center justify-center px-4">
        <div className="w-full max-w-3xl rounded-3xl bg-white/95 p-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <img src="/fattern-monogram.svg" alt="Fattern" className="h-12 w-12 drop-shadow-xl" />
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-ink-subtle">Onboarding</p>
              <h2 className="text-2xl font-semibold text-ink">{current.title}</h2>
            </div>
          </div>
          <p className="mt-4 text-ink-soft">{current.description}</p>

          <form className="mt-8 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-ink">Company name*</label>
              <input
                className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                placeholder="Acme Studio AS"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Registration number</label>
              <input
                className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm"
                value={form.org_number || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, org_number: e.target.value }))}
                placeholder="999 888 777"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Email</label>
              <input
                className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm"
                value={form.contact_email || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, contact_email: e.target.value }))}
                placeholder="hello@studio.no"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Phone</label>
              <input
                className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm"
                value={form.contact_number || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, contact_number: e.target.value }))}
                placeholder="+47 98 76 54 32"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Bank account</label>
              <input
                className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm"
                value={form.account_number || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, account_number: e.target.value }))}
                placeholder="1234.56.78901"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-ink">Address</label>
              <input
                className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm"
                value={form.address || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                placeholder="Fattern Street 1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Postal code</label>
              <input
                className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm"
                value={form.post_number || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, post_number: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">City</label>
              <input
                className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm"
                value={form.post_location || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, post_location: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">VAT rate</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm"
                value={form.vat_rate}
                onChange={(e) => setForm((prev) => ({ ...prev, vat_rate: e.target.value }))}
              />
              <p className="mt-1 text-xs text-ink-subtle">0.25 equals 25% VAT.</p>
            </div>

            {error ? (
              <p className="md:col-span-2 text-sm font-medium text-rose-600">{error}</p>
            ) : null}

            <div className="md:col-span-2 mt-4 flex items-center justify-between">
              <button
                type="button"
                className="text-sm font-medium text-ink-subtle hover:text-ink"
                onClick={() => {
                  markComplete();
                  onComplete?.(form);
                }}
              >
                Skip
              </button>
              <button
                type="submit"
                className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving…' : current.actionLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}