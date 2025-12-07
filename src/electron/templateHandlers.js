const { TemplateStorage } = require('../db/templateStorage');

let templateStorage = null;

function getTemplateStorage() {
  if (!templateStorage) {
    templateStorage = new TemplateStorage();
  }
  return templateStorage;
}

function registerTemplateHandlers(ipcMain) {
  // List all templates
  ipcMain.handle('template:list', () => {
    const storage = getTemplateStorage();
    return storage.listTemplates();
  });

  // Load a template
  ipcMain.handle('template:load', (event, templateId) => {
    const storage = getTemplateStorage();
    return storage.loadTemplate(templateId);
  });

  // Save a template
  ipcMain.handle('template:save', (event, template) => {
    const storage = getTemplateStorage();
    return storage.saveTemplate(template);
  });

  // Delete a template
  ipcMain.handle('template:delete', (event, templateId) => {
    const storage = getTemplateStorage();
    return storage.deleteTemplate(templateId);
  });

  // Duplicate a template
  ipcMain.handle('template:duplicate', (event, templateId, newId, newName) => {
    const storage = getTemplateStorage();
    return storage.duplicateTemplate(templateId, newId, newName);
  });

  // Create default template
  ipcMain.handle('template:create-default', () => {
    const storage = getTemplateStorage();
    return storage.createDefaultTemplate();
  });

  // Save an image for a template element
  ipcMain.handle('template:save-image', (event, templateId, elementId, imageData) => {
    const storage = getTemplateStorage();
    return storage.saveImage(templateId, elementId, imageData);
  });

  // Get absolute path for an image
  ipcMain.handle('template:get-image-path', (event, imagePath) => {
    const storage = getTemplateStorage();
    return storage.getImagePath(imagePath);
  });

  // Read image file and return as data URL
  ipcMain.handle('template:read-image', async (event, imagePath) => {
    const fs = require('fs');
    const storage = getTemplateStorage();
    const absolutePath = storage.getImagePath(imagePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error('Image file not found');
    }
    
    const buffer = fs.readFileSync(absolutePath);
    const base64 = buffer.toString('base64');
    
    // Determine MIME type from file extension
    const ext = require('path').extname(absolutePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    const mimeType = mimeTypes[ext] || 'image/png';
    
    return `data:${mimeType};base64,${base64}`;
  });
}

module.exports = { registerTemplateHandlers };

