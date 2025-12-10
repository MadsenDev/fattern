import { useEffect, useState } from 'react';
import { Modal } from '../Modal';
import { Select } from '../Select';

export function ExpenseCategoryModal({ isOpen, mode = 'create', initialCategory, onSubmit, onClose, categories = [] }) {
  const [name, setName] = useState(initialCategory?.name || '');
  const [parentId, setParentId] = useState(initialCategory?.parent_id?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEdit = mode === 'edit';

  useEffect(() => {
    if (!isOpen) return;
    setName(initialCategory?.name || '');
    setParentId(initialCategory?.parent_id?.toString() || '');
    setError('');
    setSaving(false);
  }, [isOpen, initialCategory, mode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Kategorinavn må fylles ut.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit?.({
        id: initialCategory?.id,
        name: name.trim(),
        parentId: parentId ? parseInt(parentId) : null,
      });
      onClose?.();
    } catch (err) {
      console.error('Kunne ikke lagre kategori', err);
      const errorMessage = err?.message || 'Noe gikk galt under lagring. Prøv igjen.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const title = isEdit ? 'Rediger kategori' : 'Ny kategori';
  const modalDescription = isEdit
    ? 'Oppdater kategorinformasjon.'
    : 'Opprett en ny utgiftskategori. Du kan velge en overordnet kategori for å lage en underkategori.';

  // Build category hierarchy for display
  const buildCategoryOptions = (cats, parentId = null, level = 0, excludeId = null) => {
    const children = cats.filter((c) => {
      const cParentId = c.parent_id;
      if (cParentId === null || cParentId === undefined || cParentId === 0) {
        return parentId === null;
      }
      return cParentId === parentId;
    });

    const options = [];
    children.forEach((cat) => {
      if (cat.id === excludeId) return; // Skip the category being edited
      const indent = '  '.repeat(level);
      const prefix = level > 0 ? '└ ' : '';
      options.push({
        value: cat.id.toString(),
        label: `${indent}${prefix}${cat.name}`,
        level, // Store level for custom rendering if needed
      });
      // Recursively add children
      const childOptions = buildCategoryOptions(cats, cat.id, level + 1, excludeId);
      options.push(...childOptions);
    });
    return options;
  };

  // Filter out the current category and its children from parent options (to prevent circular references)
  const availableParentOptions = buildCategoryOptions(
    categories,
    null,
    0,
    isEdit ? initialCategory?.id : null
  );

  const parentOptions = [
    { value: '', label: 'Ingen overordnet kategori' },
    ...availableParentOptions,
  ];

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
            form="expense-category-form"
            className="rounded-2xl bg-brand-700 px-5 py-2 text-sm font-semibold text-white shadow-card disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Lagrer …' : isEdit ? 'Lagre endringer' : 'Opprett kategori'}
          </button>
        </>
      }
    >
      <form id="expense-category-form" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-ink">Kategorinavn *</label>
          <input
            className="mt-2 w-full rounded-2xl border border-sand bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Eksempel: Reise, Kontor, Mat"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Overordnet kategori</label>
          <Select
            value={parentId}
            onChange={setParentId}
            options={parentOptions}
            placeholder="Velg overordnet kategori (valgfritt)"
          />
          <p className="mt-1 text-xs text-ink-subtle">
            Velg en overordnet kategori for å lage en underkategori
          </p>
        </div>

        {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      </form>
    </Modal>
  );
}

