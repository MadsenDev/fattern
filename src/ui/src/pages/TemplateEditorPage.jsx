import { useState, useEffect, useCallback, useMemo } from 'react';
import { FiArrowLeft, FiSave, FiZoomIn, FiZoomOut, FiMaximize2, FiEye, FiSettings } from 'react-icons/fi';
import { TemplateCanvas } from '../components/template/TemplateCanvas';
import { TemplatePalette } from '../components/template/TemplatePalette';
import { TemplateProperties } from '../components/template/TemplateProperties';
import { TemplatePreview } from '../components/template/TemplatePreview';
import { TemplateSettingsModal } from '../components/template/TemplateSettingsModal';
import { useTemplateHistory } from '../hooks/useTemplateHistory';

export function TemplateEditorPage({ templateId, onClose }) {
  const [template, setTemplate] = useState(null);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [zoom, setZoom] = useState(() => {
    // Calculate initial zoom to fit A4 page in viewport
    // Account for: titlebar (2rem), editor toolbar (3rem), margins
    const viewportHeight = window.innerHeight - 32 - 48; // titlebar + toolbar
    const A4_HEIGHT = 1123; // A4 at 96 DPI
    const fitZoom = Math.floor((viewportHeight / A4_HEIGHT) * 100);
    return Math.min(100, Math.max(50, fitZoom));
  });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(() => {
    // Check if templateId contains preview parameter
    return templateId?.includes('?preview=true') || false;
  });
  const [showSettings, setShowSettings] = useState(false);
  const { history, pushToHistory, undo, redo, canUndo, canRedo } = useTemplateHistory();
  
  // Extract actual templateId if it contains query params
  const actualTemplateId = templateId?.split('?')[0] || templateId;

  useEffect(() => {
    loadTemplate();
  }, [actualTemplateId]);

  const loadTemplate = async () => {
    setIsLoading(true);
    try {
      const api = window.fattern?.template;
      if (!api) {
        console.error('Template API not available');
        return;
      }

      let loadedTemplate = await api.load(actualTemplateId);
      if (!loadedTemplate) {
        // Create default if it doesn't exist
        loadedTemplate = await api.createDefault();
      }

      setTemplate(loadedTemplate);
      pushToHistory(loadedTemplate);
    } catch (error) {
      console.error('Failed to load template', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!template) return;
    try {
      const api = window.fattern?.template;
      if (!api) return;

      await api.save(template);
      // Show success toast or feedback
    } catch (error) {
      console.error('Failed to save template', error);
    }
  };

  const handleSaveSettings = (updatedTemplate) => {
    setTemplate(updatedTemplate);
    pushToHistory(updatedTemplate);
    // Auto-save when settings are updated
    handleSave();
  };

  const handleUpdateTemplate = useCallback((updater) => {
    setTemplate((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      pushToHistory(updated);
      return updated;
    });
  }, [pushToHistory]);

  const handleAddElement = (elementType) => {
    if (!template) return;

    const newElement = createElement(elementType);
    handleUpdateTemplate((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));
    setSelectedElementId(newElement.id);
  };

  const handleUpdateElement = (elementId, updates) => {
    handleUpdateTemplate((prev) => ({
      ...prev,
      elements: prev.elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
    }));
  };

  const handleDeleteElement = (elementId) => {
    handleUpdateTemplate((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== elementId),
    }));
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  };

  const handleUndo = () => {
    const previous = undo();
    if (previous) {
      setTemplate(previous);
    }
  };

  const handleRedo = () => {
    const next = redo();
    if (next) {
      setTemplate(next);
    }
  };

  const selectedElement = useMemo(() => {
    if (!template || !selectedElementId) return null;
    return template.elements.find((el) => el.id === selectedElementId);
  }, [template, selectedElementId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-cloud">
        <p className="text-ink-subtle">Laster mal...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-screen items-center justify-center bg-cloud">
        <p className="text-ink-subtle">Kunne ikke laste mal</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-cloud" style={{ top: '2rem' }}>
      {/* Top Bar */}
      <div className="flex h-12 items-center justify-between border-b border-sand/60 bg-white px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-ink hover:bg-cloud"
          >
            <FiArrowLeft className="h-4 w-4" />
            Tilbake
          </button>
          <div className="h-6 w-px bg-sand/60" />
          <h1 className="text-sm font-semibold text-ink">{template.meta?.name || template.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo/Redo */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cloud"
          >
            Angre
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-ink disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cloud"
          >
            Gjør om
          </button>

          <div className="h-6 w-px bg-sand/60" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="rounded-lg p-1.5 text-ink hover:bg-cloud"
              disabled={zoom <= 50}
            >
              <FiZoomOut className="h-4 w-4" />
            </button>
            <span className="min-w-[4rem] text-center text-sm font-medium text-ink">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="rounded-lg p-1.5 text-ink hover:bg-cloud"
              disabled={zoom >= 200}
            >
              <FiZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                // Calculate zoom to fit A4 page in viewport
                const viewportHeight = window.innerHeight - 32 - 48; // titlebar (2rem) + toolbar (3rem)
                const A4_HEIGHT = 1123; // A4 at 96 DPI
                const fitZoom = Math.floor((viewportHeight / A4_HEIGHT) * 100);
                setZoom(Math.min(100, Math.max(50, fitZoom)));
              }}
              className="ml-2 rounded-lg px-3 py-1.5 text-xs font-medium text-ink hover:bg-cloud"
            >
              Tilpass
            </button>
          </div>

          <div className="h-6 w-px bg-sand/60" />

          {/* Preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-ink hover:bg-cloud"
          >
            <FiEye className="mr-2 inline h-4 w-4" />
            {showPreview ? 'Rediger' : 'Forhåndsvisning'}
          </button>

          <div className="h-6 w-px bg-sand/60" />

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="rounded-lg px-4 py-1.5 text-sm font-medium text-ink hover:bg-cloud"
            title="Mal innstillinger"
          >
            <FiSettings className="mr-2 inline h-4 w-4" />
            Innstillinger
          </button>

          <div className="h-6 w-px bg-sand/60" />

          {/* Save */}
          <button
            onClick={handleSave}
            className="rounded-lg bg-ink px-4 py-1.5 text-sm font-medium text-white hover:bg-ink-soft"
          >
            <FiSave className="mr-2 inline h-4 w-4" />
            Lagre
          </button>
        </div>
      </div>

      {/* Main Content */}
      {showPreview ? (
        <div className="flex-1 overflow-hidden">
          <TemplatePreview template={template} zoom={zoom} pan={pan} onPanChange={setPan} onClose={() => setShowPreview(false)} />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Palette (Left) */}
          <TemplatePalette onAddElement={handleAddElement} />

          {/* Canvas (Center) */}
          <div className="flex-1 overflow-hidden">
            <TemplateCanvas
              template={template}
              zoom={zoom}
              pan={pan}
              onPanChange={setPan}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={handleUpdateElement}
              onDeleteElement={handleDeleteElement}
            />
          </div>

          {/* Properties (Right) */}
          <TemplateProperties
            element={selectedElement}
            template={template}
            onUpdate={(updates) => selectedElementId && handleUpdateElement(selectedElementId, updates)}
          />
        </div>
      )}

      {/* Settings Modal */}
      <TemplateSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        template={template}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

