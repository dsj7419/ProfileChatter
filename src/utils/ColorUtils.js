/**
 * Color utilities for dynamic contrast and color manipulation
 */

/**
 * Calculate contrast ratio between two hex colors
 * @param {string} color1 - First color in hex format (e.g. '#ffffff')
 * @param {string} color2 - Second color in hex format (e.g. '#000000')
 * @returns {number} - Contrast ratio (1-21)
 */
export function getContrastRatio(color1, color2) {
    // Convert hex to RGB
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
  
    // Calculate relative luminance
    const l1 = getLuminance(rgb1);
    const l2 = getLuminance(rgb2);
  
    // Calculate contrast ratio
    const ratio = l1 > l2 
      ? (l1 + 0.05) / (l2 + 0.05)
      : (l2 + 0.05) / (l1 + 0.05);
  
    return ratio;
  }
  
  /**
   * Convert hex color to RGB
   * @param {string} hex - Color in hex format (e.g. '#ffffff')
   * @returns {Object} - RGB values { r, g, b }
   */
  function hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');
  
    // Parse 3-digit hex
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
  
    // Parse hex to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
  
    return { r, g, b };
  }
  
  /**
   * Calculate relative luminance from RGB values
   * @param {Object} rgb - RGB values { r, g, b }
   * @returns {number} - Relative luminance
   */
  function getLuminance(rgb) {
    // Convert RGB to sRGB
    const srgb = {
      r: rgb.r / 255,
      g: rgb.g / 255,
      b: rgb.b / 255
    };
  
    // Apply gamma correction
    const gammaCorrected = {
      r: srgb.r <= 0.03928 ? srgb.r / 12.92 : Math.pow((srgb.r + 0.055) / 1.055, 2.4),
      g: srgb.g <= 0.03928 ? srgb.g / 12.92 : Math.pow((srgb.g + 0.055) / 1.055, 2.4),
      b: srgb.b <= 0.03928 ? srgb.b / 12.92 : Math.pow((srgb.b + 0.055) / 1.055, 2.4)
    };
  
    // Calculate relative luminance
    return 0.2126 * gammaCorrected.r + 0.7152 * gammaCorrected.g + 0.0722 * gammaCorrected.b;
  }
  
  /**
   * Darken a color by a specified amount
   * @param {string} color - Color in hex format (e.g. '#ffffff')
   * @param {number} amount - Amount to darken (0-1)
   * @returns {string} - Darkened color in hex format
   */
  export function darken(color, amount) {
    const rgb = hexToRgb(color);
    
    return rgbToHex({
      r: Math.max(0, Math.floor(rgb.r * (1 - amount))),
      g: Math.max(0, Math.floor(rgb.g * (1 - amount))),
      b: Math.max(0, Math.floor(rgb.b * (1 - amount)))
    });
  }
  
  /**
   * Lighten a color by a specified amount
   * @param {string} color - Color in hex format (e.g. '#000000')
   * @param {number} amount - Amount to lighten (0-1)
   * @returns {string} - Lightened color in hex format
   */
  export function lighten(color, amount) {
    const rgb = hexToRgb(color);
    
    return rgbToHex({
      r: Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount)),
      g: Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount)),
      b: Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount))
    });
  }
  
  /**
   * Convert RGB to hex color
   * @param {Object} rgb - RGB values { r, g, b }
   * @returns {string} - Color in hex format (e.g. '#ffffff')
   */
  function rgbToHex(rgb) {
    return '#' + [rgb.r, rgb.g, rgb.b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');
  }