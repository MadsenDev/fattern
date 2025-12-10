const fs = require('fs');
const path = require('path');
const os = require('os');
const templateDefinitions = require('./templates');
const { migrateTemplateToNewFormat, isOldFormat } = require('./templateMigration');

class TemplateStorage {
  constructor() {
    this.templatesDir = path.join(os.homedir(), 'Fattern', 'data', 'templates');
    // Legacy: keep imagesDir for backward compatibility during migration
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
    // Keep legacy images dir for backward compatibility
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
  }

  /**
   * Get template directory path (new format)
   * @param {string} templateId
   * @returns {string}
   */
  getTemplateDir(templateId) {
    return path.join(this.templatesDir, templateId);
  }

  /**
   * Get template.json path (new format)
   * @param {string} templateId
   * @returns {string}
   */
  getTemplateJsonPath(templateId) {
    return path.join(this.getTemplateDir(templateId), 'template.json');
  }

  /**
   * Get template path (old format - for backward compatibility)
   * @param {string} templateId
   * @returns {string}
   */
  getTemplatePath(templateId) {
    return path.join(this.templatesDir, `${templateId}.json`);
  }

  /**
   * Check if template exists in new format
   * @param {string} templateId
   * @returns {boolean}
   */
  existsInNewFormat(templateId) {
    return fs.existsSync(this.getTemplateJsonPath(templateId));
  }

  /**
   * Check if template exists in old format
   * @param {string} templateId
   * @returns {boolean}
   */
  existsInOldFormat(templateId) {
    return fs.existsSync(this.getTemplatePath(templateId));
  }

  /**
   * Migrate old format template to new format
   * @param {string} templateId
   * @returns {Object|null} Migrated template or null if not found
   */
  migrateTemplate(templateId) {
    if (!this.existsInOldFormat(templateId)) {
      return null;
    }

    const oldTemplate = this.loadTemplateOldFormat(templateId);
    if (!oldTemplate) {
      return null;
    }

    // Migrate to new format
    const newTemplate = migrateTemplateToNewFormat(oldTemplate);

    // Ensure template directory exists
    const templateDir = this.getTemplateDir(templateId);
    fs.mkdirSync(templateDir, { recursive: true });

    // Create assets directory
    const assetsDir = path.join(templateDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    // Migrate images from old images/ directory to new assets/ directory
    if (newTemplate.elements) {
      newTemplate.elements.forEach((element) => {
        if (element.type === 'image' && element.src) {
          // If it's an old images/ path, migrate the file
          if (element.src.startsWith('images/')) {
            const oldImagePath = path.join(this.templatesDir, element.src);
            if (fs.existsSync(oldImagePath)) {
              const filename = path.basename(element.src);
              const newImagePath = path.join(assetsDir, filename);
              fs.copyFileSync(oldImagePath, newImagePath);
              // Update path to assets/
              element.src = `assets/${filename}`;
            }
          }
        }
      });
    }

    // Save in new format
    this.saveTemplate(newTemplate);

    // Optionally delete old format file (keep for safety during transition)
    // fs.unlinkSync(this.getTemplatePath(templateId));

    return newTemplate;
  }

  /**
   * Load template (supports both old and new formats with auto-migration)
   * @param {string} templateId
   * @returns {Object|null}
   */
  loadTemplate(templateId) {
    // Try new format first
    if (this.existsInNewFormat(templateId)) {
      const filepath = this.getTemplateJsonPath(templateId);
      const content = fs.readFileSync(filepath, 'utf8');
      const template = JSON.parse(content);
      
      // Ensure it's in new format (migrate if needed)
      if (isOldFormat(template)) {
        const migrated = migrateTemplateToNewFormat(template);
        this.saveTemplate(migrated);
        return migrated;
      }
      
      return template;
    }

    // Try old format and migrate
    if (this.existsInOldFormat(templateId)) {
      return this.migrateTemplate(templateId);
    }

    return null;
  }

  /**
   * Load template in old format (for migration purposes)
   * @param {string} templateId
   * @returns {Object|null}
   */
  loadTemplateOldFormat(templateId) {
    const filepath = this.getTemplatePath(templateId);
    if (!fs.existsSync(filepath)) {
      return null;
    }
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Save template (always saves in new format)
   * @param {Object} template
   * @param {Object} options - Optional: company name for default author
   * @returns {Object}
   */
  saveTemplate(template, options = {}) {
    // Ensure template is in new format
    let templateToSave = template;
    if (isOldFormat(template)) {
      templateToSave = migrateTemplateToNewFormat(template);
    }

    // Ensure schemaVersion and meta exist
    if (!templateToSave.schemaVersion) {
      templateToSave.schemaVersion = 1;
    }
    if (!templateToSave.meta) {
      throw new Error('Template must have meta property');
    }

    // Ensure required meta fields
    if (!templateToSave.meta.version) {
      templateToSave.meta.version = '1.0.0';
    }

    // Preserve existing metadata fields (don't overwrite if they exist)
    // Set default author from company name if not set
    if (!templateToSave.meta.author && options.companyName) {
      templateToSave.meta.author = options.companyName;
    }

    // Ensure all metadata fields are preserved when saving
    // This ensures that when templates are edited and saved, metadata is not lost
    const existingTemplate = this.loadTemplate(templateId);
    if (existingTemplate && existingTemplate.meta) {
      // Preserve existing metadata that might not be in the updated template
      templateToSave.meta = {
        ...existingTemplate.meta, // Preserve existing metadata
        ...templateToSave.meta,   // Override with new values
        id: templateToSave.meta.id, // Ensure ID is correct
        name: templateToSave.meta.name, // Ensure name is correct
        updatedAt: templateToSave.meta.updatedAt, // Use new updatedAt
      };
    }

    const templateId = templateToSave.meta.id;
    const templateDir = this.getTemplateDir(templateId);
    const assetsDir = path.join(templateDir, 'assets');

    // Ensure directories exist
    fs.mkdirSync(templateDir, { recursive: true });
    fs.mkdirSync(assetsDir, { recursive: true });

    // Update updatedAt timestamp
    templateToSave.meta.updatedAt = new Date().toISOString();
    if (!templateToSave.meta.createdAt) {
      templateToSave.meta.createdAt = new Date().toISOString();
    }

    // Save template.json
    const filepath = this.getTemplateJsonPath(templateId);
    fs.writeFileSync(filepath, JSON.stringify(templateToSave, null, 2), 'utf8');

    return templateToSave;
  }

  /**
   * List all templates (supports both formats)
   * @returns {Array<Object>}
   */
  listTemplates() {
    if (!fs.existsSync(this.templatesDir)) {
      return [];
    }

    const templates = [];
    const entries = fs.readdirSync(this.templatesDir, { withFileTypes: true });

    // Process new format (directories with template.json)
    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const templateId = entry.name;
        const templateJsonPath = this.getTemplateJsonPath(templateId);
        if (fs.existsSync(templateJsonPath)) {
          const template = this.loadTemplate(templateId);
          if (template) {
            templates.push(template);
          }
        }
      }
    });

