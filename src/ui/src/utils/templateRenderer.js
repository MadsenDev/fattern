import { formatDate } from './formatDate';
import { formatCurrency } from './formatCurrency';

/**
 * Resolves a field binding path (e.g., "invoice.number") to a value from the data object
 */
function resolveBinding(binding, data) {
  if (!binding) return '';
  const parts = binding.split('.');
  let value = data;
  for (const part of parts) {
    if (value == null) return '';
    value = value[part];
  }
  return value ?? '';
}

/**
 * Formats a value based on its type and context
 */
function formatValue(value, binding) {
  if (value == null || value === '') return '';

  // Date fields
  if (binding && (binding.includes('date') || binding.includes('Date'))) {
    return formatDate(value);
  }

  // Currency fields
  if (binding && (binding.includes('total') || binding.includes('price') || binding.includes('amount'))) {
    return formatCurrency(value);
  }

  // Number fields
  if (typeof value === 'number') {
    return value.toString();
  }

  return String(value);
}

/**
 * Renders a single template element to HTML
 */
function renderElement(element, data) {
  const baseStyle = {
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: `${element.width}px`,
    height: `${element.height}px`,
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
    zIndex: element.zIndex ?? 1,
  };

  // Build box shadow if any shadow properties are set
  if (element.boxShadowX || element.boxShadowY || element.boxShadowBlur) {
    const shadowX = element.boxShadowX || 0;
    const shadowY = element.boxShadowY || 0;
    const shadowBlur = element.boxShadowBlur || 0;
    const shadowColor = element.boxShadowColor || 'rgba(0, 0, 0, 0.1)';
    baseStyle.boxShadow = `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowColor}`;
  }

  switch (element.type) {
    case 'text':
      return `
        <div class="el" style="${objectToStyleString({
          ...baseStyle,
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
        })}">
          ${escapeHtml(element.content || '')}
        </div>
      `;

    case 'field':
      const fieldValue = resolveBinding(element.binding, data);
      const formattedValue = formatValue(fieldValue, element.binding);
      return `
        <div class="el" style="${objectToStyleString({
          ...baseStyle,
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
        })}">
          ${escapeHtml(formattedValue)}
        </div>
      `;

    case 'image':
      if (!element.src) return '';
      // Convert file paths to file:// URLs for browser display
      let imageSrc = element.src;
      if (!imageSrc.startsWith('data:') && !imageSrc.startsWith('http') && !imageSrc.startsWith('file://')) {
        // It's a relative path, convert to file:// URL
        // The path should be relative to templates directory: images/filename.ext
        // We need to get the absolute path via IPC, but for now, try file:// protocol
        // In the preview component, we'll handle this conversion before rendering
        imageSrc = `file://${imageSrc}`;
      }
      return `
        <img 
          class="el"
          src="${escapeHtml(imageSrc)}" 
          style="${objectToStyleString({
            ...baseStyle,
            objectFit: element.preserveAspectRatio !== false ? 'contain' : 'fill',
          })}"
          alt=""
        />
      `;

    case 'table':
      return renderTable(element, data, baseStyle);

    case 'shape':
      return renderShape(element, baseStyle);

    default:
      return '';
  }
}

/**
 * Renders a shape element
 */
function renderShape(element, baseStyle) {
  const shapeType = element.shapeType || 'rectangle';
  
  if (shapeType === 'line') {
    // Horizontal or vertical line
    const isHorizontal = element.width > element.height;
    const lineStyle = {
      ...baseStyle,
      position: 'absolute',
      [isHorizontal ? 'top' : 'left']: '50%',
      [isHorizontal ? 'left' : 'top']: 0,
      [isHorizontal ? 'width' : 'height']: '100%',
      [isHorizontal ? 'height' : 'width']: `${element.borderWidth || 1}px`,
      transform: isHorizontal ? 'translateY(-50%)' : 'translateX(-50%)',
      backgroundColor: element.borderColor || element.backgroundColor || '#0d3e51',
      borderWidth: '0px',
    };
    return `<div class="el" style="${objectToStyleString(lineStyle)}"></div>`;
  } else if (shapeType === 'circle') {
    const circleStyle = {
      ...baseStyle,
      borderRadius: '50%',
      backgroundColor: element.backgroundColor || '#f0f8f5',
      borderWidth: element.borderWidth ? `${element.borderWidth}px` : '1px',
      borderColor: element.borderColor || '#d5e7e6',
      borderStyle: element.borderStyle || 'solid',
    };
    return `<div class="el" style="${objectToStyleString(circleStyle)}"></div>`;
  } else {
    // rectangle (default)
    return `<div class="el" style="${objectToStyleString(baseStyle)}"></div>`;
  }
}

