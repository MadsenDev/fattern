import { FiType, FiImage, FiDatabase, FiGrid } from 'react-icons/fi';

const paletteItems = [
  { type: 'text', label: 'Tekst', icon: FiType },
  { type: 'field', label: 'Felt', icon: FiDatabase },
  { type: 'image', label: 'Bilde', icon: FiImage },
  { type: 'table', label: 'Tabell', icon: FiGrid },
];

export function TemplatePalette({ onAddElement }) {
  return (
    <div className="w-64 border-r border-sand/60 bg-white">
      <div className="border-b border-sand/60 p-4">
        <h2 className="text-sm font-semibold text-ink">Elementer</h2>
        <p className="mt-1 text-xs text-ink-subtle">Klikk for å legge til</p>
      </div>
      <div className="p-4 space-y-2">
        {paletteItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => onAddElement(item.type)}
              className="flex w-full items-center gap-3 rounded-lg border border-sand/60 bg-white px-4 py-3 text-left transition hover:border-brand-300 hover:bg-brand-50"
            >
              <Icon className="h-5 w-5 text-ink-subtle" />
              <span className="text-sm font-medium text-ink">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