    // Process old format (JSON files) and migrate
    entries.forEach((entry) => {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        const templateId = path.basename(entry.name, '.json');
        // Only migrate if not already in new format
        if (!this.existsInNewFormat(templateId)) {
          const template = this.migrateTemplate(templateId);
          if (template) {
            templates.push(template);
          }
        }
      }
    });

    return templates;
  }

  /**
   * Delete template (new format)
   * @param {string} templateId
   * @returns {boolean}
   */
  deleteTemplate(templateId) {
    const template = this.loadTemplate(templateId);
    if (template) {
      // Clean up associated assets
      this.cleanupTemplateAssets(template);
    }

    // Delete new format directory
    const templateDir = this.getTemplateDir(templateId);
    if (fs.existsSync(templateDir)) {
      fs.rmSync(templateDir, { recursive: true, force: true });
      return true;
    }

    // Also try old format (for cleanup)
    const oldPath = this.getTemplatePath(templateId);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
      return true;
    }

    return false;
  }

  /**
   * Duplicate template
   * @param {string} templateId
   * @param {string} newId
   * @param {string} newName
   * @returns {Object|null}
   */
  duplicateTemplate(templateId, newId, newName) {
    const original = this.loadTemplate(templateId);
    if (!original) {
      return null;
    }

    // Create duplicate with new ID and name
    const duplicate = {
      ...original,
      meta: {
        ...original.meta,
        id: newId,
        name: newName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    // Copy assets if they exist
    const originalDir = this.getTemplateDir(templateId);
    const originalAssetsDir = path.join(originalDir, 'assets');
    const newDir = this.getTemplateDir(newId);
    const newAssetsDir = path.join(newDir, 'assets');

    if (fs.existsSync(originalAssetsDir)) {
      fs.mkdirSync(newAssetsDir, { recursive: true });
      this.copyDirectoryRecursive(originalAssetsDir, newAssetsDir);
    }

    return this.saveTemplate(duplicate);
  }

  /**
   * Save an image file and return the relative path (new format: assets/)
   * @param {string} templateId
   * @param {string} elementId
   * @param {string} imageData - Data URL or file path
   * @returns {string} Relative path (assets/filename.ext)
   */
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

    // Ensure template directory and assets folder exist
    const templateDir = this.getTemplateDir(templateId);
    const assetsDir = path.join(templateDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${elementId}_${timestamp}.${extension}`;
    const filepath = path.join(assetsDir, filename);

    // Save the file
    fs.writeFileSync(filepath, buffer);

    // Return relative path from template root
    return `assets/${filename}`;
  }

  /**
   * Get absolute path for an image
   * @param {string} templateId
   * @param {string} imagePath - Relative path (assets/filename.ext) or absolute path
   * @returns {string|null}
   */
  getImagePath(templateId, imagePath) {
    if (!imagePath) return null;

    // If it's already an absolute path, return it
    if (path.isAbsolute(imagePath)) {
      return imagePath;
    }

    // If it's a data URL, return as-is
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }

    // Try new format first (assets/)
    if (imagePath.startsWith('assets/')) {
      const templateDir = this.getTemplateDir(templateId);
      return path.join(templateDir, imagePath);
    }

    // Try legacy images/ format (for backward compatibility)
    if (imagePath.startsWith('images/')) {
      return path.join(this.templatesDir, imagePath);
    }

    // Assume it's relative to template directory
    const templateDir = this.getTemplateDir(templateId);
    return path.join(templateDir, imagePath);
  }

  /**
   * Delete an image file
   * @param {string} templateId
   * @param {string} imagePath
   * @returns {boolean}
   */
  deleteImage(templateId, imagePath) {
    if (!imagePath) return false;
    const fullPath = this.getImagePath(templateId, imagePath);
    if (fullPath && fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }

  /**
   * Clean up unused assets (called when template is deleted)
   * @param {Object} template
   */
  cleanupTemplateAssets(template) {
    if (!template || !template.elements) return;

    const templateId = template.meta?.id;
    if (!templateId) return;

    const assetsDir = path.join(this.getTemplateDir(templateId), 'assets');
    if (!fs.existsSync(assetsDir)) return;

    // Get all asset files
    const assetFiles = fs.readdirSync(assetsDir);
    const usedAssets = new Set();

    // Find all used assets
    template.elements.forEach((element) => {
      if (element.type === 'image' && element.src) {
        if (element.src.startsWith('assets/')) {
          const filename = path.basename(element.src);
          usedAssets.add(filename);
        }
      }
    });

    // Delete unused assets
    assetFiles.forEach((file) => {
      if (!usedAssets.has(file)) {
        const filepath = path.join(assetsDir, file);
        try {
          fs.unlinkSync(filepath);
        } catch (error) {
          console.warn(`Failed to delete asset ${filepath}:`, error);
        }
      }
    });
  }

  /**
   * Recursively copy a directory
   * @param {string} src
   * @param {string} dest
   */
  copyDirectoryRecursive(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectoryRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Create default template
   * @returns {Object}
   */
  createDefaultTemplate() {
    const defaultTemplate = templateDefinitions.default;

    // Only create if it doesn't exist
    if (!this.loadTemplate('default_invoice')) {
      return this.saveTemplate(defaultTemplate);
    }
    return this.loadTemplate('default_invoice');
  }

  /**
   * Creates preset templates with different styles
   * Only creates templates that don't already exist
   */
  createPresetTemplates() {
    const presets = [];
    const templateDefs = templateDefinitions.presets || [];

    // Create templates from definitions
    templateDefs.forEach((templateDef) => {
      if (!this.loadTemplate(templateDef.meta?.id || templateDef.id)) {
        presets.push(templateDef);
      }
    });

    // Save all presets
    const created = [];
    presets.forEach((preset) => {
      const saved = this.saveTemplate(preset);
      created.push(saved);
    });

    return created;
  }

  /**
   * Creates premium templates - super professional designs
   * Only creates templates that don't already exist
   * These templates are supporter-locked
   */
  createPremiumTemplates() {
    const presets = [];
    const templateDefs = templateDefinitions.premium || [];

    // Create templates from definitions
    templateDefs.forEach((templateDef) => {
      const templateId = templateDef.meta?.id || templateDef.id;
      if (!this.loadTemplate(templateId)) {
        presets.push(templateDef);
      }
    });

    // Save all premium presets
    const created = [];
    presets.forEach((preset) => {
      const saved = this.saveTemplate(preset);
      created.push(saved);
    });

    return created;
  }
}

module.exports = { TemplateStorage };
