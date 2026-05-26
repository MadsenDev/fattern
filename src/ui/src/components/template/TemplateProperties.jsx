import { useState, useEffect } from 'react';
import { Select } from '../Select';
import { ImageUpload } from '../ImageUpload';
import { IconStack, IconTypography, IconPhoto, IconTable, IconSettings } from '@tabler/icons-react';

const FIELD_BINDINGS = [
  { value: 'invoice.invoice_number', label: 'Fakturanummer' },
  { value: 'invoice.invoice_date', label: 'Fakturadato' },
  { value: 'invoice.due_date', label: 'Forfallsdato' },
  { value: 'invoice.status', label: 'Status' },
  { value: 'invoice.total', label: 'Total' },
  { value: 'invoice.subtotal', label: 'Delsum' },
  { value: 'invoice.vat_total', label: 'MVA' },
  { value: 'customer.name', label: 'Kundenavn' },
  { value: 'customer.org_number', label: 'Kunde org.nr' },
  { value: 'customer.address', label: 'Kundeadresse' },
  { value: 'company.name', label: 'Selskapsnavn' },
  { value: 'company.org_number', label: 'Selskap org.nr' },
  { value: 'company.address', label: 'Selskap adresse' },
];

export function TemplateProperties({ element, onUpdate, template }) {
  const [localUpdates, setLocalUpdates] = useState({});
  const [activeTab, setActiveTab] = useState('position');

  useEffect(() => {
    setLocalUpdates({});
    setActiveTab('position'); // Reset to position tab when element changes
  }, [element?.id]);

  if (!element) {
    return (
      <div className="w-80 flex flex-col h-full" style={{ borderLeft: '1px solid var(--f-border-subtle)', background: 'rgba(8,16,12,0.6)' }}>
        <div className="p-4" style={{ borderBottom: '1px solid var(--f-border-subtle)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--f-text-body)' }}>Egenskaper</h2>
        </div>
        <div className="p-4">
          <p className="text-sm" style={{ color: 'var(--f-text-subtle)' }}>Velg et element for å redigere</p>
        </div>
      </div>
    );
  }

  const applyUpdate = (updates) => {
    // Apply updates immediately and clear localUpdates
    // This prevents accumulated updates from being applied incorrectly
    const combined = { ...localUpdates, ...updates };
    setLocalUpdates({});
    onUpdate(combined);
  };

  // Determine available tabs based on element type
  const tabs = [
    { id: 'position', label: 'Posisjon', icon: IconStack },
    ...(element.type === 'text' || element.type === 'field'
      ? [{ id: 'content', label: 'Innhold', icon: IconTypography }]
      : []),
    ...(element.type === 'text' || element.type === 'field'
      ? [{ id: 'typography', label: 'Typografi', icon: IconTypography }]
      : []),
    ...(element.type === 'image'
      ? [{ id: 'image', label: 'Bilde', icon: IconPhoto }]
      : []),
    ...(element.type === 'table'
      ? [{ id: 'table', label: 'Tabell', icon: IconTable }]
      : []),
    ...(element.type === 'shape'
      ? [{ id: 'shape', label: 'Form', icon: IconSettings }]
      : []),
    { id: 'style', label: 'Stil', icon: IconSettings },
  ];

  return (
    <div className="w-80 flex flex-col h-full" style={{ borderLeft: '1px solid var(--f-border-subtle)', background: 'rgba(8,16,12,0.6)' }}>
      <div className="p-4" style={{ borderBottom: '1px solid var(--f-border-subtle)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--f-text-body)' }}>Egenskaper</h2>
        <p className="mt-1 text-xs capitalize" style={{ color: 'var(--f-text-subtle)' }}>{element.type}</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto" style={{ borderBottom: '1px solid var(--f-border-subtle)' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors"
              style={{
                borderBottomColor: isActive ? 'var(--f-green)' : 'transparent',
                color: isActive ? 'var(--f-green-text)' : 'var(--f-text-subtle)',
                background: isActive ? 'rgba(63,217,160,0.06)' : 'transparent',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = 'var(--f-text-body)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = 'var(--f-text-subtle)'; e.currentTarget.style.background = 'transparent'; } }}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Position Tab */}
        {activeTab === 'position' && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--f-text-subtle)' }}>
              Posisjon
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>X</label>
                <input
                  type="number"
                  value={element.x}
                  onChange={(e) => applyUpdate({ x: parseFloat(e.target.value) || 0 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Y</label>
                <input
                  type="number"
                  value={element.y}
                  onChange={(e) => applyUpdate({ y: parseFloat(e.target.value) || 0 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Bredde</label>
                <input
                  type="number"
                  value={element.width}
                  onChange={(e) => applyUpdate({ width: parseFloat(e.target.value) || 0 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Høyde</label>
                <input
                  type="number"
                  value={element.height}
                  onChange={(e) => applyUpdate({ height: parseFloat(e.target.value) || 0 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Z-index (lag)</label>
                <input
                  type="number"
                  value={element.zIndex ?? 1}
                  onChange={(e) => applyUpdate({ zIndex: parseInt(e.target.value) || 1 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs" style={{ color: 'var(--f-text-subtle)' }}>
                  Lavere tall vises bak andre elementer. Formelementer har vanligvis 0.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab (Text/Field) */}
        {activeTab === 'content' && (element.type === 'text' || element.type === 'field') && (
          <div>
            {element.type === 'text' && (
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Innhold</label>
                <textarea
                  value={element.content || ''}
                  onChange={(e) => applyUpdate({ content: e.target.value })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                  rows={6}
                />
              </div>
            )}

            {element.type === 'field' && (
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Feltbinding</label>
                <Select
                  value={element.binding || ''}
                  onChange={(value) => applyUpdate({ binding: value })}
                  options={FIELD_BINDINGS}
                />
              </div>
            )}
          </div>
        )}

        {/* Typography Tab (Text/Field) */}
        {activeTab === 'typography' && (element.type === 'text' || element.type === 'field') && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--f-text-subtle)' }}>
              Typografi
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Font</label>
                <select
                  value={element.fontFamily || 'Inter'}
                  onChange={(e) => applyUpdate({ fontFamily: e.target.value })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Inter">Inter</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Størrelse</label>
                <input
                  type="number"
                  value={element.fontSize || 14}
                  onChange={(e) => applyUpdate({ fontSize: parseFloat(e.target.value) || 14 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Vekt</label>
                <select
                  value={element.fontWeight || 400}
                  onChange={(e) => applyUpdate({ fontWeight: parseInt(e.target.value) || 400 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                >
                  <option value={300}>Lett (300)</option>
                  <option value={400}>Normal (400)</option>
                  <option value={500}>Medium (500)</option>
                  <option value={600}>Semibold (600)</option>
                  <option value={700}>Fet (700)</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Farge</label>
                <input
                  type="color"
                  value={element.color || '#0d3e51'}
                  onChange={(e) => applyUpdate({ color: e.target.value })}
                  className="h-10 w-full rounded-lg" style={{ border: '1px solid var(--f-border)' }}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Justering</label>
                <select
                  value={element.align || 'left'}
                  onChange={(e) => applyUpdate({ align: e.target.value })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                >
                  <option value="left">Venstre</option>
                  <option value="center">Senter</option>
                  <option value="right">Høyre</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Linjehøyde</label>
                <input
                  type="number"
                  step="0.1"
                  value={element.lineHeight || 1.5}
                  onChange={(e) => applyUpdate({ lineHeight: parseFloat(e.target.value) || 1.5 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Bokstavavstand</label>
                <input
                  type="number"
                  step="0.1"
                  value={element.letterSpacing || 0}
                  onChange={(e) => applyUpdate({ letterSpacing: parseFloat(e.target.value) || 0 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Tekststil</label>
                <div className="flex gap-2">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={element.fontStyle === 'italic'}
                      onChange={(e) => applyUpdate({ fontStyle: e.target.checked ? 'italic' : 'normal' })}
                      className="rounded"
                    />
                    <span className="text-xs" style={{ color: 'var(--f-text-soft)' }}>Kursiv</span>
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={element.textDecoration === 'underline'}
                      onChange={(e) => applyUpdate({ textDecoration: e.target.checked ? 'underline' : 'none' })}
                      className="rounded"
                    />
                    <span className="text-xs" style={{ color: 'var(--f-text-soft)' }}>Understreket</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Teksttransform</label>
                <select
                  value={element.textTransform || 'none'}
                  onChange={(e) => applyUpdate({ textTransform: e.target.value })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                >
                  <option value="none">Ingen</option>
                  <option value="uppercase">STORE BOKSTAVER</option>
                  <option value="lowercase">små bokstaver</option>
                  <option value="capitalize">Stor Forbokstav</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Image Tab */}
        {activeTab === 'image' && element.type === 'image' && (
          <div className="space-y-4">
            <div>
              <ImageUpload
                value={element.src || ''}
                onChange={async (imagePath) => {
                  // Only update if the value actually changed
                  if (imagePath !== (element.src || '')) {
                    applyUpdate({ src: imagePath });
                  }
                }}
                templateId={template?.meta?.id || template?.id}
                elementId={element.id}
                label="Bilde"
                maxSizeMB={10}
              />
            </div>
            <div className="pt-4" style={{ borderTop: '1px solid var(--f-border-faint)' }}>
              <label className="mb-2 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Alternativ: URL eller sti</label>
              <input
                type="text"
                value={element.src || ''}
                onChange={(e) => applyUpdate({ src: e.target.value })}
                placeholder="https://example.com/image.jpg eller /path/to/image.png"
                className="f-input w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div className="pt-4" style={{ borderTop: '1px solid var(--f-border-faint)' }}>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={element.preserveAspectRatio !== false}
                  onChange={(e) => applyUpdate({ preserveAspectRatio: e.target.checked })}
                  className="rounded"
                />
                <span className="text-xs" style={{ color: 'var(--f-text-soft)' }}>Bevar sideforhold</span>
              </label>
            </div>
          </div>
        )}

        {/* Table Tab */}
        {activeTab === 'table' && element.type === 'table' && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Binding</label>
              <Select
                value={element.binding || 'invoice.items'}
                onChange={(value) => applyUpdate({ binding: value })}
                options={[{ value: 'invoice.items', label: 'Fakturalinjer' }]}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Radhøyde</label>
              <input
                type="number"
                value={element.rowHeight || 18}
                onChange={(e) => applyUpdate({ rowHeight: parseFloat(e.target.value) || 18 })}
                className="f-input w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Maks rader</label>
              <input
                type="number"
                value={element.maxRows || 15}
                onChange={(e) => applyUpdate({ maxRows: parseInt(e.target.value) || 15 })}
                className="f-input w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            
            <div className="pt-4" style={{ borderTop: '1px solid var(--f-border-faint)' }}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--f-text-subtle)' }}>
                Tabellhode
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Bakgrunnsfarge</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={element.headerBackgroundColor || '#0d3e51'}
                      onChange={(e) => applyUpdate({ headerBackgroundColor: e.target.value })}
                      className="h-10 w-20 rounded-lg" style={{ border: '1px solid var(--f-border)' }}
                    />
                    <input
                      type="text"
                      value={element.headerBackgroundColor || '#0d3e51'}
                      onChange={(e) => applyUpdate({ headerBackgroundColor: e.target.value })}
                      placeholder="#0d3e51"
                      className="f-input flex-1 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Tekstfarge</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={element.headerTextColor || '#ffffff'}
                      onChange={(e) => applyUpdate({ headerTextColor: e.target.value })}
                      className="h-10 w-20 rounded-lg" style={{ border: '1px solid var(--f-border)' }}
                    />
                    <input
                      type="text"
                      value={element.headerTextColor || '#ffffff'}
                      onChange={(e) => applyUpdate({ headerTextColor: e.target.value })}
                      placeholder="#ffffff"
                      className="f-input flex-1 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4" style={{ borderTop: '1px solid var(--f-border-faint)' }}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--f-text-subtle)' }}>
                Tabellinnhold
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Tekstfarge</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={element.rowTextColor || '#0d3e51'}
                      onChange={(e) => applyUpdate({ rowTextColor: e.target.value })}
                      className="h-10 w-20 rounded-lg" style={{ border: '1px solid var(--f-border)' }}
                    />
                    <input
                      type="text"
                      value={element.rowTextColor || '#0d3e51'}
                      onChange={(e) => applyUpdate({ rowTextColor: e.target.value })}
                      placeholder="#0d3e51"
                      className="f-input flex-1 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shape Tab */}
        {activeTab === 'shape' && element.type === 'shape' && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Formtype</label>
              <select
                value={element.shapeType || 'rectangle'}
                onChange={(e) => applyUpdate({ shapeType: e.target.value })}
                className="f-input w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="rectangle">Rektangel</option>
                <option value="circle">Sirkel</option>
                <option value="line">Linje</option>
              </select>
            </div>
            {element.shapeType === 'line' && (
              <div>
                <p className="text-xs" style={{ color: 'var(--f-text-subtle)' }}>
                  Linjen vil være horisontal hvis bredden er større enn høyden, ellers vertikal.
                </p>
                <p className="mt-2 text-xs" style={{ color: 'var(--f-text-subtle)' }}>
                  Bruk "Stil"-fanen for å justere farger, rammer og andre stilegenskaper.
                </p>
              </div>
            )}
            {element.shapeType !== 'line' && (
              <div>
                <p className="text-xs" style={{ color: 'var(--f-text-subtle)' }}>
                  Bruk "Stil"-fanen for å justere bakgrunnsfarge, rammer, avrunding og andre stilegenskaper.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Style Tab - All elements */}
        {activeTab === 'style' && (
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--f-text-subtle)' }}>
              Stil
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Bakgrunnsfarge</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={element.backgroundColor || '#ffffff'}
                    onChange={(e) => applyUpdate({ backgroundColor: e.target.value })}
                    className="h-10 w-20 rounded-lg" style={{ border: '1px solid var(--f-border)' }}
                  />
                  <input
                    type="text"
                    value={element.backgroundColor || '#ffffff'}
                    onChange={(e) => applyUpdate({ backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                    className="f-input flex-1 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Gjennomsiktighet</label>
                <input
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={element.opacity !== undefined ? element.opacity : 1}
                  onChange={(e) => applyUpdate({ opacity: parseFloat(e.target.value) || 1 })}
                  className="f-input w-full rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Ramme</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Bredde</label>
                      <input
                        type="number"
                        value={element.borderWidth || 0}
                        onChange={(e) => applyUpdate({ borderWidth: parseFloat(e.target.value) || 0 })}
                        className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Farge</label>
                      <input
                        type="color"
                        value={element.borderColor || '#000000'}
                        onChange={(e) => applyUpdate({ borderColor: e.target.value })}
                        className="h-8 w-full rounded-lg" style={{ border: '1px solid var(--f-border)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Stil</label>
                    <select
                      value={element.borderStyle || 'solid'}
                      onChange={(e) => applyUpdate({ borderStyle: e.target.value })}
                      className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Stiplet</option>
                      <option value="dotted">Prikket</option>
                      <option value="none">Ingen</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Avrunding</label>
                    <input
                      type="number"
                      value={element.borderRadius || 0}
                      onChange={(e) => applyUpdate({ borderRadius: parseFloat(e.target.value) || 0 })}
                      className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Padding</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Topp</label>
                    <input
                      type="number"
                      value={element.paddingTop || 0}
                      onChange={(e) => applyUpdate({ paddingTop: parseFloat(e.target.value) || 0 })}
                      className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Høyre</label>
                    <input
                      type="number"
                      value={element.paddingRight || 0}
                      onChange={(e) => applyUpdate({ paddingRight: parseFloat(e.target.value) || 0 })}
                      className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Bunn</label>
                    <input
                      type="number"
                      value={element.paddingBottom || 0}
                      onChange={(e) => applyUpdate({ paddingBottom: parseFloat(e.target.value) || 0 })}
                      className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Venstre</label>
                    <input
                      type="number"
                      value={element.paddingLeft || 0}
                      onChange={(e) => applyUpdate({ paddingLeft: parseFloat(e.target.value) || 0 })}
                      className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-medium" style={{ color: 'var(--f-text-soft)' }}>Skygge</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>X</label>
                      <input
                        type="number"
                        value={element.boxShadowX || 0}
                        onChange={(e) => applyUpdate({ boxShadowX: parseFloat(e.target.value) || 0 })}
                        className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Y</label>
                      <input
                        type="number"
                        value={element.boxShadowY || 0}
                        onChange={(e) => applyUpdate({ boxShadowY: parseFloat(e.target.value) || 0 })}
                        className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Uskarphet</label>
                      <input
                        type="number"
                        value={element.boxShadowBlur || 0}
                        onChange={(e) => applyUpdate({ boxShadowBlur: parseFloat(e.target.value) || 0 })}
                        className="f-input w-full rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs" style={{ color: 'var(--f-text-subtle)' }}>Farge</label>
                    <input
                      type="color"
                      value={element.boxShadowColor || '#000000'}
                      onChange={(e) => applyUpdate({ boxShadowColor: e.target.value })}
                      className="h-8 w-full rounded-lg" style={{ border: '1px solid var(--f-border)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
