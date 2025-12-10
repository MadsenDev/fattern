/**
 * Utility functions for template operations in settings
 */

export function getTemplateId(template) {
  return template.meta?.id || template.id;
}

export function getTemplateName(template) {
  return template.meta?.name || template.name;
}

export function getTemplateMeta(template) {
  return template.meta || {};
}

export function isTemplatePremium(template) {
  const meta = getTemplateMeta(template);
  return meta.premium || template.premium === true;
}

export function isTemplateLocked(template, isSupporter) {
  return isTemplatePremium(template) && !isSupporter;
}

export function isTemplateDefault(templateId, defaultTemplateId) {
  return templateId === defaultTemplateId;
}

export function isTemplatePreset(templateId) {
  return templateId.startsWith('preset_');
}

export function isTemplateBuiltIn(templateId) {
  return templateId === 'default_invoice' || 
         templateId.startsWith('preset_') || 
         templateId.startsWith('premium_');
}

export function isTemplateCustom(templateId) {
  return !isTemplateBuiltIn(templateId);
}

