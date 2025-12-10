/**
 * Template Definitions Index
 * Central registry for all invoice template definitions
 */

const defaultTemplate = require('./default');
const presetModernMinimal = require('./preset_modern_minimal');
const premiumLuxury = require('./premium_luxury');
const premiumModernPro = require('./premium_modern_pro');
const premiumClassicElite = require('./premium_classic_elite');
// Additional templates will be imported here as they are created

module.exports = {
  default: defaultTemplate,
  presets: [
    presetModernMinimal,
    // Additional preset templates will be added here
  ],
  premium: [
    premiumLuxury,
    premiumModernPro,
    premiumClassicElite,
  ],
  
  // Helper function to get all templates
  getAllTemplates() {
    return [
      this.default,
      ...this.presets,
      ...this.premium,
    ];
  },
  
  // Helper function to get template by ID
  getTemplateById(id) {
    const all = this.getAllTemplates();
    return all.find(t => t.id === id);
  },
};

