/**
 * CSV Mapping Presets
 * 
 * Allows users to save and load common CSV column mappings
 */

const PRESETS_KEY = 'fattern:csv-presets';

export function getCSVPresets() {
  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load CSV presets', error);
    return [];
  }
}

export function saveCSVPreset(name, type, mapping, delimiter) {
  try {
    const presets = getCSVPresets();
    const newPreset = {
      id: `preset-${Date.now()}`,
      name,
      type, // 'customer' or 'product'
      mapping,
      delimiter,
      created_at: new Date().toISOString(),
    };
    presets.push(newPreset);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return newPreset;
  } catch (error) {
    console.error('Failed to save CSV preset', error);
    throw error;
  }
}

export function deleteCSVPreset(presetId) {
  try {
    const presets = getCSVPresets();
    const filtered = presets.filter((p) => p.id !== presetId);
    localStorage.setItem(PRESETS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete CSV preset', error);
    throw error;
  }
}

export function getCSVPresetsByType(type) {
  const presets = getCSVPresets();
  return presets.filter((p) => p.type === type);
}

