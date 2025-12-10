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
    // Get company name for default author if not set
    const { FatternDatabase } = require('../db/fatternDatabase');
    const database = new FatternDatabase();
    const company = database.ensureCompany();
    return storage.saveTemplate(template, { companyName: company?.name });
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

  // Create preset templates
  ipcMain.handle('template:create-presets', () => {
    try {
      const storage = getTemplateStorage();
      const result = storage.createPresetTemplates();
      console.log('createPresetTemplates returned:', result);
      return result;
    } catch (error) {
      console.error('Error creating preset templates:', error);
      throw error;
    }
  });

  // Create premium templates
  ipcMain.handle('template:create-premium', () => {
    try {
      const storage = getTemplateStorage();
      const result = storage.createPremiumTemplates();
      console.log('createPremiumTemplates returned:', result);
      return result;
    } catch (error) {
      console.error('Error creating premium templates:', error);
      throw error;
    }
  });

  // Save an image for a template element
  ipcMain.handle('template:save-image', (event, templateId, elementId, imageData) => {
    const storage = getTemplateStorage();
    return storage.saveImage(templateId, elementId, imageData);
  });

  // Get absolute path for an image
  ipcMain.handle('template:get-image-path', (event, templateId, imagePath) => {
    const storage = getTemplateStorage();
    return storage.getImagePath(templateId, imagePath);
  });

  // Read image file and return as data URL
  ipcMain.handle('template:read-image', async (event, templateId, imagePath) => {
    const fs = require('fs');
    const storage = getTemplateStorage();
    const absolutePath = storage.getImagePath(templateId, imagePath);
    
    if (!absolutePath || !fs.existsSync(absolutePath)) {
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

  // Export template to package
  ipcMain.handle('template:export-package', async (event, templateId, outputPath) => {
    const { exportTemplateToPackage } = require('../db/templatePackage');
    const storage = getTemplateStorage();
    
    await exportTemplateToPackage(
      templateId,
      outputPath,
      (id) => storage.loadTemplate(id),
      (id) => storage.getTemplateDir(id)
    );
    
    return { success: true, filepath: outputPath };
  });

  // Import template from package
  ipcMain.handle('template:import-package', async (event, packagePath) => {
    const { importTemplateFromPackage } = require('../db/templatePackage');
    const storage = getTemplateStorage();
    
    const result = await importTemplateFromPackage(
      packagePath,
      (id) => storage.getTemplateDir(id),
      () => storage.listTemplates()
    );
    
    return result;
  });

  // Validate template
  ipcMain.handle('template:validate', (event, template) => {
    const { validateTemplate } = require('../db/templateValidator');
    const packageJson = require('../../package.json');
    const currentVersion = packageJson.version || '1.0.0';
    
    return validateTemplate(template, currentVersion);
  });

  // Validate template package (without importing)
  ipcMain.handle('template:validate-package', async (event, packagePath) => {
    const { validateTemplatePackage } = require('../db/templatePackage');
    return await validateTemplatePackage(packagePath);
  });
}

module.exports = { registerTemplateHandlers };

