/**
 * Validate latitude value (-90 to 90)
 * @param {number|string} lat
 */
export function isValidLatitude(lat) {
  const num = Number(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
}

/**
 * Validate longitude value (-180 to 180)
 * @param {number|string} lon
 */
export function isValidLongitude(lon) {
  const num = Number(lon);
  return !isNaN(num) && num >= -180 && num <= 180;
}

/**
 * Validate image file
 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'Please select an image file.' };
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'Invalid file type. Please upload a JPG, PNG, or WEBP image.' };
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Image size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 5MB limit.` };
  }

  return { valid: true };
}
