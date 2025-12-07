const { BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Generates a PDF from a template using Electron's printToPDF
 */
async function generateTemplatePDF(template, invoiceData, company, customer) {
  return new Promise((resolve, reject) => {
    // Create a hidden browser window
    const win = new BrowserWindow({
      show: false,
      width: 794,
      height: 1123,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    // Prepare data object for template rendering
    const data = {
      invoice: {
        invoice_number: invoiceData.invoice_number || invoiceData.id,
        invoice_date: invoiceData.invoice_date,
        due_date: invoiceData.due_date,
        status: invoiceData.status,
        total: invoiceData.total,
        subtotal: invoiceData.subtotal,
        vat_total: invoiceData.vat_total,
        items: (invoiceData.items || []).map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price || item.unitPrice,
          vat_rate: item.vat_rate || item.vatRate || 0,
          line_total: item.line_total || item.lineTotal || (item.quantity * (item.unit_price || item.unitPrice) * (1 + (item.vat_rate || item.vatRate || 0))),
        })),
      },
      customer: customer ? {
        name: customer.name,
        org_number: customer.org_number,
        address: customer.address,
        post_number: customer.post_number,
        post_location: customer.post_location,
        email: customer.email,
        phone: customer.phone,
      } : {},
      company: company ? {
        name: company.name,
        org_number: company.org_number,
        address: company.address,
        post_number: company.post_number,
        post_location: company.post_location,
        contact_email: company.contact_email,
        contact_number: company.contact_number,
      } : {},
    };

    // Generate HTML from template
    const html = renderTemplateToHTML(template, data);

    // Load HTML into window
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

    win.webContents.once('did-finish-load', () => {
      // Wait a bit for fonts and images to load
      setTimeout(() => {
        win.webContents
          .printToPDF({
            pageSize: 'A4',
            printBackground: true,
            margins: {
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            },
          })
          .then((buffer) => {
            // Save PDF
            const exportDir = path.join(os.homedir(), 'Fattern', 'exports');
            if (!fs.existsSync(exportDir)) {
              fs.mkdirSync(exportDir, { recursive: true });
            }

            const filename = `faktura-${invoiceData.invoice_number || invoiceData.id}.pdf`;
            const filepath = path.join(exportDir, filename);
            fs.writeFileSync(filepath, buffer);

            win.close();
            resolve(filepath);
          })
          .catch((error) => {
            win.close();
            reject(error);
          });
      }, 500);
    });

    win.webContents.once('did-fail-load', (event, errorCode, errorDescription) => {
      win.close();
      reject(new Error(`Failed to load template: ${errorDescription}`));
    });
  });
}

/**
 * Renders template to HTML (server-side version)
 */
function renderTemplateToHTML(template, data) {
  const pageWidth = 794;
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

  template.elements.forEach((element) => {
    html += renderElement(element, data);
  });

  html += `
      </div>
    </body>
    </html>
  `;

  return html;
}

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
      // Convert relative paths to absolute file paths for Electron
      let imageSrc = element.src;
      if (!imageSrc.startsWith('data:') && !imageSrc.startsWith('http') && !path.isAbsolute(imageSrc)) {
        // It's a relative path, resolve it relative to templates directory
        const { TemplateStorage } = require('../db/templateStorage');
        const templateStorage = new TemplateStorage();
        imageSrc = templateStorage.getImagePath(imageSrc);
        // Convert to file:// URL for Electron
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

    default:
      return '';
  }
}

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

function formatValue(value, binding) {
  if (value == null || value === '') return '';

  // Date fields
  if (binding && (binding.includes('date') || binding.includes('Date'))) {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  // Currency fields
  if (binding && (binding.includes('total') || binding.includes('price') || binding.includes('amount'))) {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Number fields
  if (typeof value === 'number') {
    return value.toString();
  }

  return String(value);
}

function objectToStyleString(styles) {
  return Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}: ${value};`;
    })
    .join(' ');
}

function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { generateTemplatePDF };

