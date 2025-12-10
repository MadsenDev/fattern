/**
 * @fileoverview Template package import/export functionality
 * Handles .fattern-template files (zip archives)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const AdmZip = require('adm-zip');
const { validateTemplate } = require('./templateValidator');

/**
 * Exports a template to a .fattern-template package file
 * @param {string} templateId - ID of the template to export
 * @param {string} outputPath - Full path where the package should be saved
 * @param {Function} loadTemplate - Function to load template by ID
 * @param {Function} getTemplateDir - Function to get template directory path
 * @returns {Promise<void>}
 */
async function exportTemplateToPackage(templateId, outputPath, loadTemplate, getTemplateDir) {
  const template = loadTemplate(templateId);
  if (!template) {
    throw new Error(`Template with ID "${templateId}" not found`);
  }

  // Ensure template has complete metadata before exporting
  // This ensures author and other metadata fields are included
  if (!template.meta) {
    throw new Error('Template is missing metadata');
  }

  const templateDir = getTemplateDir(templateId);
  if (!fs.existsSync(templateDir)) {
    throw new Error(`Template directory not found: ${templateDir}`);
  }

  const zip = new AdmZip();

  // Write template.json with complete metadata to a temp file, then add to zip
  // This ensures we export the most up-to-date template with all metadata
  const tempJsonPath = path.join(os.tmpdir(), `template-export-${Date.now()}.json`);
  fs.writeFileSync(tempJsonPath, JSON.stringify(template, null, 2), 'utf8');
  zip.addLocalFile(tempJsonPath, '', 'template.json');
  
  // Clean up temp file after adding to zip
  try {
    fs.unlinkSync(tempJsonPath);
  } catch (error) {
    console.warn('Failed to delete temp template file:', error);
  }

  // Add preview.png if it exists
  const previewPath = path.join(templateDir, 'preview.png');
  if (fs.existsSync(previewPath)) {
    zip.addLocalFile(previewPath, '', 'preview.png');
  }

  // Add assets/ directory if it exists
  const assetsDir = path.join(templateDir, 'assets');
  if (fs.existsSync(assetsDir)) {
    zip.addLocalFolder(assetsDir, 'assets');
  }

  // Write zip file
  zip.writeZip(outputPath);
}

/**
 * Validates a template package without importing it
 * @param {string} packagePath - Full path to the .fattern-template file
 * @returns {Promise<{meta: Object, validationIssues: Array, warnings: string[]}>}
 */
async function validateTemplatePackage(packagePath) {
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Package file not found: ${packagePath}`);
  }

  // Create temporary directory for extraction
  const tempDir = path.join(os.tmpdir(), `fattern-template-validate-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Extract zip
    const zip = new AdmZip(packagePath);
    zip.extractAllTo(tempDir, true);

    // Validate structure - must have template.json
    const templateJsonPath = path.join(tempDir, 'template.json');
    if (!fs.existsSync(templateJsonPath)) {
      throw new Error('Package is missing template.json');
    }

    // Load and validate template
    const templateContent = fs.readFileSync(templateJsonPath, 'utf8');
    const template = JSON.parse(templateContent);

    // Validate template
    const validationIssues = validateTemplate(template);

    return {
      meta: template.meta,
      validationIssues,
      warnings: [],
    };
  } finally {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

/**
 * Imports a template from a .fattern-template package file
 * @param {string} packagePath - Full path to the .fattern-template file
 * @param {Function} getTemplateDir - Function to get template directory path
 * @param {Function} listTemplates - Function to list existing templates
 * @returns {Promise<{meta: Object, finalId: string, warnings: string[]}>}
 */
async function importTemplateFromPackage(packagePath, getTemplateDir, listTemplates) {
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Package file not found: ${packagePath}`);
  }

  // Create temporary directory for extraction
  const tempDir = path.join(os.tmpdir(), `fattern-template-import-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // Extract zip
    const zip = new AdmZip(packagePath);
    zip.extractAllTo(tempDir, true);

    // Validate structure - must have template.json
    const templateJsonPath = path.join(tempDir, 'template.json');
    if (!fs.existsSync(templateJsonPath)) {
      throw new Error('Package is missing template.json');
    }

    // Load and validate template
    const templateContent = fs.readFileSync(templateJsonPath, 'utf8');
    const template = JSON.parse(templateContent);

    // Validate template
    const validationIssues = validateTemplate(template);
    const errors = validationIssues.filter((issue) => issue.level === 'error');
    const warnings = validationIssues.filter((issue) => issue.level === 'warning');

    if (errors.length > 0) {
      const errorMessages = errors.map((e) => `${e.path}: ${e.message}`).join('; ');
      throw new Error(`Template validation failed: ${errorMessages}`);
    }

    // Check for ID conflicts
    const existingTemplates = listTemplates();
    let finalId = template.meta.id;
    let counter = 1;

    while (existingTemplates.some((t) => t.meta && t.meta.id === finalId)) {
      finalId = `${template.meta.id}-imported-${counter}`;
      counter++;
    }

    // If ID changed, update the template
    if (finalId !== template.meta.id) {
      template.meta.id = finalId;
      warnings.push(`Template ID changed to "${finalId}" to avoid conflict`);
    }

    // Create template directory
    const templateDir = getTemplateDir(finalId);
    fs.mkdirSync(templateDir, { recursive: true });

    // Copy template.json
    fs.copyFileSync(templateJsonPath, path.join(templateDir, 'template.json'));

    // Copy preview.png if it exists
    const tempPreviewPath = path.join(tempDir, 'preview.png');
    if (fs.existsSync(tempPreviewPath)) {
      fs.copyFileSync(tempPreviewPath, path.join(templateDir, 'preview.png'));
    }

    // Copy assets/ directory if it exists
    const tempAssetsDir = path.join(tempDir, 'assets');
    const finalAssetsDir = path.join(templateDir, 'assets');
    if (fs.existsSync(tempAssetsDir)) {
      fs.mkdirSync(finalAssetsDir, { recursive: true });
      copyDirectoryRecursive(tempAssetsDir, finalAssetsDir);
    }

    return {
      meta: template.meta,
      finalId,
      warnings: warnings.map((w) => w.message),
    };
  } finally {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

/**
 * Recursively copy a directory
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 */
function copyDirectoryRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

module.exports = { exportTemplateToPackage, importTemplateFromPackage, validateTemplatePackage };

