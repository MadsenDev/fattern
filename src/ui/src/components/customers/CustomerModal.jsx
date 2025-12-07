import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { ImageUpload } from '../ImageUpload';

export function CustomerModal({ isOpen, mode = 'create', initialCustomer, onSubmit, onClose }) {
  const [name, setName] = useState(initialCustomer?.name || '');
  const [contactName, setContactName] = useState(initialCustomer?.contact_name || '');
  const [email, setEmail] = useState(initialCustomer?.email || '');
  const [phone, setPhone] = useState(initialCustomer?.phone || '');
  const [address, setAddress] = useState(initialCustomer?.address || '');
  const [orgNumber, setOrgNumber] = useState(initialCustomer?.org_number || '');
  const [postNumber, setPostNumber] = useState(initialCustomer?.post_number || '');
  const [postLocation, setPostLocation] = useState(initialCustomer?.post_location || '');
  const [vatExempt, setVatExempt] = useState(Boolean(initialCustomer?.vat_exempt));
  const [active, setActive] = useState(initialCustomer?.active !== undefined ? Boolean(initialCustomer.active) : true);
  const [imagePath, setImagePath] = useState(initialCustomer?.image_path || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isOpen) return;
    setName(initialCustomer?.name || '');
    setContactName(initialCustomer?.contact_name || '');
    setEmail(initialCustomer?.email || '');
    setPhone(initialCustomer?.phone || '');
    setAddress(initialCustomer?.address || '');
    setOrgNumber(initialCustomer?.org_number || '');
    setPostNumber(initialCustomer?.post_number || '');
    setPostLocation(initialCustomer?.post_location || '');
    setVatExempt(Boolean(initialCustomer?.vat_exempt));
    setActive(initialCustomer?.active !== undefined ? Boolean(initialCustomer.active) : true);
    setImagePath(initialCustomer?.image_path || '');
    setError('');
    setSaving(false);
  }, [isOpen, initialCustomer, mode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Kundenavn må fylles ut.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit?.({
        id: initialCustomer?.id,
        name: name.trim(),
        contactName: contactName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        orgNumber: orgNumber.trim() || null,
        postNumber: postNumber.trim() || null,
        postLocation: postLocation.trim() || null,
        vatExempt,
        active,
        imagePath: imagePath || null,
      });
      onClose?.();
    } catch (err) {
      console.error('Kunne ikke lagre kunde', err);
      setError('Noe gikk galt under lagring. Prøv igjen.');
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit ? 'Rediger kunde' : 'Ny kunde';
  const modalDescription = isEdit
    ? 'Oppdater kundeinformasjon.'
    : 'Legg til en ny kunde i systemet.';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={modalDescription}
      footer={
        <>
          <button
            type="button"
            className="text-sm font-medium text-ink-subtle hover:text-ink"
            onClick={onClose}
            disabled={saving}
          >
            Avbryt
          </button>
          <button
            type="submit"
            form="customer-form"
            className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Lagrer …' : isEdit ? 'Lagre endringer' : 'Opprett kunde'}
          </button>
        </>
      }
    >
      <form id="customer-form" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-ink">Kundenavn *</label>
          <input
            className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Eksempel: Acme AS"
            required
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">Kontaktperson</label>
            <input
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Navn på kontaktperson"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Organisasjonsnummer</label>
            <input
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={orgNumber}
              onChange={(e) => setOrgNumber(e.target.value)}
              placeholder="123 456 789"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">E-post</label>
            <input
              type="email"
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kunde@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Telefon</label>
            <input
              type="tel"
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+47 123 45 678"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Adresse</label>
          <input
            className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Gateadresse"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-ink">Postnummer</label>
            <input
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={postNumber}
              onChange={(e) => setPostNumber(e.target.value)}
              placeholder="0001"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">Poststed</label>
            <input
              className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={postLocation}
              onChange={(e) => setPostLocation(e.target.value)}
              placeholder="Oslo"
            />
          </div>
        </div>

        <div>
          <ImageUpload value={imagePath} onChange={setImagePath} label="Kundebilde" />
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-sand text-brand-600 focus:ring-brand-500"
              checked={vatExempt}
              onChange={(e) => setVatExempt(e.target.checked)}
            />
            MVA-fritatt
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-sand text-brand-600 focus:ring-brand-500"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Kunden er aktiv
          </label>
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      </form>
    </Modal>
  );
}