/**
 * Renders a table element
 */
function renderTable(element, data, baseStyle) {
  const items = resolveBinding(element.binding, data) || [];
  const columns = element.columns || [];
  const maxRows = element.maxRows || 15;
  const rowHeight = element.rowHeight || 18;
  const visibleItems = items.slice(0, maxRows);

  // Apply background color to the table container
  const tableContainerStyle = {
    ...baseStyle,
    backgroundColor: element.backgroundColor || 'transparent',
    overflow: element.borderRadius ? 'hidden' : 'visible',
  };

  // Use border-collapse: separate if we have border-radius, otherwise collapse
  const tableBorderCollapse = element.borderRadius ? 'separate' : 'collapse';
  const tableBorderSpacing = element.borderRadius ? '0' : '0';
  
  let html = `
    <div class="el" style="${objectToStyleString(tableContainerStyle)}">
      <table style="width: 100%; height: 100%; border-collapse: ${tableBorderCollapse}; border-spacing: ${tableBorderSpacing}; background-color: ${element.backgroundColor || 'transparent'}; ${element.borderRadius ? `border-radius: ${element.borderRadius}px; overflow: hidden;` : ''}">
        <thead>
          <tr style="background-color: ${element.headerBackgroundColor || '#0d3e51'}; color: ${element.headerTextColor || '#ffffff'};">
  `;

  columns.forEach((col) => {
    html += `
      <th style="
        padding: 8px;
        text-align: ${col.align || 'left'};
        vertical-align: top;
        font-size: 9px;
        font-weight: 600;
        border: 1px solid rgba(255, 255, 255, 0.2);
      ">${escapeHtml(col.header || '')}</th>
    `;
  });

  html += `
          </tr>
        </thead>
        <tbody>
  `;

  visibleItems.forEach((item, index) => {
    // Use element background if set, otherwise use alternating row colors
    const rowBgColor = element.backgroundColor 
      ? element.backgroundColor 
      : (index % 2 === 0 ? '#f0f8f5' : 'transparent');
    html += `<tr style="background-color: ${rowBgColor};">`;
    columns.forEach((col) => {
      const value = item[col.field] ?? '';
      const formatted = formatValue(value, col.field);
      html += `
        <td style="
          padding: 4px 8px;
          text-align: ${col.align || 'left'};
          vertical-align: top;
          font-size: 9px;
          color: ${element.rowTextColor || '#0d3e51'};
          border-bottom: 1px solid #d5e7e6;
        ">${escapeHtml(formatted)}</td>
      `;
    });
    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  return html;
}

/**
 * Converts a style object to a CSS string
 */
function objectToStyleString(styles) {
  return Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Renders a complete template to HTML
 */
export function renderTemplateToHTML(template, data = {}) {
  const pageWidth = 794; // A4 at 96 DPI
  const pageHeight = 1123;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', system-ui, sans-serif;
          width: ${pageWidth}px;
          height: ${pageHeight}px;
          background: white;
          position: relative;
          overflow: hidden;
        }
        .page {
          position: relative;
          width: ${pageWidth}px;
          height: ${pageHeight}px;
        }
        .el {
          position: absolute;
          box-sizing: border-box;
        }
      </style>
    </head>
    <body>
      <div class="page">
  `;

  // Sort elements by z-index (lower z-index renders first/behind)
  const sortedElements = [...template.elements].sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1));
  sortedElements.forEach((element) => {
    html += renderElement(element, data);
  });

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
}

/**
 * Renders template for editor preview (with selection overlays)
 */
export function renderTemplateForPreview(template, data = {}, selectedElementId = null) {
  const html = renderTemplateToHTML(template, data);
  // In preview mode, we'll add selection indicators via React overlays
  return html;
}

