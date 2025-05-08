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
    const { items, scrollDistance, totalTypingTime } = timelineData;
    
    return [
      this._header(scrollDistance, totalTypingTime),
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
   * @param {number} scrollDistance - Distance to scroll in pixels
   * @param {number} totalTypingTime - Total time spent typing in ms
   * @returns {string} SVG header with styles
   */
  _header(scrollDistance, totalTypingTime) {
    const theme = this.getActiveThemeStyles();

    /* ---------- font‑face --------------------------------------------- */
    const fontFace = INTER_FONT_BASE64 
      ? `@font-face{font-family:'Inter';font-style:normal;font-weight:400;src:url("${INTER_FONT_BASE64}") format('woff2');}`
      : '';
    
    /* ---------- animation timing -------------------------------------- */
    // Add delay before scrolling starts (wait for last message to be read)
    const scrollDelay = (totalTypingTime / 1000) + config.layout.ANIMATION.SCROLL_DELAY_BUFFER_SEC;
    
    // Calculate scroll duration based on distance to scroll, with a minimum duration
    const scrollDuration = Math.max(
      config.layout.ANIMATION.MIN_SCROLL_DURATION_SEC,
      scrollDistance / config.layout.ANIMATION.SCROLL_PIXELS_PER_SEC
    ).toFixed(2);
    
    /* ---------- CSS ---------------------------------------------------- */
    const css = `
${fontFace}
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
@media(prefers-color-scheme:dark){svg{background:${theme.BACKGROUND_DARK}}}
@media(prefers-color-scheme:light){svg{background:${theme.BACKGROUND_LIGHT}}}`;

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
   * Render avatar content (image or fallback)
   * @param {string} sender - Message sender ('me' or 'visitor')
   * @returns {string} - SVG markup for avatar content without the group wrapper
   */
  _avatarContent(sender) {
    const theme = this.getActiveThemeStyles();
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
  _renderChatBubble(item) {
    const theme = this.getActiveThemeStyles();
    const isMe = item.sender === "me";
    const avatarOn = config.avatars.enabled;

    // ── 1. Determine bubble width ──────────────────────────────────────
    let width = item.layout.width;

    if (item.contentType === "text" && item.layout.lines) {
      // measure longest line (single run – perf OK)
      const maxLinePx = Math.max(
        ...item.layout.lines.map((ln) => TextProcessor.measureTextWidth(ln))
      );
      const dynWidth =
        config.layout.BUBBLE_PAD_X_PX * 2 + maxLinePx; // inner + outer pads
      width = Math.min(
        Math.max(dynWidth, config.layout.MIN_BUBBLE_W_PX || 120),
        config.layout.MAX_BUBBLE_W_PX
      );
    }

    const height = item.layout.height; // height was already correct

    // ── 2. X‑position considering avatars ─────────────────────────────
    const avSize = avatarOn ? config.avatars.sizePx : 0;
    const avOff = avatarOn ? config.avatars.xOffsetPx : 0;

    const bubbleX = isMe
      ? config.layout.CHAT_WIDTH_PX - width - avSize - avOff * 2
      : avSize + avOff * 2;

    /* shared animation delay ------------------------------------------------*/
    const delayCss = item.getDelayCSS(); // e.g. "animation-delay: 4.23s;"

    /* ----- AVATAR MARKUP ----- */
    let avatar = "";
    if (avatarOn) {
      const ax = isMe
        ? config.layout.CHAT_WIDTH_PX - avSize - avOff
        : avOff;
      const ay = item.y + config.avatars.yOffsetPx;
      avatar = `<g class="avatar" transform="translate(${ax},${ay})" style="${delayCss}">${this._avatarContent(item.sender)}</g>`;
    }

    /* bubble rect ---------------------------------------------------------- */
    const bubbleFill = isMe ? theme.ME_BUBBLE_COLOR : theme.VISITOR_BUBBLE_COLOR;
    const rect = `<rect width="${width}" height="${height}" rx="${theme.BUBBLE_RADIUS_PX}" ry="${theme.BUBBLE_RADIUS_PX}" fill="${bubbleFill}"/>`;

    /* content -------------------------------------------------------------- */
    const content =
      item.contentType === "chart"
        ? this._renderHorizontalBarChart(item, theme)
        : this._renderBubbleText(item, theme, isMe);

    /* tail ----------------------------------------------------------------- */
    const tail = isMe
      ? `<path d="M${width},10 C${width + 4},14 ${width + 7},18 ${width + 6},22 C${width + 5},18 ${width + 2},14 ${width},16 Z" fill="${bubbleFill}"/>`
      : `<path d="M0,10 C-4,14 -7,18 -6,22 C-5,18 -2,14 0,16 Z" fill="${bubbleFill}"/>`;

    /* status (me only) ----------------------------------------------------- */
    const status = isMe ? this._statusIndicators(item, width, height) : "";

    /* reaction ------------------------------------------------------------ */
    const reaction = item.reaction ? this._reaction(item, theme, width, isMe) : "";

    return `${avatar}<g class="msg ${isMe ? "me" : "them"}" transform="translate(${bubbleX},${item.y})" style="${delayCss}">${rect}${tail}${content}${status}${reaction}</g>`;
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
   * Render a horizontal bar chart inside a message bubble
   * @param {ChatMessage} item - Chart message item 
   * @param {Object} theme - Current theme styles
   * @returns {string} - SVG markup for chart content
   */
  _renderHorizontalBarChart(item, theme) {
    const cs = theme.CHART_STYLES;
    const { chartData } = item;

    const padX = cs.CHART_PADDING_X_PX;
    const padY = cs.CHART_PADDING_Y_PX;
    const titleH = chartData.title ? cs.TITLE_FONT_SIZE_PX + 14 : 0;

    /* ---- 1) Dynamic label column ------------------------------------ */
    const rawLabelW = chartData.items.map((d) => TextProcessor.measureTextWidth(d.label));
    const labelCol = Math.min(Math.max(...rawLabelW) + 8, cs.LABEL_MAX_WIDTH_PX); // +8px breathing room

    /* ---- 2) Dynamic value column ------------------------------------ */
    const biggestVal = chartData.maxValue || Math.max(...chartData.items.map((d) => d.value));
    const valueCol = Math.max(TextProcessor.measureTextWidth(String(biggestVal)) + 8, 28); // ≥28px

    /* ---- 3) Bar track ---------------------------------------------- */
    const gap = 8; // space between label col and bar
    const barTrackW = item.layout.width - padX * 2 - labelCol - valueCol - gap;

    const parts = [];

    /* Title ----------------------------------------------------------- */
    if (chartData.title) {
      parts.push(
        `<text x="${padX}" y="${padY + cs.TITLE_FONT_SIZE_PX}" 
              font-family="${cs.TITLE_FONT_FAMILY}" 
              font-size="${cs.TITLE_FONT_SIZE_PX}px" 
              font-weight="bold" 
              fill="${cs.TITLE_COLOR}">
          ${TextProcessor.escapeXML(chartData.title)}
        </text>`
      );
    }

    /* Rows ------------------------------------------------------------ */
    chartData.items.forEach((d, i) => {
      const barY = padY + titleH + i * (cs.BAR_HEIGHT_PX + cs.BAR_SPACING_PX);
      const labelY = barY + cs.BAR_HEIGHT_PX / 2 + cs.LABEL_FONT_SIZE_PX / 3;

      // Scaled bar width (touches 6px gutter inside bubble)
      const barW = ((d.value / biggestVal) * barTrackW).toFixed(2);
      const barX = padX + labelCol + gap;

      // Add label
      parts.push(
        `<text x="${padX}" y="${labelY}" 
              font-family="${cs.LABEL_FONT_FAMILY}" 
              font-size="${cs.LABEL_FONT_SIZE_PX}px" 
              fill="${cs.LABEL_COLOR}" 
              dominant-baseline="middle">
          ${TextProcessor.escapeXML(d.label)}
        </text>`
      );

      // Calculate animation timing 
      const begin = (
        item.startTime / 1000 + i * config.layout.ANIMATION.CHART_ANIMATION_DELAY_SEC
      ).toFixed(2);

      // Add bar with animation
      parts.push(
        `<rect x="${barX}" y="${barY}" 
              width="0" 
              height="${cs.BAR_HEIGHT_PX}" 
              rx="2" ry="2" 
              fill="${d.color || cs.BAR_DEFAULT_COLOR}" 
              opacity="0.7">
          <animate 
            attributeName="width" 
            from="0" 
            to="${barW}" 
            dur="${config.layout.ANIMATION.CHART_BAR_ANIMATION_DURATION_SEC}s" 
            begin="${begin}s" 
            fill="freeze"
            calcMode="spline"
            keySplines="0.25 0.1 0.25 1" />
          <animate 
            attributeName="opacity" 
            from="0.7" 
            to="1" 
            dur="${config.layout.ANIMATION.CHART_BAR_ANIMATION_DURATION_SEC}s" 
            begin="${begin}s" 
            fill="freeze" />
        </rect>`
      );

      // Calculate value text animation timing
      const valAppear = (+begin + config.layout.ANIMATION.CHART_BAR_ANIMATION_DURATION_SEC).toFixed(2);
      
      // Value text positioned right-aligned at fixed position
      const valX = padX + labelCol + gap + barTrackW + 6; // right‑aligned

      // Add value text
      parts.push(
        `<text x="${valX}" y="${labelY}" 
              font-family="${cs.VALUE_TEXT_FONT_FAMILY}" 
              font-size="${cs.VALUE_TEXT_FONT_SIZE_PX}px" 
              fill="${cs.VALUE_TEXT_COLOR}"
              text-anchor="end"
              dominant-baseline="middle" 
              opacity="0">
          ${d.value}
          <animate 
            attributeName="opacity" 
            from="0" 
            to="1" 
            dur="0.4s" 
            begin="${valAppear}s" 
            fill="freeze" />
        </text>`
      );
    });

    return parts.join("\n");
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

  /**
   * Render reaction for message bubbles
   * @param {ChatMessage} item - Message item
   * @param {Object} theme - Theme styles
   * @param {number} width - Bubble width
   * @param {boolean} isMe - Whether message is from the user
   * @returns {string} - SVG markup for reaction
   */
  _reaction(item, theme, width, isMe) {
    const sz = theme.REACTION_FONT_SIZE_PX;
    const px = theme.REACTION_PADDING_X_PX;
    const py = theme.REACTION_PADDING_Y_PX;
    const pillW = sz + px * 2;
    const pillH = sz + py * 2;

    const rx = isMe ? -pillW / 2 : width - pillW / 2;
    const ry = theme.REACTION_OFFSET_Y_PX;

    const base = item.startTime / 1000 + config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION;
    const extra = isMe
      ? config.layout.STATUS_INDICATOR.ANIMATION_DELAY_SEC +
        config.layout.STATUS_INDICATOR.READ_DELAY_SEC +
        config.layout.STATUS_INDICATOR.READ_TRANSITION_SEC
      : 0;
    const delay = base + extra + config.layout.ANIMATION.REACTION_ANIMATION_DELAY_FACTOR_SEC;

    return `<g class="reaction" style="animation-delay:${delay.toFixed(2)}s" transform="translate(${rx},${ry})">
      <rect width="${pillW}" height="${pillH}" rx="${theme.REACTION_BORDER_RADIUS_PX}" ry="${theme.REACTION_BORDER_RADIUS_PX}" fill="${theme.REACTION_BG_COLOR}" fill-opacity="${theme.REACTION_BG_OPACITY}"/>
      <text x="${pillW / 2}" y="${pillH / 2}" text-anchor="middle" dominant-baseline="middle" font-size="${sz}px" fill="${theme.REACTION_TEXT_COLOR}">${TextProcessor.escapeXML(item.reaction)}</text>
    </g>`;
  }
}

export default new SvgRenderer();