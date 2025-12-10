/**
 * @fileoverview Template type definitions for Fattern invoice templates
 * These types define the structure for marketplace-ready templates
 */

/**
 * @typedef {Object} TemplateMeta
 * @property {string} id - Stable identifier, e.g. "nordic-clean"
 * @property {string} name - Human-readable name
 * @property {string} [description] - Template description
 * @property {string} [author] - Template creator name
 * @property {string} [authorUrl] - Author website/URL
 * @property {string} version - Template version, e.g. "1.0.0"
 * @property {string} [minAppVersion] - Minimum app version required, e.g. "1.0.0"
 * @property {string} [createdAt] - ISO date string
 * @property {string} [updatedAt] - ISO date string
 * @property {string[]} [tags] - Tags for categorization, e.g. ["minimal", "norsk"]
 * @property {boolean} [premium] - Whether template requires Supporter Pack
 * @property {string} [license] - License type, e.g. "commercial-use"
 * @property {string} [previewImage] - Path to preview image (relative to template dir)
 */

/**
 * @typedef {Object} TemplatePage
 * @property {"A4"|"Letter"} size - Page size
 * @property {Object} margin - Page margins
 * @property {number} margin.top
 * @property {number} margin.right
 * @property {number} margin.bottom
 * @property {number} margin.left
 * @property {string|null} [background] - Background color or null
 */

/**
 * @typedef {Object} TemplateElement
 * @property {string} id - Unique element identifier
 * @property {string} type - Element type: "text" | "field" | "image" | "table" | "shape"
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} width - Element width
 * @property {number} height - Element height
 * @property {number} [zIndex] - Stacking order
 * @property {string} [content] - Text content (for text elements)
 * @property {string} [binding] - Data binding (for field/table elements)
 * @property {string} [src] - Image source path (for image elements, relative to assets/)
 * @property {string} [shapeType] - Shape type: "rectangle" | "circle" | "line" (for shape elements)
 * @property {Object} [columns] - Table columns (for table elements)
 * @property {Object} [style] - Additional styling properties
 */

/**
 * @typedef {Object} TemplateDefinition
 * @property {number} schemaVersion - Template schema version (currently 1)
 * @property {TemplateMeta} meta - Template metadata
 * @property {TemplatePage} page - Page configuration
 * @property {TemplateElement[]} elements - Template elements
 */

/**
 * @typedef {Object} TemplateValidationIssue
 * @property {string} path - Path to the issue, e.g. "meta.name" or "elements[3].table.columns[1]"
 * @property {string} message - Human-readable error message
 * @property {"error"|"warning"} level - Issue severity
 */

/**
 * @typedef {"local"|"bundled"|"marketplace"} TemplateSource
 */

/**
 * @typedef {Object} TemplateRegistryItem
 * @property {TemplateDefinition} template - The template definition
 * @property {TemplateSource} source - Where the template came from
 * @property {string} [installedFromPackage] - Package file path (for imported templates)
 */

module.exports = {};

