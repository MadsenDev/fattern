import { IconTypography, IconPhoto, IconDatabase, IconLayoutGrid, IconSquare } from '@tabler/icons-react';

const paletteItems = [
  { type: 'text', label: 'Tekst', icon: IconTypography },
  { type: 'field', label: 'Felt', icon: IconDatabase },
  { type: 'image', label: 'Bilde', icon: IconPhoto },
  { type: 'table', label: 'Tabell', icon: IconLayoutGrid },
  { type: 'shape', label: 'Form', icon: IconSquare },
];

export function TemplatePalette({ onAddElement }) {
  return (
    <div className="w-64" style={{ borderRight: '1px solid var(--f-border-subtle)', background: 'rgba(8,16,12,0.6)' }}>
      <div className="p-4" style={{ borderBottom: '1px solid var(--f-border-subtle)' }}>
        <h2 className="text-sm font-semibold" style={{ color: 'var(--f-text-body)' }}>Elementer</h2>
        <p className="mt-1 text-xs" style={{ color: 'var(--f-text-subtle)' }}>Klikk for å legge til</p>
      </div>
      <div className="p-4 space-y-2">
        {paletteItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => onAddElement(item.type)}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition"
              style={{ border: '1px solid var(--f-border-subtle)', background: 'transparent', color: 'var(--f-text-body)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--f-green-bg)'; e.currentTarget.style.borderColor = 'var(--f-border-green)'; e.currentTarget.style.color = 'var(--f-green-text)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--f-border-subtle)'; e.currentTarget.style.color = 'var(--f-text-body)'; }}
            >
              <Icon className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--f-text-subtle)' }} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

