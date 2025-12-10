/**
 * @fileoverview Template migration utilities
 * Converts old template format to new TemplateDefinition format
 */

/**
 * Migrates an old template format to the new TemplateDefinition format
 * @param {Object} oldTemplate - Old template format (has id, name, premium, page, elements at root)
 * @returns {import('./templateTypes').TemplateDefinition} New format template
 */
function migrateTemplateToNewFormat(oldTemplate) {
  if (!oldTemplate) {
    throw new Error('Template is required');
  }

  // Check if already in new format
  if (oldTemplate.schemaVersion && oldTemplate.meta) {
    return oldTemplate;
  }

  // Extract metadata from old format
  const now = new Date().toISOString();
  const meta = {
    id: oldTemplate.id || 'unknown',
    name: oldTemplate.name || 'Unnamed Template',
    version: '1.0.0', // Default version for migrated templates
    premium: oldTemplate.premium || false,
    createdAt: now,
    updatedAt: now,
  };

  // Add description if available
  if (oldTemplate.description) {
    meta.description = oldTemplate.description;
  }

  // Create new format template
  const newTemplate = {
    schemaVersion: 1,
    meta,
    page: oldTemplate.page || {
      size: 'A4',
      margin: { top: 40, right: 40, bottom: 40, left: 40 },
      background: null,
    },
    elements: oldTemplate.elements || [],
  };

  // Migrate image paths from old format (images/...) to new format (assets/...)
  if (newTemplate.elements) {
    newTemplate.elements.forEach((element) => {
      if (element.type === 'image' && element.src) {
        // Convert old images/ paths to assets/
        if (element.src.startsWith('images/')) {
          element.src = element.src.replace('images/', 'assets/');
        } else if (!element.src.startsWith('assets/') && !element.src.startsWith('data:')) {
          // If it's a relative path but not in assets/, assume it should be
          const filename = element.src.split('/').pop();
          element.src = `assets/${filename}`;
        }
      }
    });
  }

  return newTemplate;
}

/**
 * Checks if a template is in the old format
 * @param {Object} template - Template to check
 * @returns {boolean} True if template is in old format
 */
function isOldFormat(template) {
  return !template.schemaVersion || !template.meta;
}

module.exports = { migrateTemplateToNewFormat, isOldFormat };

