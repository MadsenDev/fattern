/**
 * @fileoverview Template validation and compatibility checking
 */

const path = require('path');
const packageJson = require('../../package.json');

const DEFAULT_APP_VERSION = packageJson.version || '1.0.0';

/**
 * Validates a template definition
 * @param {import('./templateTypes').TemplateDefinition} def - Template definition to validate
 * @param {string} currentAppVersion - Current app version (defaults to package.json version)
 * @returns {import('./templateTypes').TemplateValidationIssue[]} Array of validation issues
 */
function validateTemplate(def, currentAppVersion = DEFAULT_APP_VERSION) {
  const issues = [];

  if (!def) {
    return [{ path: 'root', message: 'Template definition is missing', level: 'error' }];
  }

  // Check schemaVersion
  if (def.schemaVersion === undefined) {
    issues.push({
      path: 'schemaVersion',
      message: 'Schema version is missing. Assuming version 1 for compatibility.',
      level: 'warning',
    });
  } else if (typeof def.schemaVersion !== 'number' || def.schemaVersion < 1) {
    issues.push({
      path: 'schemaVersion',
      message: `Invalid schema version: ${def.schemaVersion}. Supported version is 1.`,
      level: 'error',
    });
  } else if (def.schemaVersion > 1) {
    issues.push({
      path: 'schemaVersion',
      message: `Template requires schema version ${def.schemaVersion}, but app only supports version 1.`,
      level: 'error',
    });
  }

  // Validate meta
  if (!def.meta) {
    issues.push({
      path: 'meta',
      message: 'Template metadata (meta) is required',
      level: 'error',
    });
    return issues; // Can't continue without meta
  }

  const meta = def.meta;

  // Required meta fields
  if (!meta.id || typeof meta.id !== 'string' || meta.id.trim() === '') {
    issues.push({
      path: 'meta.id',
      message: 'Template ID is required and must be a non-empty string',
      level: 'error',
    });
  }

  if (!meta.name || typeof meta.name !== 'string' || meta.name.trim() === '') {
    issues.push({
      path: 'meta.name',
      message: 'Template name is required and must be a non-empty string',
      level: 'error',
    });
  }

  if (!meta.version || typeof meta.version !== 'string') {
    issues.push({
      path: 'meta.version',
      message: 'Template version is required and must be a string',
      level: 'error',
    });
  } else {
    // Basic SemVer check (loose)
    const semverPattern = /^\d+\.\d+\.\d+(-.+)?$/;
    if (!semverPattern.test(meta.version)) {
      issues.push({
        path: 'meta.version',
        message: `Template version "${meta.version}" should follow SemVer format (e.g., "1.0.0")`,
        level: 'warning',
      });
    }
  }

  // Check minAppVersion compatibility
  if (meta.minAppVersion) {
    if (compareVersions(meta.minAppVersion, currentAppVersion) > 0) {
      issues.push({
        path: 'meta.minAppVersion',
        message: `Template requires app version ${meta.minAppVersion} or higher, but current version is ${currentAppVersion}`,
        level: 'error',
      });
    }
  }

  // Validate page
  if (!def.page) {
    issues.push({
      path: 'page',
      message: 'Page configuration is required',
      level: 'error',
    });
  } else {
    const allowedSizes = ['A4', 'Letter'];
    if (!allowedSizes.includes(def.page.size)) {
      issues.push({
        path: 'page.size',
        message: `Page size must be one of: ${allowedSizes.join(', ')}`,
        level: 'error',
      });
    }

    if (!def.page.margin) {
      issues.push({
        path: 'page.margin',
        message: 'Page margins are required',
        level: 'error',
      });
    } else {
      const marginFields = ['top', 'right', 'bottom', 'left'];
      marginFields.forEach((field) => {
        if (typeof def.page.margin[field] !== 'number' || def.page.margin[field] < 0) {
          issues.push({
            path: `page.margin.${field}`,
            message: `Margin ${field} must be a non-negative number`,
            level: 'error',
          });
        }
      });
    }
  }

  // Validate elements
  if (!Array.isArray(def.elements)) {
    issues.push({
      path: 'elements',
      message: 'Elements must be an array',
      level: 'error',
    });
  } else {
    def.elements.forEach((element, index) => {
      const elementPath = `elements[${index}]`;

      // Required fields
      if (!element.id || typeof element.id !== 'string') {
        issues.push({
          path: `${elementPath}.id`,
          message: 'Element ID is required',
          level: 'error',
        });
      }

      const allowedTypes = ['text', 'field', 'image', 'table', 'shape'];
      if (!element.type || !allowedTypes.includes(element.type)) {
        issues.push({
          path: `${elementPath}.type`,
          message: `Element type must be one of: ${allowedTypes.join(', ')}`,
          level: 'error',
        });
      }

      // Position and size
      const numericFields = ['x', 'y', 'width', 'height'];
      numericFields.forEach((field) => {
        if (typeof element[field] !== 'number' || element[field] < 0) {
          issues.push({
            path: `${elementPath}.${field}`,
            message: `${field} must be a non-negative number`,
            level: 'error',
          });
        }
      });

      // Reasonable bounds check (A4 is ~794x1123 points at 96 DPI)
      if (element.x !== undefined && element.x > 1000) {
        issues.push({
          path: `${elementPath}.x`,
          message: `X position (${element.x}) seems unreasonably large for A4 page`,
          level: 'warning',
        });
      }
      if (element.y !== undefined && element.y > 1500) {
        issues.push({
          path: `${elementPath}.y`,
          message: `Y position (${element.y}) seems unreasonably large for A4 page`,
          level: 'warning',
        });
      }

      // Image-specific validation
      if (element.type === 'image' && element.src) {
        // Check that image paths are relative and under assets/
        if (path.isAbsolute(element.src)) {
          issues.push({
            path: `${elementPath}.src`,
            message: 'Image paths must be relative (not absolute). Use paths like "assets/logo.png"',
            level: 'error',
          });
        } else if (!element.src.startsWith('assets/')) {
          issues.push({
            path: `${elementPath}.src`,
            message: 'Image paths should be under assets/ directory (e.g., "assets/logo.png")',
            level: 'warning',
          });
        }
      }

      // Table-specific validation
      if (element.type === 'table') {
        if (!Array.isArray(element.columns)) {
          issues.push({
            path: `${elementPath}.columns`,
            message: 'Table columns must be an array',
            level: 'error',
          });
        } else {
          element.columns.forEach((col, colIndex) => {
            if (!col.header || typeof col.header !== 'string') {
              issues.push({
                path: `${elementPath}.columns[${colIndex}].header`,
                message: 'Column header is required',
                level: 'error',
              });
            }
            if (!col.field || typeof col.field !== 'string') {
              issues.push({
                path: `${elementPath}.columns[${colIndex}].field`,
                message: 'Column field is required',
                level: 'error',
              });
            }
          });
        }
      }
    });
  }

  return issues;
}

/**
 * Simple version comparison
 * @param {string} v1 - Version 1
 * @param {string} v2 - Version 2
 * @returns {number} -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    if (part1 < part2) return -1;
    if (part1 > part2) return 1;
  }
  return 0;
}

module.exports = { validateTemplate, compareVersions };

