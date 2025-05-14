/**
 * SvgRenderer.js
 * Responsible for rendering the timeline into SVG
 * Single Responsibility: Create SVG markup from timeline data
 * 
 * ✨ Optimizations:
 *   • Dynamic label and value columns in charts for better space utilization
 *   • Text bubbles auto-size to the longest line (up to MAX_BUBBLE_W_PX)
 *   • No wasted whitespace in either text or chart bubbles
 */
import { config } from '../config/config.js';
import TextProcessor from '../utils/TextProcessor.js';
import AvatarRenderer from './components/AvatarRenderer.js';
import ReactionRenderer from './components/ReactionRenderer.js';
import ChartRenderer from './components/ChartRenderer.js';

// Import font data
let INTER_FONT_BASE64 = '';
try {
  const fontDataModule = await import('./fontData.js');
  INTER_FONT_BASE64 = fontDataModule.INTER_FONT_BASE64;
} catch (error) {
  /* fall back to system fonts */
}

class SvgRenderer {
  /**
   * Get active theme styles with fallback
   * @returns {Object} - Active theme styles
   */
  getActiveThemeStyles() {
    const activeThemeName = config.activeTheme || 'ios'; // Fallback to ios
    const themeStyles = config.themes[activeThemeName] || config.themes.ios; // Fallback
    return themeStyles;
  }

  /**
   * Generate the complete SVG chat visualization
   * @param {Object} timelineData - Timeline with items and metadata
   * @returns {string} - Complete SVG markup
   */
  renderSVG(timelineData) {
    const { items } = timelineData;
    
    return [
      this._header(timelineData),
      ...items.map((it) =>
        it.type === "typing"
          ? this._renderTypingIndicator(it)
          : this._renderChatBubble(it)
      ),
      "</g></svg>",
    ].join('\n');
  }
  
