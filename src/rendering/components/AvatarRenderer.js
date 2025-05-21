/**
 * AvatarRenderer.js
 * Responsible for rendering avatar elements within the SVG chat visualization
 * Single Responsibility: Generate SVG markup for avatar display
 */
import { config } from '../../config/config.js';
import TextProcessor from '../../utils/TextProcessor.js';

class AvatarRenderer {
  /**
   * Render avatar content (image or fallback text)
   * @param {string} sender - Message sender ('me' or 'visitor')
   * @param {Object} theme - Active theme styles
   * @param {number} x - X position for avatar
   * @param {number} y - Y position for avatar
   * @param {string} delayCss - CSS animation delay property
   * @returns {string} - SVG markup for avatar group
   */
  render(sender, theme, x, y, delayCss) {
    // Get complete avatar group markup with animation and positioning
    return `<g class="avatar" transform="translate(${x},${y})" style="${delayCss}">${this._renderAvatarContent(sender, theme)}</g>`;
  }

  /**
   * Generate avatar content (image or fallback)
   * @param {string} sender - Message sender ('me' or 'visitor')
   * @param {Object} theme - Active theme styles
   * @returns {string} - SVG markup for avatar content without the group wrapper
   * @private
   */
  _renderAvatarContent(sender, theme) {
    const sCfg = sender === "me" ? config.avatars.me : config.avatars.visitor;
    const size = config.avatars.sizePx;
    const clip = config.avatars.shape === "circle" ? "avatarCircle" : "avatarSquare";

    // Check if imageUrl exists and is valid
    if (sCfg.imageUrl && typeof sCfg.imageUrl === 'string' && sCfg.imageUrl.trim() !== '') {
      // Check if it's an external URL (http/https)
      if (sCfg.imageUrl.startsWith('http://') || sCfg.imageUrl.startsWith('https://')) {
        console.warn(`AvatarRenderer: External URL "${sCfg.imageUrl}" used for ${sender} avatar. This may be blocked by GitHub's CSP in READMEs. Base64 encoded data URIs are recommended for GitHub compatibility.`);
        // Still render the image, but with the warning logged
        return `<image href="${sCfg.imageUrl}" width="${size}" height="${size}" clip-path="url(#${clip})"/>`;
      }
      
      // Check if it's a valid data URI format
      if (sCfg.imageUrl.startsWith('data:image/')) {
        return `<image href="${sCfg.imageUrl}" width="${size}" height="${size}" clip-path="url(#${clip})"/>`;
      }
      
      // If we get here, the imageUrl exists but is neither an http/https URL nor a valid data URI
      console.warn(`AvatarRenderer: Invalid image URL format for ${sender} avatar: "${sCfg.imageUrl}". Falling back to text avatar.`);
    }

    // Fall back to text-based avatar
    const bg = sender === "me" ? theme.ME_BUBBLE_COLOR : theme.VISITOR_BUBBLE_COLOR;
    const fg = sender === "me" ? theme.ME_TEXT_COLOR : theme.VISITOR_TEXT_COLOR;
    const radius = config.avatars.shape === "circle" ? size / 2 : 4;

    return `
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${bg}"/>
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central" fill="${fg}" font-size="${size / 2}" font-family="${theme.FONT_FAMILY}">${TextProcessor.escapeXML(sCfg.fallbackText)}</text>`;
  }
}

export default new AvatarRenderer();