// Helper function to create new elements
function createElement(type) {
  const baseId = `element_${Date.now()}`;
  const baseElement = {
    id: baseId,
    x: 100,
    y: 100,
    width: 200,
    height: 30,
  };

  switch (type) {
    case 'text':
      return {
        ...baseElement,
        type: 'text',
        content: 'Ny tekst',
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 400,
        color: '#0d3e51',
        align: 'left',
        zIndex: 1,
      };
    case 'field':
      return {
        ...baseElement,
        type: 'field',
        binding: 'invoice.invoice_number',
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 400,
        color: '#0d3e51',
        align: 'left',
        zIndex: 1,
      };
    case 'image':
      return {
        ...baseElement,
        type: 'image',
        src: '',
        width: 200,
        height: 100,
        preserveAspectRatio: true,
        zIndex: 1,
      };
    case 'table':
      return {
        ...baseElement,
        type: 'table',
        binding: 'invoice.items',
        width: 500,
        height: 300,
        columns: [
          { header: 'Beskrivelse', field: 'description', width: 250, align: 'left' },
          { header: 'Antall', field: 'quantity', width: 50, align: 'right' },
          { header: 'Pris', field: 'unit_price', width: 80, align: 'right' },
          { header: 'Total', field: 'line_total', width: 80, align: 'right' },
        ],
        rowHeight: 18,
        maxRows: 15,
        zIndex: 1,
      };
    case 'shape':
      return {
        ...baseElement,
        type: 'shape',
        shapeType: 'rectangle', // 'rectangle' | 'line' | 'circle'
        width: 200,
        height: 100,
        backgroundColor: '#f0f8f5',
        borderWidth: 1,
        borderColor: '#d5e7e6',
        borderStyle: 'solid',
        borderRadius: 0,
        zIndex: 0, // Shapes default to lower z-index
      };
    default:
      return baseElement;
  }
}

