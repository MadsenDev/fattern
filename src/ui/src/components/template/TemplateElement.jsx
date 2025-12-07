import { useState, useRef, useCallback, useEffect } from 'react';

// Component to load images from file paths or data URLs
function ImageLoader({ src, elementId }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImageSrc(null);
      return;
    }

    // If it's a data URL, use it directly
    if (src.startsWith('data:')) {
      setImageSrc(src);
      return;
    }

    // If it's a file path, read the file via IPC and convert to data URL
    if (window.fattern?.template?.readImage) {
      window.fattern.template.readImage(src).then((dataURL) => {
        setImageSrc(dataURL);
      }).catch(() => {
        setError(true);
      });
    } else {
      // Fallback: try to use the path as-is
      setImageSrc(src);
    }
  }, [src]);

  if (error || !imageSrc) {
    return <span className="text-xs text-ink-subtle">Bilde</span>;
  }

  return (
    <img 
      key={`canvas-img-${elementId}`}
      src={imageSrc} 
      alt="" 
      className="max-h-full max-w-full object-contain"
      style={{ display: 'block', contain: 'layout style paint' }}
      onError={() => setError(true)}
    />
  );
}

export function TemplateElement({
  element,
  zoom = 1,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const elementRef = useRef(null);

  const snapToGrid = (value) => {
    return Math.round(value / 10) * 10;
  };

  const handleMouseDown = useCallback((e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: element.width,
        height: element.height,
      });
    } else {
      setIsDragging(true);
      const rect = elementRef.current.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      onSelect();
    }
    e.stopPropagation();
  }, [element, onSelect]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const rect = elementRef.current.parentElement.getBoundingClientRect();
      const newX = (e.clientX - rect.left - dragStart.x) / zoom;
      const newY = (e.clientY - rect.top - dragStart.y) / zoom;
      onUpdate({
        x: snapToGrid(newX),
        y: snapToGrid(newY),
      });
    } else if (isResizing) {
      const deltaX = (e.clientX - resizeStart.x) / zoom;
      const deltaY = (e.clientY - resizeStart.y) / zoom;
      onUpdate({
        width: Math.max(50, resizeStart.width + deltaX),
        height: Math.max(20, resizeStart.height + deltaY),
      });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, zoom, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              fontFamily: element.fontFamily || 'Inter',
              fontSize: `${element.fontSize || 14}px`,
              fontWeight: element.fontWeight || 400,
              color: element.color || '#0d3e51',
              textAlign: element.align || 'left',
              lineHeight: element.lineHeight || 1.5,
              letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : '0px',
              fontStyle: element.fontStyle || 'normal',
              textDecoration: element.textDecoration || 'none',
              textTransform: element.textTransform || 'none',
              backgroundColor: element.backgroundColor || 'transparent',
              opacity: element.opacity !== undefined ? element.opacity : 1,
              borderWidth: element.borderWidth ? `${element.borderWidth}px` : '0px',
              borderColor: element.borderColor || 'transparent',
              borderStyle: element.borderStyle || 'solid',
              borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0px',
              paddingTop: element.paddingTop ? `${element.paddingTop}px` : '0px',
              paddingRight: element.paddingRight ? `${element.paddingRight}px` : '0px',
              paddingBottom: element.paddingBottom ? `${element.paddingBottom}px` : '0px',
              paddingLeft: element.paddingLeft ? `${element.paddingLeft}px` : '0px',
              boxShadow: (element.boxShadowX || element.boxShadowY || element.boxShadowBlur)
                ? `${element.boxShadowX || 0}px ${element.boxShadowY || 0}px ${element.boxShadowBlur || 0}px ${element.boxShadowColor || 'rgba(0, 0, 0, 0.1)'}`
                : 'none',
            }}
          >
            {element.content || ''}
          </div>
        );
      case 'field':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              boxSizing: 'border-box',
              fontFamily: element.fontFamily || 'Inter',
              fontSize: `${element.fontSize || 14}px`,
              fontWeight: element.fontWeight || 400,
              color: element.color || '#0d3e51',
              textAlign: element.align || 'left',
              lineHeight: element.lineHeight || 1.5,
              letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : '0px',
              fontStyle: element.fontStyle || 'italic',
              textDecoration: element.textDecoration || 'none',
              textTransform: element.textTransform || 'none',
              backgroundColor: element.backgroundColor || 'transparent',
              opacity: element.opacity !== undefined ? element.opacity : 1,
              borderWidth: element.borderWidth ? `${element.borderWidth}px` : '0px',
              borderColor: element.borderColor || 'transparent',
              borderStyle: element.borderStyle || 'solid',
              borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0px',
              paddingTop: element.paddingTop ? `${element.paddingTop}px` : '0px',
              paddingRight: element.paddingRight ? `${element.paddingRight}px` : '0px',
              paddingBottom: element.paddingBottom ? `${element.paddingBottom}px` : '0px',
              paddingLeft: element.paddingLeft ? `${element.paddingLeft}px` : '0px',
              boxShadow: (element.boxShadowX || element.boxShadowY || element.boxShadowBlur)
                ? `${element.boxShadowX || 0}px ${element.boxShadowY || 0}px ${element.boxShadowBlur || 0}px ${element.boxShadowColor || 'rgba(0, 0, 0, 0.1)'}`
                : 'none',
            }}
            className="text-ink-subtle"
          >
            {element.binding || '{{field}}'}
          </div>
        );
      case 'image':
        return (
          <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-sand/60 bg-cloud/50" style={{ contain: 'layout style paint' }}>
            {element.src ? (
              <ImageLoader src={element.src} elementId={element.id} />
            ) : (
              <span className="text-xs text-ink-subtle">Bilde</span>
            )}
          </div>
        );
      case 'table':
        return (
          <div
            className="h-full w-full"
            style={{
              backgroundColor: element.backgroundColor || 'transparent',
              opacity: element.opacity !== undefined ? element.opacity : 1,
              borderWidth: element.borderWidth ? `${element.borderWidth}px` : '1px',
              borderColor: element.borderColor || '#d5e7e6',
              borderStyle: element.borderStyle || 'solid',
              borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0px',
              paddingTop: element.paddingTop ? `${element.paddingTop}px` : '0px',
              paddingRight: element.paddingRight ? `${element.paddingRight}px` : '0px',
              paddingBottom: element.paddingBottom ? `${element.paddingBottom}px` : '0px',
              paddingLeft: element.paddingLeft ? `${element.paddingLeft}px` : '0px',
              boxShadow: (element.boxShadowX || element.boxShadowY || element.boxShadowBlur)
                ? `${element.boxShadowX || 0}px ${element.boxShadowY || 0}px ${element.boxShadowBlur || 0}px ${element.boxShadowColor || 'rgba(0, 0, 0, 0.1)'}`
                : 'none',
            }}
          >
            <div className="border-b border-sand/60 bg-cloud/50 p-1 text-xs font-semibold text-ink">
              Tabell: {element.binding || 'invoice.items'}
            </div>
            <div className="p-2 text-xs text-ink-subtle">
              {element.columns?.length || 0} kolonner
            </div>
          </div>
        );
      default:
        return <div className="text-xs text-ink-subtle">Ukjent element</div>;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute cursor-move ${
        isSelected ? 'ring-2 ring-brand-600' : 'ring-1 ring-transparent hover:ring-sand/60'
      }`}
      style={{
        left: `${element.x}px`,
        top: `${element.y}px`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        boxSizing: 'border-box',
        overflow: 'hidden',
        // No per-element scaling - canvas handles all scaling
      }}
      onMouseDown={handleMouseDown}
    >
      {renderElement()}
      {isSelected && (
        <>
          {/* Resize handles */}
          <div className="resize-handle absolute -right-1 -top-1 h-3 w-3 cursor-nwse-resize rounded-full bg-brand-600" />
          <div className="resize-handle absolute -right-1 -bottom-1 h-3 w-3 cursor-nesw-resize rounded-full bg-brand-600" />
          <div className="resize-handle absolute -left-1 -top-1 h-3 w-3 cursor-nesw-resize rounded-full bg-brand-600" />
          <div className="resize-handle absolute -left-1 -bottom-1 h-3 w-3 cursor-nwse-resize rounded-full bg-brand-600" />
          <div className="resize-handle absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 cursor-ew-resize rounded-full bg-brand-600" />
          <div className="resize-handle absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-ns-resize rounded-full bg-brand-600" />
          <div className="resize-handle absolute -left-1 top-1/2 h-3 w-3 -translate-y-1/2 cursor-ew-resize rounded-full bg-brand-600" />
          <div className="resize-handle absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 cursor-ns-resize rounded-full bg-brand-600" />
        </>
      )}
    </div>
  );
}

