import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiEdit2, FiDownload, FiLock, FiCopy, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { renderTemplateToHTML } from '../../utils/templateRenderer';
import { getTemplateId, getTemplateName, getTemplateMeta, isTemplatePremium, isTemplateLocked, isTemplateDefault, isTemplatePreset } from '../../utils/templateUtils';

// Mock data for preview
const mockData = {
  invoice: {
    invoice_number: '2024-001',
    invoice_date: '2024-01-20',
    due_date: '2024-02-20',
    subtotal: 1000.00,
    vat_total: 250.00,
    total: 1250.00,
    items: [
      { description: 'Tjeneste', quantity: 1, unit_price: 750.00, vat_rate: 0.25, line_total: 937.50 },
      { description: 'Produkt', quantity: 1, unit_price: 250.00, vat_rate: 0.25, line_total: 312.50 },
    ],
  },
  customer: {
    name: 'Eksempel Kunde AS',
    address: 'Gateadresse 123',
    post_number: '0123',
    post_location: 'Oslo',
  },
  company: {
    name: 'Ditt Selskap AS',
    org_number: 'NO 999 888 777',
    address: 'Firmaveien 1',
    post_number: '1234',
    post_location: 'Bedriftsby',
    account_number: '1234.56.78901',
  },
};

export function TemplateCard({
  template,
  isDefault,
  isSupporter,
  onSetDefault,
  onEdit,
  onExport,
  onDuplicate,
  onDelete,
}) {
  const [previewHtml, setPreviewHtml] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const iframeRef = useRef(null);
  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const templateId = getTemplateId(template);
  const templateName = getTemplateName(template);
  const templateMeta = getTemplateMeta(template);
  const isPremium = isTemplatePremium(template);
  const isLocked = isTemplateLocked(template, isSupporter);
  const isPreset = isTemplatePreset(templateId);

  // Generate preview HTML
  useEffect(() => {
    if (!template) return;

    const processTemplate = async () => {
      try {
        // Process template to convert file paths to data URLs
        const currentTemplateId = template.meta?.id || template.id;
        const processedElements = await Promise.all(
          template.elements.map(async (element) => {
            if (element.type === 'image' && element.src && !element.src.startsWith('data:') && !element.src.startsWith('http')) {
              if (window.fattern?.template?.readImage) {
                try {
                  const dataURL = await window.fattern.template.readImage(currentTemplateId, element.src);
                  return { ...element, src: dataURL };
                } catch (error) {
                  console.error('Failed to read image:', error);
                  return element;
                }
              }
            }
            return element;
          })
        );

        const processedTemplate = { ...template, elements: processedElements };
        const html = renderTemplateToHTML(processedTemplate, mockData);
        setPreviewHtml(html);
      } catch (error) {
        console.error('Failed to generate preview:', error);
      }
    };

    processTemplate();
  }, [template]);

  // Update iframe content when HTML changes
  useEffect(() => {
    if (!iframeRef.current || !previewHtml) return;
    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(previewHtml);
    doc.close();
  }, [previewHtml]);

  // Calculate menu position and handle click outside
  useEffect(() => {
    const updatePosition = () => {
      if (showActions && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX,
        });
      }
    };

    const handleClickOutside = (event) => {
      const clickedButton = buttonRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);
      
      if (!clickedButton && !clickedMenu) {
        setShowActions(false);
      }
    };

    if (showActions) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showActions]);

  return (
    <div
      ref={cardRef}
      className={`group relative rounded-xl border bg-white overflow-hidden transition-all ${
        isLocked
          ? 'border-sand/40 bg-cloud/30 opacity-75'
          : isDefault
          ? 'border-brand-600 shadow-lg shadow-brand-600/20'
          : 'border-sand/60 hover:border-brand-300 hover:shadow-md'
      }`}
    >
      {/* Preview */}
      <div className="relative h-48 bg-cloud/50 overflow-hidden flex items-center justify-center">
        {previewHtml ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <iframe
              ref={iframeRef}
              className="absolute border-0 pointer-events-none"
              style={{
                width: '794px', // A4 width
                height: '1123px', // A4 height
                transform: 'scale(0.18)',
                transformOrigin: 'center center',
                left: '50%',
                top: '50%',
                marginLeft: '-397px', // Half of 794px
                marginTop: '-561.5px', // Half of 1123px
              }}
              title={`Preview of ${templateName}`}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-ink-subtle">
            Laster forhåndsvisning...
          </div>
        )}
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/20 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          {isDefault && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-1 text-xs font-semibold text-white">
              <FiCheck className="h-3 w-3" />
              Standard
            </span>
          )}
          {isPremium && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
              isLocked
                ? 'bg-amber-600 text-white'
                : 'bg-amber-500 text-white'
            }`}>
              {isLocked && <FiLock className="h-3 w-3" />}
              Premium
            </span>
          )}
          {isPreset && !isPremium && !isDefault && (
            <span className="inline-flex items-center rounded-full bg-cloud px-2 py-1 text-xs font-medium text-ink-subtle">
              Forhåndsdefinert
            </span>
          )}
        </div>

        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-semibold truncate ${isLocked ? 'text-ink-subtle' : 'text-ink'}`}>
              {templateName}
            </h4>
            {templateMeta.description && (
              <p className="text-xs text-ink-subtle mt-0.5 line-clamp-2">
                {templateMeta.description}
              </p>
            )}
          </div>

          {/* Actions Menu */}
          <div className="relative ml-2 flex-shrink-0">
            <button
              ref={buttonRef}
              onClick={() => setShowActions(!showActions)}
              className="rounded-lg p-1.5 text-ink-subtle hover:bg-cloud hover:text-ink transition"
              title="Flere handlinger"
            >
              <FiMoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tags */}
        {templateMeta.tags && templateMeta.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {templateMeta.tags.map((tag, idx) => (
              <span key={idx} className="inline-flex items-center rounded-full bg-cloud px-2 py-0.5 text-xs font-medium text-ink-subtle">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {templateMeta.version && (
            <span className="text-xs text-ink-subtle">v{templateMeta.version}</span>
          )}
          {templateMeta.author && (
            <span className="text-xs text-ink-subtle">av {templateMeta.author}</span>
          )}
        </div>

        {isLocked && (
          <div className="mt-2 pt-2 border-t border-sand/40">
            <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
              <FiLock className="h-3 w-3" />
              Krever Supporter Pack
            </p>
          </div>
        )}
      </div>

      {/* Actions Menu Portal */}
      {typeof document !== 'undefined' && showActions && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] w-48 rounded-lg border border-sand/60 bg-white shadow-lg py-1"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          {!isDefault && !isLocked && (
            <button
              onClick={() => {
                onSetDefault?.();
                setShowActions(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-ink hover:bg-cloud transition flex items-center gap-2"
            >
              <FiCheck className="h-3.5 w-3.5" />
              Sett som standard
            </button>
          )}
          {onEdit && !isLocked && (
            <button
              onClick={() => {
                onEdit?.();
                setShowActions(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-ink hover:bg-cloud transition flex items-center gap-2"
            >
              <FiEdit2 className="h-3.5 w-3.5" />
              Rediger
            </button>
          )}
          {onExport && !isLocked && (
            <button
              onClick={() => {
                onExport?.();
                setShowActions(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-ink hover:bg-cloud transition flex items-center gap-2"
            >
              <FiDownload className="h-3.5 w-3.5" />
              Eksporter
            </button>
          )}
          {onDuplicate && !isLocked && (
            <button
              onClick={() => {
                onDuplicate?.();
                setShowActions(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-ink hover:bg-cloud transition flex items-center gap-2"
            >
              <FiCopy className="h-3.5 w-3.5" />
              Dupliser
            </button>
          )}
          {onDelete && templateId !== 'default_invoice' && !isLocked && (
            <button
              onClick={() => {
                onDelete?.();
                setShowActions(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 transition flex items-center gap-2"
            >
              <FiTrash2 className="h-3.5 w-3.5" />
              Slett
            </button>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

