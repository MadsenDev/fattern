const fs = require('fs');
const path = require('path');
const os = require('os');

class TemplateStorage {
  constructor() {
    this.templatesDir = path.join(os.homedir(), 'Fattern', 'data', 'templates');
    this.imagesDir = path.join(this.templatesDir, 'images');
    this.ensureTemplatesDir();
    this.ensureImagesDir();
  }

  ensureTemplatesDir() {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  ensureImagesDir() {
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
  }

  getTemplatePath(templateId) {
    return path.join(this.templatesDir, `${templateId}.json`);
  }

  saveTemplate(template) {
    const filepath = this.getTemplatePath(template.id);
    fs.writeFileSync(filepath, JSON.stringify(template, null, 2), 'utf8');
    return template;
  }

  loadTemplate(templateId) {
    const filepath = this.getTemplatePath(templateId);
    if (!fs.existsSync(filepath)) {
      return null;
    }
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  }

  listTemplates() {
    if (!fs.existsSync(this.templatesDir)) {
      return [];
    }
    const files = fs.readdirSync(this.templatesDir);
    return files
      .filter((file) => file.endsWith('.json'))
      .map((file) => {
        const templateId = path.basename(file, '.json');
        return this.loadTemplate(templateId);
      })
      .filter((template) => template !== null);
  }

  deleteTemplate(templateId) {
    const filepath = this.getTemplatePath(templateId);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  }

  duplicateTemplate(templateId, newId, newName) {
    const original = this.loadTemplate(templateId);
    if (!original) {
      return null;
    }
    const duplicate = {
      ...original,
      id: newId,
      name: newName,
    };
    return this.saveTemplate(duplicate);
  }

  // Save an image file and return the relative path
  saveImage(templateId, elementId, imageData) {
    // Extract image data from data URL if needed
    let buffer;
    let extension = 'png';
    
    if (typeof imageData === 'string') {
      if (imageData.startsWith('data:')) {
        // Parse data URL: data:image/png;base64,...
        const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          extension = matches[1];
          const base64Data = matches[2];
          buffer = Buffer.from(base64Data, 'base64');
        } else {
          throw new Error('Invalid image data URL format');
        }
      } else {
        // Assume it's already a file path
        return imageData;
      }
    } else {
      throw new Error('Image data must be a string (data URL or file path)');
    }

    // Generate unique filename: templateId_elementId_timestamp.extension
    const timestamp = Date.now();
    const filename = `${templateId}_${elementId}_${timestamp}.${extension}`;
    const filepath = path.join(this.imagesDir, filename);
    
    // Save the file
    fs.writeFileSync(filepath, buffer);
    
    // Return relative path from templates directory
    return path.join('images', filename);
  }

  // Get absolute path for an image
  getImagePath(imagePath) {
    if (!imagePath) return null;
    // If it's already an absolute path, return it
    if (path.isAbsolute(imagePath)) {
      return imagePath;
    }
    // Otherwise, resolve relative to templates directory
    return path.join(this.templatesDir, imagePath);
  }

  // Delete an image file
  deleteImage(imagePath) {
    if (!imagePath) return false;
    const fullPath = this.getImagePath(imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }

  // Clean up unused images (called when template is deleted)
  cleanupTemplateImages(template) {
    if (!template || !template.elements) return;
    
    template.elements.forEach((element) => {
      if (element.type === 'image' && element.src) {
        // Only delete if it's a relative path (stored in our images dir)
        if (!path.isAbsolute(element.src) && element.src.startsWith('images/')) {
          this.deleteImage(element.src);
        }
      }
    });
  }

  saveTemplate(template) {
    const filepath = this.getTemplatePath(template.id);
    fs.writeFileSync(filepath, JSON.stringify(template, null, 2), 'utf8');
    return template;
  }

  deleteTemplate(templateId) {
    const template = this.loadTemplate(templateId);
    if (template) {
      // Clean up associated images
      this.cleanupTemplateImages(template);
    }
    const filepath = this.getTemplatePath(templateId);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  }

  createDefaultTemplate() {
    const defaultTemplate = {
      id: 'default_invoice',
      name: 'Default Invoice',
      premium: false, // Free template
      page: {
        size: 'A4',
        margin: {
          top: 40,
          left: 40,
          right: 40,
          bottom: 40,
        },
        background: null,
      },
      elements: [
        {
          id: 'title_1',
          type: 'text',
          x: 40,
          y: 40,
          width: 300,
          height: 40,
          content: 'FAKTURA',
          fontFamily: 'Inter',
          fontSize: 28,
          fontWeight: 600,
          color: '#0d3e51',
          align: 'left',
        },
        {
          id: 'field_number',
          type: 'field',
          binding: 'invoice.invoice_number',
          x: 40,
          y: 100,
          width: 200,
          height: 20,
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: 400,
          color: '#0d3e51',
          align: 'left',
        },
        {
          id: 'field_date',
          type: 'field',
          binding: 'invoice.invoice_date',
          x: 40,
          y: 130,
          width: 200,
          height: 20,
          fontFamily: 'Inter',
          fontSize: 12,
          fontWeight: 400,
          color: '#6e8b97',
          align: 'left',
        },
        {
          id: 'items_table',
          type: 'table',
          binding: 'invoice.items',
          x: 40,
          y: 200,
          width: 500,
          height: 300,
          columns: [
            { header: 'Beskrivelse', field: 'description', width: 250, align: 'left' },
            { header: 'Antall', field: 'quantity', width: 50, align: 'right' },
            { header: 'Pris', field: 'unit_price', width: 80, align: 'right' },
            { header: 'MVA', field: 'vat_rate', width: 50, align: 'right' },
            { header: 'Total', field: 'line_total', width: 80, align: 'right' },
          ],
          rowHeight: 18,
          maxRows: 15,
        },
      ],
    };

    // Only create if it doesn't exist
    if (!this.loadTemplate('default_invoice')) {
      return this.saveTemplate(defaultTemplate);
    }
    return this.loadTemplate('default_invoice');
  }
}

module.exports = { TemplateStorage };

