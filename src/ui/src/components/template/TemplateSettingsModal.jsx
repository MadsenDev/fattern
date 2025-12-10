import { useState, useEffect } from 'react';
import { FiX, FiSave, FiTag, FiUser, FiLink, FiInfo, FiFileText } from 'react-icons/fi';
import { Modal } from '../Modal';

export function TemplateSettingsModal({ isOpen, onClose, template, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    author: '',
    authorUrl: '',
    version: '',
    tags: [],
    license: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (template && template.meta) {
      setFormData({
        name: template.meta.name || '',
        description: template.meta.description || '',
        author: template.meta.author || '',
        authorUrl: template.meta.authorUrl || '',
        version: template.meta.version || '1.0.0',
        tags: template.meta.tags || [],
        license: template.meta.license || '',
      });
    }
  }, [template, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!template || !template.meta) return;

    // Update template metadata
    const updatedTemplate = {
      ...template,
      meta: {
        ...template.meta,
        ...formData,
        // Ensure required fields
        id: template.meta.id,
        updatedAt: new Date().toISOString(),
      },
    };

    onSave(updatedTemplate);
    onClose();
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !formData.tags.includes(trimmed)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, trimmed],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen || !template) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mal innstillinger"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <FiFileText className="h-4 w-4" />
            Grunnleggende informasjon
          </h3>

          <div>
            <label className="block text-xs font-medium text-ink-subtle mb-1.5">
              Navn *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-sand/60 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-subtle mb-1.5">
              Beskrivelse
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-sand/60 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
              placeholder="Beskrivelse av malen..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-subtle mb-1.5">
              Versjon *
            </label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              className="w-full rounded-lg border border-sand/60 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200 font-mono"
              placeholder="1.0.0"
              required
              pattern="^\d+\.\d+\.\d+(-.+)?$"
              title="Versjon må følge SemVer format (f.eks. 1.0.0)"
            />
            <p className="text-xs text-ink-subtle mt-1">SemVer format (f.eks. 1.0.0)</p>
          </div>
        </div>

        {/* Author Information */}
        <div className="space-y-4 pt-4 border-t border-sand/40">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <FiUser className="h-4 w-4" />
            Forfatter informasjon
          </h3>

          <div>
            <label className="block text-xs font-medium text-ink-subtle mb-1.5">
              Forfatter
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full rounded-lg border border-sand/60 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Navn på forfatter eller selskap"
            />
            <p className="text-xs text-ink-subtle mt-1">Brukes når malen eksporteres</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-subtle mb-1.5 flex items-center gap-1">
              <FiLink className="h-3 w-3" />
              Forfatter URL
            </label>
            <input
              type="url"
              value={formData.authorUrl}
              onChange={(e) => setFormData({ ...formData, authorUrl: e.target.value })}
              className="w-full rounded-lg border border-sand/60 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-4 pt-4 border-t border-sand/40">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
            <FiTag className="h-4 w-4" />
            Tagger
          </h3>

          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 rounded-lg border border-sand/60 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="Legg til tag (trykk Enter)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100 transition"
              >
                Legg til
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-brand-900 transition"
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* License */}
        <div className="pt-4 border-t border-sand/40">
          <h3 className="text-sm font-semibold text-ink flex items-center gap-2 mb-4">
            <FiInfo className="h-4 w-4" />
            Lisens
          </h3>

          <div>
            <label className="block text-xs font-medium text-ink-subtle mb-1.5">
              Lisens type
            </label>
            <input
              type="text"
              value={formData.license}
              onChange={(e) => setFormData({ ...formData, license: e.target.value })}
              className="w-full rounded-lg border border-sand/60 bg-white px-3 py-2 text-sm text-ink shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="f.eks. commercial-use, MIT, CC-BY"
            />
            <p className="text-xs text-ink-subtle mt-1">Valgfritt. Angir lisens for malen.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-sand/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-sand/60 bg-white px-4 py-2 text-sm font-medium text-ink-soft hover:bg-cloud transition"
          >
            Avbryt
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 transition flex items-center gap-2"
          >
            <FiSave className="h-4 w-4" />
            Lagre innstillinger
          </button>
        </div>
      </form>
    </Modal>
  );
}

