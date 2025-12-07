/**
 * Converts a file to a data URL (base64)
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Validates if a file is an image
 */
export function isImageFile(file) {
  return file && file.type.startsWith('image/');
}

/**
 * Validates image file size (max 5MB)
 */
export function validateImageSize(file, maxSizeMB = 5) {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`Bildet er for stort. Maks størrelse er ${maxSizeMB}MB.`);
  }
  return true;
}