  /**
 * Generate SVG header with styles
 * @param {Object} timelineData - Complete timeline data including timing profile
 * @returns {string} SVG header with styles
 */
_header(timelineData) {
  const theme = this.getActiveThemeStyles();
  const timingProfile = timelineData.timings;

  /* ---------- font‑face --------------------------------------------- */
  const fontFace = INTER_FONT_BASE64 
    ? `@font-face{font-family:'Inter';font-style:normal;font-weight:400;src:url("${INTER_FONT_BASE64}") format('woff2');}`
    : '';
  
  /* ---------- animation timing -------------------------------------- */
  // Get scroll distance from the timing profile or fall back to the original value
  const scrollDistance = timingProfile?.scrollDistance ?? timelineData.scrollDistance;
  
  // Add delay before scrolling starts (wait for last message to be read)
  const totalTypingTime = timelineData.totalTypingTime;
  const scrollDelay = (totalTypingTime / 1000) + config.layout.ANIMATION.SCROLL_DELAY_BUFFER_SEC;
  
  // Calculate scroll duration based on timing profile or fall back to old calculation
  const scrollDuration = (timingProfile?.scrollDurationSec ?? 
    Math.max(
      config.layout.ANIMATION.MIN_SCROLL_DURATION_SEC,
      scrollDistance / config.layout.ANIMATION.SCROLL_PIXELS_PER_SEC
    )
  ).toFixed(2);
  
  /* ---------- CSS Variables ---------------------------------------- */
  const cssVars = `
    :root {
      /* Bubble Colors */
      --me-bubble-color: ${theme.ME_BUBBLE_COLOR};
      --visitor-bubble-color: ${theme.VISITOR_BUBBLE_COLOR};
      
      /* Text Colors */
      --me-text-color: ${theme.ME_TEXT_COLOR};
      --visitor-text-color: ${theme.VISITOR_TEXT_COLOR};
      
      /* Background */
      --background-light: ${theme.BACKGROUND_LIGHT};
      --background-dark: ${theme.BACKGROUND_DARK};
      
      /* Styling */
      --bubble-radius-px: ${theme.BUBBLE_RADIUS_PX}px;
      --font-family: ${theme.FONT_FAMILY};
      
      /* Reaction */
      --reaction-font-size-px: ${theme.REACTION_FONT_SIZE_PX}px;
      --reaction-bg-color: ${theme.REACTION_BG_COLOR};
      --reaction-bg-opacity: ${theme.REACTION_BG_OPACITY};
      --reaction-text-color: ${theme.REACTION_TEXT_COLOR};
      --reaction-padding-x-px: ${theme.REACTION_PADDING_X_PX}px;
      --reaction-padding-y-px: ${theme.REACTION_PADDING_Y_PX}px;
      --reaction-border-radius-px: ${theme.REACTION_BORDER_RADIUS_PX}px;
      --reaction-offset-y-px: ${theme.REACTION_OFFSET_Y_PX}px;
      
      /* Chart Styles */
      --bar-default-color: ${theme.CHART_STYLES.BAR_DEFAULT_COLOR};
      --bar-track-color: ${theme.CHART_STYLES.BAR_TRACK_COLOR};
      --bar-corner-radius-px: ${theme.CHART_STYLES.BAR_CORNER_RADIUS_PX}px;
      --bar-height-px: ${theme.CHART_STYLES.BAR_HEIGHT_PX}px;
      --bar-spacing-px: ${theme.CHART_STYLES.BAR_SPACING_PX}px;
      
      --label-font-family: ${theme.CHART_STYLES.LABEL_FONT_FAMILY};
      --label-font-size-px: ${theme.CHART_STYLES.LABEL_FONT_SIZE_PX}px;
      --value-text-font-family: ${theme.CHART_STYLES.VALUE_TEXT_FONT_FAMILY};
      --value-text-font-size-px: ${theme.CHART_STYLES.VALUE_TEXT_FONT_SIZE_PX}px;
      
      --title-font-family: ${theme.CHART_STYLES.TITLE_FONT_FAMILY};
      --title-font-size-px: ${theme.CHART_STYLES.TITLE_FONT_SIZE_PX}px;
      --title-line-height-multiplier: ${theme.CHART_STYLES.TITLE_LINE_HEIGHT_MULTIPLIER};
      --title-bottom-margin-px: ${theme.CHART_STYLES.TITLE_BOTTOM_MARGIN_PX}px;
      
      --chart-padding-x-px: ${theme.CHART_STYLES.CHART_PADDING_X_PX}px;
      --chart-padding-y-px: ${theme.CHART_STYLES.CHART_PADDING_Y_PX}px;
      
      --me-title-color: ${theme.CHART_STYLES.ME_TITLE_COLOR};
      --me-label-color: ${theme.CHART_STYLES.ME_LABEL_COLOR};
      --me-value-text-color: ${theme.CHART_STYLES.ME_VALUE_TEXT_COLOR};
      
      --visitor-title-color: ${theme.CHART_STYLES.VISITOR_TITLE_COLOR};
      --visitor-label-color: ${theme.CHART_STYLES.VISITOR_LABEL_COLOR};
      --visitor-value-text-color: ${theme.CHART_STYLES.VISITOR_VALUE_TEXT_COLOR};
      
      /* Donut Chart */
      --donut-stroke-width-px: ${theme.CHART_STYLES.DONUT_STROKE_WIDTH_PX}px;
      --donut-center-text-font-size-px: ${theme.CHART_STYLES.DONUT_CENTER_TEXT_FONT_SIZE_PX}px;
      --donut-center-text-font-family: ${theme.CHART_STYLES.DONUT_CENTER_TEXT_FONT_FAMILY};
      --me-donut-center-text-color: ${theme.CHART_STYLES.ME_DONUT_CENTER_TEXT_COLOR};
      --visitor-donut-center-text-color: ${theme.CHART_STYLES.VISITOR_DONUT_CENTER_TEXT_COLOR};
      --me-donut-legend-text-color: ${theme.CHART_STYLES.ME_DONUT_LEGEND_TEXT_COLOR};
      --visitor-donut-legend-text-color: ${theme.CHART_STYLES.VISITOR_DONUT_LEGEND_TEXT_COLOR};
      --donut-legend-font-size-px: ${theme.CHART_STYLES.DONUT_LEGEND_FONT_SIZE_PX}px;
      --donut-legend-item-spacing-px: ${theme.CHART_STYLES.DONUT_LEGEND_ITEM_SPACING_PX}px;
      --donut-legend-marker-size-px: ${theme.CHART_STYLES.DONUT_LEGEND_MARKER_SIZE_PX}px;
      --donut-animation-duration-sec: ${theme.CHART_STYLES.DONUT_ANIMATION_DURATION_SEC}s;
      --donut-segment-animation-delay-sec: ${theme.CHART_STYLES.DONUT_SEGMENT_ANIMATION_DELAY_SEC}s;
    }
  `;

  /* ---------- CSS ---------------------------------------------------- */
  const css = `
${fontFace}
${cssVars}
@keyframes bubbleIn{0%{scale:${config.layout.ANIMATION.BUBBLE_START_SCALE};opacity:0}100%{scale:1;opacity:1}}
@keyframes typingDot1{0%,100%{opacity:${config.layout.ANIMATION.DOT_MIN_OPACITY};transform:scale(${config.layout.ANIMATION.DOT_MIN_SCALE})}40%{opacity:${config.layout.ANIMATION.DOT_MAX_OPACITY};transform:scale(${config.layout.ANIMATION.DOT_MAX_SCALE})}}
@keyframes typingDot2{0%,100%{opacity:${config.layout.ANIMATION.DOT_MIN_OPACITY};transform:scale(${config.layout.ANIMATION.DOT_MIN_SCALE})}40%{opacity:${config.layout.ANIMATION.DOT_MAX_OPACITY};transform:scale(${config.layout.ANIMATION.DOT_MAX_SCALE})}}
@keyframes typingDot3{0%,100%{opacity:${config.layout.ANIMATION.DOT_MIN_OPACITY};transform:scale(${config.layout.ANIMATION.DOT_MIN_SCALE})}40%{opacity:${config.layout.ANIMATION.DOT_MAX_OPACITY};transform:scale(${config.layout.ANIMATION.DOT_MAX_SCALE})}}
@keyframes reactionIn{0%{scale:.5;opacity:0}100%{scale:1;opacity:1}}
@keyframes avatarIn{0%{scale:.8;opacity:0}100%{scale:1;opacity:1}}
@keyframes scrollUp{0%{transform:translateY(0)}100%{transform:translateY(-${scrollDistance}px)}}
@keyframes fadeInStatus{0%{opacity:0}100%{opacity:1}}
@keyframes fadeInOutStatus{0%{opacity:0}15%{opacity:1}85%{opacity:1}100%{opacity:0}}
.track{animation:scrollUp ${scrollDuration}s linear forwards;animation-delay:${scrollDelay.toFixed(2)}s;transform:translate3d(0,0,0);will-change:transform}
.msg{animation:bubbleIn ${config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION}s ${config.layout.ANIMATION.BUBBLE_ANIMATION_CURVE} forwards;opacity:0;filter:url(#shadowEffect)}
.typing{opacity:0;filter:url(#shadowEffect)}
.reaction{animation:reactionIn ${config.layout.ANIMATION.REACTION_ANIMATION_DURATION_SEC}s ease-out forwards;opacity:0;filter:url(#shadowEffect)}
.avatar{animation:avatarIn .3s ease-out forwards;opacity:0}
.status-indicator{font-size:${config.layout.STATUS_INDICATOR.FONT_SIZE_PX}px;fill:${config.layout.STATUS_INDICATOR.COLOR_ME};opacity:0}
.typing-dot1{animation:typingDot1 ${config.layout.ANIMATION.DOT_ANIMATION_DURATION}s infinite;animation-delay:0s}
.typing-dot2{animation:typingDot2 ${config.layout.ANIMATION.DOT_ANIMATION_DURATION}s infinite;animation-delay:${config.layout.ANIMATION.DOT_DELAY_2}s}
.typing-dot3{animation:typingDot3 ${config.layout.ANIMATION.DOT_ANIMATION_DURATION}s infinite;animation-delay:${config.layout.ANIMATION.DOT_DELAY_3}s}
@media(prefers-color-scheme:dark){svg{background:var(--background-dark)}}
@media(prefers-color-scheme:light){svg{background:var(--background-light)}}

/* Use CSS variables for themed elements */
.msg.me rect { fill: var(--me-bubble-color); }
.msg.them rect { fill: var(--visitor-bubble-color); }
.msg.me text { fill: var(--me-text-color); }
.msg.them text { fill: var(--visitor-text-color); }
svg { font-family: var(--font-family); }

/* Reaction styling */
.reaction rect {
  fill: var(--reaction-bg-color);
  fill-opacity: var(--reaction-bg-opacity);
  rx: var(--reaction-border-radius-px);
  ry: var(--reaction-border-radius-px);
}
.reaction text {
  fill: var(--reaction-text-color);
  font-size: var(--reaction-font-size-px);
}`;

  /* ---------- SVG shell -------------------------------------------- */
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${config.layout.CHAT_WIDTH_PX}" height="${config.layout.CHAT_HEIGHT_PX}" font-family="${theme.FONT_FAMILY}" font-size="${config.layout.FONT_SIZE_PX}" shape-rendering="geometricPrecision">
<defs>
  <filter id="shadowEffect" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${config.layout.ANIMATION.SHADOW_BLUR}"/>
    <feOffset dx="${config.layout.ANIMATION.SHADOW_OFFSET_X}" dy="${config.layout.ANIMATION.SHADOW_OFFSET_Y}" result="offsetblur"/>
    <feComponentTransfer><feFuncA type="linear" slope="${config.layout.ANIMATION.SHADOW_OPACITY}"/></feComponentTransfer>
    <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>

  <!-- avatar masks -->
  <clipPath id="avatarCircle"><circle cx="${config.avatars.sizePx / 2}" cy="${config.avatars.sizePx / 2}" r="${config.avatars.sizePx / 2}"/></clipPath>
  <clipPath id="avatarSquare"><rect width="${config.avatars.sizePx}" height="${config.avatars.sizePx}" rx="4" ry="4"/></clipPath>
</defs>
<style>${css}</style>
<rect width="${config.layout.CHAT_WIDTH_PX}" height="${config.layout.CHAT_HEIGHT_PX}" fill="transparent"/>
<g class="track">`;
}

  /**
   * Render a typing indicator with proper iOS styling
   * @param {TypingIndicator} item - Typing indicator item
   * @returns {string} - SVG markup for typing indicator
   */
  _renderTypingIndicator(item) {
    const theme = this.getActiveThemeStyles();
    const isMe = item.sender === "me";
    const avatarOn = config.avatars.enabled;

    const bw = config.layout.ANIMATION.TYPING_BUBBLE_WIDTH;
    const bh = config.layout.ANIMATION.TYPING_BUBBLE_HEIGHT;

    // Calculate x position based on avatar configuration
    const avSize = avatarOn ? config.avatars.sizePx : 0;
    const avOff = avatarOn ? config.avatars.xOffsetPx : 0;

    const x = isMe
      ? config.layout.CHAT_WIDTH_PX - bw - avSize - avOff * 2
      : avSize + avOff * 2;

    const bubbleFill = isMe ? theme.ME_BUBBLE_COLOR : theme.VISITOR_BUBBLE_COLOR;
    const textColor = isMe ? theme.ME_TEXT_COLOR : theme.VISITOR_TEXT_COLOR;

    const start = (item.startTime / 1000).toFixed(2);
    const dur = (item.duration / 1000).toFixed(2);

    return `
      <g class="typing ${isMe ? "me" : "them"}" transform="translate(${x},${item.y})">
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.05;0.1;0.9;1" begin="${start}s" dur="${dur}s" fill="freeze"/>
        <rect width="${bw}" height="${bh}" rx="${theme.BUBBLE_RADIUS_PX}" ry="${theme.BUBBLE_RADIUS_PX}" fill="${bubbleFill}"/>
        ${this._typingDots(bw, bh, textColor)}
      </g>`;
  }

  /**
   * Render typing animation dots
   * @param {number} bw - Bubble width
   * @param {number} bh - Bubble height
   * @param {string} color - Dot color
   * @returns {string} - SVG markup for typing dots
   */
  _typingDots(bw, bh, color) {
    const r = config.layout.TYPING_DOT_RADIUS_PX;
    const cx = bw / 2;
    const cy = bh / 2;
    const dx = bw / 4;
    return `<circle cx="${cx - dx}" cy="${cy}" r="${r}" fill="${color}" class="typing-dot1"/>
            <circle cx="${cx}"      cy="${cy}" r="${r}" fill="${color}" class="typing-dot2"/>
            <circle cx="${cx + dx}" cy="${cy}" r="${r}" fill="${color}" class="typing-dot3"/>`;
  }

  /**
   * Render a chat bubble with iPhone-like styling
   * @param {ChatMessage} item - Message item
   * @returns {string} - SVG markup for chat bubble
   */
  _renderChatBubble (item) {
    const theme         = this.getActiveThemeStyles()
    const isMe          = item.sender === 'me'
    const avatarOn      = config.avatars.enabled
  
    const padX          = config.layout.BUBBLE_PAD_X_PX
    const padY          = config.layout.BUBBLE_PAD_Y_PX
  
    /* ── 1.   WIDTH ───────────────────────────────────────────────────── */
    let width
  
    if (item.contentType === 'text' && item.layout.lines) {
      // Compute longest line then add side padding
      const maxLinePx = Math.max(
        ...item.layout.lines.map(l => TextProcessor.measureTextWidth(l))
      )
      width = maxLinePx + padX * 2
    } else {
      // Chart or other rich content: layout.width is inner content
      width = item.layout.width + padX * 2
    }
  
    width = Math.min(
      Math.max(width, config.layout.MIN_BUBBLE_W_PX),
      config.layout.MAX_BUBBLE_W_PX
    )
  
    /* ── 2.   HEIGHT ──────────────────────────────────────────────────── */
    const innerH = item.layout.height
    const height =
      item.contentType === 'text'
        ? innerH                               // text already includes vertical pad
        : innerH + padY * 2                    // add pad for charts / rich blocks
  
    /* ── 3.   POSITION (x) — account for avatar and alignment ─────────── */
    const avSize = avatarOn ? config.avatars.sizePx : 0
    const avOff  = avatarOn ? config.avatars.xOffsetPx : 0
  
    const bubbleX = isMe
      ? config.layout.CHAT_WIDTH_PX - width - avSize - avOff * 2
      : avSize + avOff * 2
  
    /* ── 4.   Shared animation delay style ───────────────────────────── */
    const delayCss = item.getDelayCSS()
  
    /* ── 5.   Avatar (optional) ───────────────────────────────────────── */
    const avatar = avatarOn
      ? AvatarRenderer.render(
          item.sender,
          theme,
          isMe
            ? config.layout.CHAT_WIDTH_PX - avSize - avOff
            : avOff,
          item.y + config.avatars.yOffsetPx,
          delayCss
        )
      : ''
  
    /* ── 6.   Bubble fill + shell ─────────────────────────────────────── */
    const bubbleFill = isMe ? theme.ME_BUBBLE_COLOR : theme.VISITOR_BUBBLE_COLOR
    const rect = `<rect width="${width}" height="${height}"
                     rx="${theme.BUBBLE_RADIUS_PX}" ry="${theme.BUBBLE_RADIUS_PX}"
                     fill="${bubbleFill}"/>`
  
    /* ── 7.   Content markup ──────────────────────────────────────────── */
    const content =
      item.contentType === 'chart'
        ? ChartRenderer.render(item, theme, bubbleFill) // <-- Pass bubbleFill to ChartRenderer
        : this._renderBubbleText(item, theme, isMe)
  
    /* ── 8.   Tail geometry (mirrored for me / visitor) ───────────────── */
    const tail = isMe
      ? `<path d="M${width},10 C${width + 4},14 ${width + 7},18 ${width + 6},22
                  C${width + 5},18 ${width + 2},14 ${width},16 Z"
               fill="${bubbleFill}"/>`
      : `<path d="M0,10 C-4,14 -7,18 -6,22 C-5,18 -2,14 0,16 Z"
               fill="${bubbleFill}"/>`
  
    /* ── 9.   Status & reactions (same as before) ─────────────────────── */
    const status   = isMe ? this._statusIndicators(item, width, height) : ''
    const reaction = ReactionRenderer.render(item, theme, width, isMe)
  
    /* ── 10.  Group wrapper with transform & delay style ──────────────── */
    return `
      ${avatar}
      <g class="msg ${isMe ? 'me' : 'them'}"
         transform="translate(${bubbleX},${item.y})"
         style="${delayCss}">
        ${rect}${tail}${content}${status}${reaction}
      </g>`
  }

  /**
   * Render text for chat bubble
   * @param {ChatMessage} item - Message item
   * @param {Object} theme - Theme styles
   * @param {boolean} isMe - Whether message is from the user
   * @returns {string} - SVG markup for text content
   */
  _renderBubbleText(item, theme, isMe) {
    const color = isMe ? theme.ME_TEXT_COLOR : theme.VISITOR_TEXT_COLOR;
    return (item.layout.lines || [])
      .map((line, i) => {
        const y =
          config.layout.BUBBLE_PAD_Y_PX +
          (i + 1) * config.layout.LINE_HEIGHT_PX -
          6;
        return `<text x="${config.layout.BUBBLE_PAD_X_PX}" y="${y}" fill="${color}" dominant-baseline="middle">${TextProcessor.escapeXML(line)}</text>`;
      })
      .join("");
  }

  /**
   * Render status indicators for message bubbles
   * @param {ChatMessage} item - Message item
   * @param {number} width - Bubble width
   * @param {number} height - Bubble height
   * @returns {string} - SVG markup for status indicators
   */
  _statusIndicators(item, width, height) {
    const y = height + config.layout.STATUS_INDICATOR.OFFSET_Y_PX;
    const x = width - config.layout.BUBBLE_PAD_X_PX;

    const base = item.startTime / 1000 + config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION;
    const deliveredDelay = base + config.layout.STATUS_INDICATOR.ANIMATION_DELAY_SEC;
    const readDelay = deliveredDelay + config.layout.STATUS_INDICATOR.READ_DELAY_SEC;

    return `
      <text x="${x}" y="${y}" text-anchor="end" class="status-indicator" style="animation:fadeInOutStatus ${config.layout.STATUS_INDICATOR.READ_DELAY_SEC}s ease forwards;animation-delay:${deliveredDelay.toFixed(2)}s">${TextProcessor.escapeXML(config.layout.STATUS_INDICATOR.DELIVERED_TEXT)}</text>
      <text x="${x}" y="${y}" text-anchor="end" class="status-indicator" style="animation:fadeInStatus ${config.layout.STATUS_INDICATOR.READ_TRANSITION_SEC}s ease forwards;animation-delay:${readDelay.toFixed(2)}s">${TextProcessor.escapeXML(config.layout.STATUS_INDICATOR.READ_TEXT)}</text>`;
  }
}

export default new SvgRenderer();