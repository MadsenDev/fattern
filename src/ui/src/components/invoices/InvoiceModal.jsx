import { useEffect, useState, useMemo } from 'react';
import { QuantityInput } from '../QuantityInput';
import { Select } from '../Select';
import { Checkbox } from '../Checkbox';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';
import { FiPlus, FiTrash2, FiCheck, FiCheckCircle, FiSend, FiFileText, FiAlertCircle, FiX } from 'react-icons/fi';

// Auto-format date input to dd.mm.yyyy
function formatDateInput(value) {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4, 8)}`;
}

// Convert dd.mm.yyyy to yyyy-mm-dd
function parseDateInput(value) {
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  let [day, month, year] = parts;
  if (!day || !month || !year) return null;
  
  // Handle 2-digit years: convert to 4-digit
  if (year.length === 2) {
    const yearNum = parseInt(year, 10);
    // If year is <= 50, assume 20xx (e.g., 25 -> 2025)
    // If year is > 50, assume 19xx (e.g., 89 -> 1989)
    if (yearNum <= 50) {
      year = `20${year.padStart(2, '0')}`;
    } else {
      year = `19${year.padStart(2, '0')}`;
    }
  }
  
  // Validate year is reasonable (1900-2100)
  const yearNum = parseInt(year, 10);
  if (yearNum < 1900 || yearNum > 2100) {
    console.warn('Invalid year:', yearNum, 'from input:', value);
    return null;
  }
  
  const result = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  console.log('Parsed date:', value, '->', result);
  return result;
}

export function InvoiceModal({ isOpen, mode = 'create', initialInvoice, onSubmit, onClose, customers = [], products = [] }) {
  const [customerId, setCustomerId] = useState(initialInvoice?.customer_id || '');
  const [invoiceDate, setInvoiceDate] = useState(
    initialInvoice?.invoice_date ? formatDate(initialInvoice.invoice_date) : ''
  );
  const [dueDate, setDueDate] = useState(
    initialInvoice?.due_date ? formatDate(initialInvoice.due_date) : ''
  );
  const [status, setStatus] = useState(initialInvoice?.status || 'draft');
  const [notes, setNotes] = useState(initialInvoice?.notes || '');
  const [yourReference, setYourReference] = useState(initialInvoice?.your_reference || '');
  const [ourReference, setOurReference] = useState(initialInvoice?.our_reference || '');
  const [startDate, setStartDate] = useState(
    initialInvoice?.start_date ? formatDate(initialInvoice.start_date) : ''
  );
  const [endDate, setEndDate] = useState(
    initialInvoice?.end_date ? formatDate(initialInvoice.end_date) : ''
  );
  const [deliveryReference, setDeliveryReference] = useState(initialInvoice?.delivery_reference || '');
  const [reference, setReference] = useState(initialInvoice?.reference || '');
  const [credited, setCredited] = useState(initialInvoice?.credited === 1 || initialInvoice?.credited === true);
  const [items, setItems] = useState(
    initialInvoice?.items?.map((item) => ({
      id: item.id || `temp-${Math.random()}`,
      productId: item.productId || '',
      description: item.description || '',
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || item.unit_price || 0,
      vatRate: item.vatRate != null ? item.vatRate : item.vat_rate != null ? item.vat_rate : 0.25,
    })) || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isOpen) return;
    setCustomerId(initialInvoice?.customer_id || '');
    setInvoiceDate(initialInvoice?.invoice_date ? formatDate(initialInvoice.invoice_date) : '');
    setDueDate(initialInvoice?.due_date ? formatDate(initialInvoice.due_date) : '');
    setStatus(initialInvoice?.status || 'draft');
    setNotes(initialInvoice?.notes || '');
    setYourReference(initialInvoice?.your_reference || '');
    setOurReference(initialInvoice?.our_reference || '');
    setStartDate(initialInvoice?.start_date ? formatDate(initialInvoice.start_date) : '');
    setEndDate(initialInvoice?.end_date ? formatDate(initialInvoice.end_date) : '');
    setDeliveryReference(initialInvoice?.delivery_reference || '');
    setReference(initialInvoice?.reference || '');
    setCredited(initialInvoice?.credited === 1 || initialInvoice?.credited === true);
    setItems(
      initialInvoice?.items?.length
        ? initialInvoice.items.map((item) => ({
            id: item.id || `temp-${Math.random()}`,
            productId: item.productId || '',
            description: item.description || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || item.unit_price || 0,
            vatRate: item.vatRate != null ? item.vatRate : item.vat_rate != null ? item.vat_rate : 0.25,
          }))
        : []
    );
    setError('');
    setSaving(false);
  }, [isOpen, initialInvoice, mode]);

  const activeProducts = useMemo(
    () => products.filter((p) => p.active !== 0),
    [products]
  );

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === parseInt(customerId)),
    [customers, customerId]
  );

  const calculations = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice * item.vatRate, 0);
    const total = subtotal + vatTotal;
    return { subtotal, vatTotal, total };
  }, [items]);

  const handleSelectCustomer = (customer) => {
    setCustomerId(customer.id.toString());
  };

  const handleAddProduct = (product) => {
    setItems([
      ...items,
      {
        id: `temp-${Math.random()}`,
        productId: product.id,
        description: product.name,
        quantity: 1,
        unitPrice: product.unit_price || 0,
        vatRate: product.vat_rate != null ? product.vat_rate : 0.25,
      },
    ]);
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const handleItemChange = (itemId, field, value) => {
    setItems(
      items.map((item) => {
        if (item.id !== itemId) return item;
        return { ...item, [field]: value };
      })
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!customerId) {
      setError('Kunde må velges.');
      return;
    }

    if (!invoiceDate || !parseDateInput(invoiceDate)) {
      setError('Fakturadato må fylles ut (dd.mm.yyyy).');
      return;
    }

    if (!dueDate || !parseDateInput(dueDate)) {
      setError('Forfallsdato må fylles ut (dd.mm.yyyy).');
      return;
    }

    const validItems = items.filter((item) => item.description.trim() && item.quantity > 0 && item.unitPrice > 0);
    if (validItems.length === 0) {
      setError('Faktura må ha minst én gyldig linje med beskrivelse, antall og pris.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId: parseInt(customerId),
        invoiceDate: parseDateInput(invoiceDate),
        dueDate: parseDateInput(dueDate),
        status,
        notes: notes.trim() || null,
        yourReference: yourReference.trim() || null,
        ourReference: ourReference.trim() || null,
        startDate: startDate && parseDateInput(startDate) ? parseDateInput(startDate) : null,
        endDate: endDate && parseDateInput(endDate) ? parseDateInput(endDate) : null,
        deliveryReference: deliveryReference.trim() || null,
        reference: reference.trim() || null,
        credited: credited,
        items: validItems.map((item) => ({
          productId: item.productId ? parseInt(item.productId) : null,
          description: item.description.trim(),
          quantity: parseFloat(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          vatRate: parseFloat(item.vatRate),
        })),
      };
      
      // Include ID only for edit mode
      if (isEdit && initialInvoice?.id) {
        payload.id = initialInvoice.id;
      }
      
      await onSubmit?.(payload);
      // Only close if submission was successful
      onClose?.();
    } catch (err) {
      console.error('Kunne ikke lagre faktura', err);
      const errorMessage = err?.message || 'Noe gikk galt under lagring. Prøv igjen.';
      setError(errorMessage);
      setSaving(false);
      // Don't close modal on error
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/70 backdrop-blur-sm px-4 py-8">
      <div className="relative flex h-full max-h-[90vh] w-full max-w-7xl rounded-3xl border border-sand/70 bg-white/95 shadow-2xl overflow-hidden">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full border border-sand/60 bg-white/80 px-2 py-0.5 text-xs font-medium text-ink-subtle hover:text-ink"
        >
          Lukk
        </button>

        <div className="flex h-full w-full">
          {/* Left Panel: Customers */}
          <div className="w-80 border-r border-sand/60 bg-cloud/30 flex flex-col">
            <div className="border-b border-sand/60 bg-white p-4">
              <h3 className="text-sm font-semibold text-ink">Velg kunde</h3>
              <p className="mt-1 text-xs text-ink-soft">Klikk på en kunde for å velge</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {customers.length === 0 ? (
                <div className="py-8 text-center text-sm text-ink-subtle">Ingen kunder tilgjengelig</div>
              ) : (
                customers.map((customer) => {
                  const isSelected = customerId === customer.id.toString();
                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => handleSelectCustomer(customer)}
                      className={`w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50 shadow-sm'
                          : 'border-sand/60 bg-white hover:border-brand-300 hover:bg-brand-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {customer.image_path ? (
                          <img
                            src={customer.image_path}
                            alt={customer.name}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-200 text-sm font-semibold text-brand-700">
                            {customer.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-ink truncate">{customer.name}</div>
                          {customer.contact_name && (
                            <div className="text-xs text-ink-subtle truncate">{customer.contact_name}</div>
                          )}
                        </div>
                        {isSelected && (
                          <FiCheck className="h-5 w-5 flex-shrink-0 text-brand-700" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Middle Panel: Invoice Form */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b border-sand/60 bg-white p-6">
              <h2 className="text-lg font-semibold text-ink">{isEdit ? 'Rediger faktura' : 'Ny faktura'}</h2>
              <p className="mt-1 text-sm text-ink-soft">{isEdit ? 'Oppdater fakturainformasjon' : 'Opprett en ny faktura'}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form id="invoice-form" onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {selectedCustomer && (
                  <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
                    <div className="flex items-center gap-3">
                      {selectedCustomer.image_path ? (
                        <img
                          src={selectedCustomer.image_path}
                          alt={selectedCustomer.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-200 text-lg font-semibold text-brand-700">
                          {selectedCustomer.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-ink">{selectedCustomer.name}</div>
                        {selectedCustomer.email && (
                          <div className="text-sm text-ink-soft">{selectedCustomer.email}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-ink">Fakturadato *</label>
                    <input
                      type="text"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(formatDateInput(e.target.value))}
                      placeholder="dd.mm.yyyy"
                      inputMode="numeric"
                      className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink">Forfallsdato *</label>
                    <input
                      type="text"
                      value={dueDate}
                      onChange={(e) => setDueDate(formatDateInput(e.target.value))}
                      placeholder="dd.mm.yyyy"
                      inputMode="numeric"
                      className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink">Startdato</label>
                    <input
                      type="text"
                      value={startDate}
                      onChange={(e) => setStartDate(formatDateInput(e.target.value))}
                      placeholder="dd.mm.yyyy"
                      inputMode="numeric"
                      className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink">Sluttdato</label>
                    <input
                      type="text"
                      value={endDate}
                      onChange={(e) => setEndDate(formatDateInput(e.target.value))}
                      placeholder="dd.mm.yyyy"
                      inputMode="numeric"
                      className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink">Status</label>
                    <Select
                      value={status}
                      onChange={setStatus}
                      options={[
                        { value: 'draft', label: 'Kladd', icon: <FiFileText className="h-4 w-4" /> },
                        { value: 'sent', label: 'Sendt', icon: <FiSend className="h-4 w-4" /> },
                        { value: 'paid', label: 'Betalt', icon: <FiCheckCircle className="h-4 w-4" /> },
                        { value: 'overdue', label: 'Forfalt', icon: <FiAlertCircle className="h-4 w-4" /> },
                        { value: 'cancelled', label: 'Kansellert', icon: <FiX className="h-4 w-4" /> },
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-ink">Deres referanse</label>
                    <input
                      type="text"
                      value={yourReference}
                      onChange={(e) => setYourReference(e.target.value)}
                      placeholder="Deres referanse"
                      className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink">Vår referanse</label>
                    <input
                      type="text"
                      value={ourReference}
                      onChange={(e) => setOurReference(e.target.value)}
                      placeholder="Vår referanse"
                      className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink">Leveringsreferanse</label>
                    <input
                      type="text"
                      value={deliveryReference}
                      onChange={(e) => setDeliveryReference(e.target.value)}
                      placeholder="Leveringsreferanse"
                      className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink">Referanse</label>
                    <input
                      type="text"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Referanse"
                      className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                    />
                  </div>
                </div>

                <div>
                  <Checkbox
                    checked={credited}
                    onChange={setCredited}
                    label="Kreditert"
                  />
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className="block text-sm font-medium text-ink">Linjeelementer *</label>
                  </div>

                  {items.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-sand/60 bg-cloud/30 p-8 text-center">
                      <p className="text-sm text-ink-subtle">Klikk på produkter til høyre for å legge dem til</p>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-sand/60 bg-white overflow-hidden">
                      {/* Table Header */}
                      <div className="grid grid-cols-[1fr_80px_96px_64px_96px_40px] gap-2 bg-cloud/50 px-3 py-2 border-b border-sand/60">
                        <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide">Beskrivelse</div>
                        <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide text-center">Antall</div>
                        <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide text-right">Pris</div>
                        <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide text-center">MVA %</div>
                        <div className="text-xs font-semibold text-ink-soft uppercase tracking-wide text-right">Total</div>
                        <div></div>
                      </div>

                      {/* Table Rows */}
                      <div className="divide-y divide-sand/60">
                        {items.map((item) => (
                          <div key={item.id} className="grid grid-cols-[1fr_80px_96px_64px_96px_40px] gap-2 px-3 py-2 hover:bg-cloud/30 transition">
                            <div className="flex items-center min-w-0">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                placeholder="Beskrivelse *"
                                className="w-full rounded-lg border border-sand bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                              />
                            </div>
                            <div className="flex items-center">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border border-sand bg-white px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-200"
                              />
                            </div>
                            <div className="flex items-center">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={item.unitPrice}
                                onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                className="w-full rounded-lg border border-sand bg-white px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-200"
                              />
                            </div>
                            <div className="flex items-center">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={(item.vatRate * 100).toFixed(0)}
                                onChange={(e) => handleItemChange(item.id, 'vatRate', (parseFloat(e.target.value) || 0) / 100)}
                                className="w-full rounded-lg border border-sand bg-white px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-200"
                              />
                            </div>
                            <div className="flex items-center justify-end">
                              <div className="text-sm font-medium text-ink">
                                {formatCurrency(item.quantity * item.unitPrice * (1 + item.vatRate))}
                              </div>
                            </div>
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="rounded-lg p-1.5 text-ink-subtle hover:bg-red-50 hover:text-red-600 transition"
                                aria-label="Fjern linje"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-sand/60 bg-cloud/30 p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-ink-soft">
                      <span>Delsum:</span>
                      <span className="font-medium text-ink">{formatCurrency(calculations.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-ink-soft">
                      <span>MVA:</span>
                      <span className="font-medium text-ink">{formatCurrency(calculations.vatTotal)}</span>
                    </div>
                    <div className="flex justify-between border-t border-sand/60 pt-2 text-base font-semibold text-ink">
                      <span>Total:</span>
                      <span>{formatCurrency(calculations.total)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink">Notater</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Valgfrie notater..."
                    className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                  />
                </div>
              </form>
            </div>

            <div className="border-t border-sand/60 bg-white p-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-sand bg-white px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cloud"
              >
                Avbryt
              </button>
              <button
                type="submit"
                form="invoice-form"
                disabled={saving}
                className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-800 disabled:opacity-50"
              >
                {saving ? 'Lagrer...' : isEdit ? 'Oppdater' : 'Opprett'}
              </button>
            </div>
          </div>

          {/* Right Panel: Products */}
          <div className="w-80 border-l border-sand/60 bg-cloud/30 flex flex-col">
            <div className="border-b border-sand/60 bg-white p-4">
              <h3 className="text-sm font-semibold text-ink">Produkter</h3>
              <p className="mt-1 text-xs text-ink-soft">Klikk for å legge til</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {activeProducts.length === 0 ? (
                <div className="py-8 text-center text-sm text-ink-subtle">Ingen produkter tilgjengelig</div>
              ) : (
                activeProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleAddProduct(product)}
                    className="w-full rounded-xl border border-sand/60 bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      {product.image_path ? (
                        <img
                          src={product.image_path}
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100">
                          <svg className="h-6 w-6 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-ink truncate">{product.name}</div>
                        <div className="mt-0.5 text-xs font-semibold text-brand-700">
                          {formatCurrency(product.unit_price || 0)}
                          {product.unit && <span className="text-ink-subtle font-normal"> / {product.unit}</span>}
                        </div>
                        {product.sku && (
                          <div className="mt-0.5 text-xs text-ink-subtle">SKU: {product.sku}</div>
                        )}
                      </div>
                      <FiPlus className="h-4 w-4 flex-shrink-0 text-ink-subtle mt-1" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
