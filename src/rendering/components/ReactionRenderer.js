/**
 * ReactionRenderer.js
 * Responsible for rendering reaction elements within the SVG chat visualization
 * Single Responsibility: Generate SVG markup for message reactions
 */
import { config } from '../../config/config.js';
import TextProcessor from '../../utils/TextProcessor.js';

class ReactionRenderer {
  /**
   * Render reaction for message bubbles
   * @param {ChatMessage} item - Message item with reaction
   * @param {Object} theme - Theme styles
   * @param {number} bubbleWidth - Width of the message bubble
   * @param {boolean} isMe - Whether message is from the user
   * @returns {string} - SVG markup for reaction
   */
  render(item, theme, bubbleWidth, isMe) {
    // Skip rendering if no reaction
    if (!item.reaction) {
      return '';
    }
    
    const sz = theme.REACTION_FONT_SIZE_PX;
    const px = theme.REACTION_PADDING_X_PX;
    const py = theme.REACTION_PADDING_Y_PX;
    const pillW = sz + px * 2;
    const pillH = sz + py * 2;
    const offsetX = theme.REACTION_OFFSET_X_PX || 0;

    // Position reaction pill relative to bubble with offset customization
    const rx = isMe ? 
      -pillW / 2 + offsetX : 
      bubbleWidth - pillW / 2 + offsetX;
    
    const ry = theme.REACTION_OFFSET_Y_PX;

    // Calculate animation delay
    const base = item.startTime / 1000 + config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION;
    const extra = isMe
      ? config.layout.STATUS_INDICATOR.ANIMATION_DELAY_SEC +
        config.layout.STATUS_INDICATOR.READ_DELAY_SEC +
        config.layout.STATUS_INDICATOR.READ_TRANSITION_SEC
      : 0;
    const delay = base + extra + config.layout.ANIMATION.REACTION_ANIMATION_DELAY_FACTOR_SEC;

    return `<g class="reaction" style="animation-delay:${delay.toFixed(2)}s" transform="translate(${rx},${ry})">
      <rect width="${pillW}" height="${pillH}" 
            rx="var(--reaction-border-radius-px, ${theme.REACTION_BORDER_RADIUS_PX}px)" 
            ry="var(--reaction-border-radius-px, ${theme.REACTION_BORDER_RADIUS_PX}px)" 
            fill="var(--reaction-bg-color, ${theme.REACTION_BG_COLOR})" 
            fill-opacity="var(--reaction-bg-opacity, ${theme.REACTION_BG_OPACITY})"/>
      <text x="${pillW / 2}" y="${pillH / 2}" 
            text-anchor="middle" 
            dominant-baseline="middle" 
            font-size="var(--reaction-font-size-px, ${sz}px)" 
            fill="var(--reaction-text-color, ${theme.REACTION_TEXT_COLOR})">${TextProcessor.escapeXML(item.reaction)}</text>
    </g>`;
  }
}

export default new ReactionRenderer();