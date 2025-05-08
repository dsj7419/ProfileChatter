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

    if (sCfg.imageUrl) {
      return `<image href="${sCfg.imageUrl}" width="${size}" height="${size}" clip-path="url(#${clip})"/>`;
    }

    const bg = sender === "me" ? theme.ME_BUBBLE_COLOR : theme.VISITOR_BUBBLE_COLOR;
    const fg = sender === "me" ? theme.ME_TEXT_COLOR : theme.VISITOR_TEXT_COLOR;
    const radius = config.avatars.shape === "circle" ? size / 2 : 4;

    return `
      <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${bg}"/>
      <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central" fill="${fg}" font-size="${size / 2}" font-family="${theme.FONT_FAMILY}">${TextProcessor.escapeXML(sCfg.fallbackText)}</text>`;
  }
}

export default new AvatarRenderer();