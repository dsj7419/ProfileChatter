/**
 * SvgRenderer.js
 * Responsible for rendering the timeline into SVG
 * Single Responsibility: Create SVG markup from timeline data
 */
import { config } from '../config/config.js';
import TextProcessor from '../utils/TextProcessor.js';

// Import font data
let INTER_FONT_BASE64 = '';
try {
  const fontDataModule = await import('./fontData.js');
  INTER_FONT_BASE64 = fontDataModule.INTER_FONT_BASE64;
} catch (error) {
  console.warn('Font data not available, using system fonts');
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
    const { items, scrollDistance, totalDuration, totalTypingTime } = timelineData;
    
    // Start building SVG
    let svgParts = [];
    
    // SVG header with embedded styles
    svgParts.push(this.generateSvgHeader(scrollDistance, totalDuration, totalTypingTime));
    
    // Process each timeline item
    for (const item of items) {
      if (item.type === 'typing') {
        svgParts.push(this.renderTypingIndicator(item));
      } else if (item.type === 'message') {
        svgParts.push(this.renderChatBubble(item));
      }
    }
    
    // Close SVG
    svgParts.push('</g></svg>');
    
    return svgParts.join('\n');
  }
  
  /**
   * Generate SVG header with styles
   * @param {number} scrollDistance - Distance to scroll in pixels
   * @param {number} totalDuration - Total animation duration in ms
   * @param {number} totalTypingTime - Total time spent typing in ms
   * @returns {string} SVG header with styles
   */
  generateSvgHeader(scrollDistance, totalDuration, totalTypingTime) {
    const themeStyles = this.getActiveThemeStyles();

    const fontFaceStyle = INTER_FONT_BASE64 ? 
      `@font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        src: url("${INTER_FONT_BASE64}") format('woff2');
      }` : '';
    
    // Add delay before scrolling starts (wait for last message to be read)
    const scrollDelay = (totalTypingTime / 1000) + config.layout.ANIMATION.SCROLL_DELAY_BUFFER_SEC;
    
    // Calculate scroll duration based on distance to scroll, with a minimum duration
    // This approach ties animation speed directly to the amount of content being scrolled
    const scrollDuration = Math.max(
      config.layout.ANIMATION.MIN_SCROLL_DURATION_SEC,
      scrollDistance / config.layout.ANIMATION.SCROLL_PIXELS_PER_SEC
    );
    
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${config.layout.CHAT_WIDTH_PX}" height="${config.layout.CHAT_HEIGHT_PX}" font-family="${themeStyles.FONT_FAMILY}" font-size="${config.layout.FONT_SIZE_PX}" shape-rendering="geometricPrecision">
  <defs>
    <filter id="shadowEffect" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${config.layout.ANIMATION.SHADOW_BLUR}"/>
      <feOffset dx="${config.layout.ANIMATION.SHADOW_OFFSET_X}" dy="${config.layout.ANIMATION.SHADOW_OFFSET_Y}" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="${config.layout.ANIMATION.SHADOW_OPACITY}"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <style>
    ${fontFaceStyle}
    @keyframes typingDot1 { 
      0%, 100% { opacity: ${config.layout.ANIMATION.DOT_MIN_OPACITY}; transform: scale(${config.layout.ANIMATION.DOT_MIN_SCALE}); }
      40% { opacity: ${config.layout.ANIMATION.DOT_MAX_OPACITY}; transform: scale(${config.layout.ANIMATION.DOT_MAX_SCALE}); }
    }
    @keyframes typingDot2 { 
      0%, 100% { opacity: ${config.layout.ANIMATION.DOT_MIN_OPACITY}; transform: scale(${config.layout.ANIMATION.DOT_MIN_SCALE}); }
      40% { opacity: ${config.layout.ANIMATION.DOT_MAX_OPACITY}; transform: scale(${config.layout.ANIMATION.DOT_MAX_SCALE}); }
    }
    @keyframes typingDot3 { 
      0%, 100% { opacity: ${config.layout.ANIMATION.DOT_MIN_OPACITY}; transform: scale(${config.layout.ANIMATION.DOT_MIN_SCALE}); }
      40% { opacity: ${config.layout.ANIMATION.DOT_MAX_OPACITY}; transform: scale(${config.layout.ANIMATION.DOT_MAX_SCALE}); }
    }
    @keyframes bubbleIn { 
      0% { scale: ${config.layout.ANIMATION.BUBBLE_START_SCALE}; opacity: 0; }
      100% { scale: 1; opacity: 1; }
    }
    @keyframes scrollUp { 
      0% { transform: translateY(0); }
      100% { transform: translateY(-${scrollDistance}px); }
    }
    @keyframes fadeInStatus {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    /* Scrolling with hardware acceleration and smooth movement */
    .track { 
      animation: scrollUp ${scrollDuration.toFixed(2)}s linear forwards; 
      animation-delay: ${scrollDelay.toFixed(2)}s; 
      transform: translate3d(0,0,0);
      backface-visibility: hidden;
      perspective: 1000px;
      will-change: transform;
    }
    
    .msg { 
      transform-origin: top left; 
      animation: bubbleIn ${config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION}s ${config.layout.ANIMATION.BUBBLE_ANIMATION_CURVE} forwards; 
      opacity: 0; 
      filter: url(#shadowEffect);
    }
    
    .typing { 
      opacity: 0;
      filter: url(#shadowEffect);
    }
    
    .typing-dot1 { animation: typingDot1 ${config.layout.ANIMATION.DOT_ANIMATION_DURATION}s infinite; animation-delay: 0s; }
    .typing-dot2 { animation: typingDot2 ${config.layout.ANIMATION.DOT_ANIMATION_DURATION}s infinite; animation-delay: ${config.layout.ANIMATION.DOT_DELAY_2}s; }
    .typing-dot3 { animation: typingDot3 ${config.layout.ANIMATION.DOT_ANIMATION_DURATION}s infinite; animation-delay: ${config.layout.ANIMATION.DOT_DELAY_3}s; }
    
    .status-indicator {
      font-size: ${config.layout.STATUS_INDICATOR.FONT_SIZE_PX}px;
      fill: ${config.layout.STATUS_INDICATOR.COLOR_ME};
      opacity: 0;
      will-change: opacity;
    }
    
    /* Support dark/light mode */
    @media (prefers-color-scheme: dark) {
      svg { background: ${themeStyles.BACKGROUND_DARK}; }
    }
    @media (prefers-color-scheme: light) {
      svg { background: ${themeStyles.BACKGROUND_LIGHT}; }
    }
  </style>
  
  <!-- Background shape -->
  <rect width="${config.layout.CHAT_WIDTH_PX}" height="${config.layout.CHAT_HEIGHT_PX}" fill="transparent" />
  
  <!-- Scrolling message container -->
  <g class="track">`;
  }
  
  /**
   * Render a typing indicator with proper iOS styling
   * @param {TypingIndicator} item - Typing indicator item
   * @returns {string} - SVG markup for typing indicator
   */
  renderTypingIndicator(item) {
    const themeStyles = this.getActiveThemeStyles();

    // Position based on sender (right for me, left for visitor)
    const isMe = item.sender === 'me';
    const bubbleWidth = config.layout.ANIMATION.TYPING_BUBBLE_WIDTH;
    const bubbleHeight = config.layout.ANIMATION.TYPING_BUBBLE_HEIGHT;
    const x = isMe ? config.layout.CHAT_WIDTH_PX - bubbleWidth - 20 : 20;
    
    // Create bubble background for typing indicator
    const fillColor = isMe ? themeStyles.ME_BUBBLE_COLOR : themeStyles.VISITOR_BUBBLE_COLOR;
    const textColor = isMe ? themeStyles.ME_TEXT_COLOR : themeStyles.VISITOR_TEXT_COLOR;
    
    // Add bubble with proper iOS-style rounded rectangle
    const bubble = `<rect x="0" y="0" rx="${themeStyles.BUBBLE_RADIUS_PX}" ry="${themeStyles.BUBBLE_RADIUS_PX}" width="${bubbleWidth}" height="${bubbleHeight}" fill="${fillColor}" />`;
    
    // Dots with staggered animations (iOS-style)
    const dotY = bubbleHeight/2;
    const dotRadius = config.layout.TYPING_DOT_RADIUS_PX;
    const dotSpacing = bubbleWidth/4;
    
    const dot1 = `<circle cx="${bubbleWidth/2 - dotSpacing}" cy="${dotY}" r="${dotRadius}" fill="${textColor}" class="typing-dot1" />`;
    const dot2 = `<circle cx="${bubbleWidth/2}" cy="${dotY}" r="${dotRadius}" fill="${textColor}" class="typing-dot2" />`;
    const dot3 = `<circle cx="${bubbleWidth/2 + dotSpacing}" cy="${dotY}" r="${dotRadius}" fill="${textColor}" class="typing-dot3" />`;
    
    // Typing animation appears and stays for duration, then disappears
    const startTime = (item.startTime / 1000).toFixed(2);
    const duration = (item.duration / 1000).toFixed(2);
    
    return `
    <g class="typing ${isMe ? 'me' : 'them'}" transform="translate(${x},${item.y})">
      <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.05;0.1;0.9;1" 
               begin="${startTime}s" dur="${duration}s" fill="freeze" />
      ${bubble}
      ${dot1}
      ${dot2}
      ${dot3}
    </g>`;
  }
  
  /**
   * Render a chat bubble with iPhone-like styling
   * @param {ChatMessage} item - Message item
   * @returns {string} - SVG markup for chat bubble
   */
  renderChatBubble(item) {
    const themeStyles = this.getActiveThemeStyles();

    // Calculate dimensions and wrap text
    const { lines, width, height } = item.layout ?? TextProcessor.wrapText(item.text);
    const isMe = item.sender === 'me';
    const x = isMe ? config.layout.CHAT_WIDTH_PX - width - 20 : 20;
    const delay = item.getDelayCSS();
    
    // Create bubble rectangle with correct color
    const fillColor = isMe ? themeStyles.ME_BUBBLE_COLOR : themeStyles.VISITOR_BUBBLE_COLOR;
    const rect = `<rect x="0" y="0" rx="${themeStyles.BUBBLE_RADIUS_PX}" ry="${themeStyles.BUBBLE_RADIUS_PX}" width="${width}" height="${height}" fill="${fillColor}" />`;
    
    // Add text lines with correct color based on sender
    const textColor = isMe ? themeStyles.ME_TEXT_COLOR : themeStyles.VISITOR_TEXT_COLOR;
    const textLines = lines
      .map((line, index) => {
        const y = config.layout.BUBBLE_PAD_Y_PX + (index + 1) * config.layout.LINE_HEIGHT_PX - 6;
        return `<text x="${config.layout.BUBBLE_PAD_X_PX}" y="${y}" fill="${textColor}" dominant-baseline="middle">${TextProcessor.escapeXML(line)}</text>`;
      })
      .join('');
    
    // Add bubble tails as proper SVG paths
    let tail = '';
    
    if (isMe) {
      // Right-side tail (for my messages)
      tail = `
        <path d="M${width},10 
                 C${width+4},14 ${width+7},18 ${width+6},22 
                 C${width+5},18 ${width+2},14 ${width},16 
                 Z" 
              fill="${fillColor}" />`;
    } else {
      // Left-side tail (for their messages)
      tail = `
        <path d="M0,10 
                 C-4,14 -7,18 -6,22 
                 C-5,18 -2,14 0,16 
                 Z" 
              fill="${fillColor}" />`;
    }
    
    // Add status indicator for "me" messages only
    let statusIndicator = '';
    if (isMe) {
      const statusText = config.layout.STATUS_INDICATOR.TEXT;
      const statusY = height + config.layout.STATUS_INDICATOR.OFFSET_Y_PX;
      const statusX = width - config.layout.BUBBLE_PAD_X_PX;
      const statusAnimationDelay = (item.startTime / 1000) + config.layout.ANIMATION.BUBBLE_ANIMATION_DURATION + config.layout.STATUS_INDICATOR.ANIMATION_DELAY_SEC;
      
      statusIndicator = `
        <text 
          x="${statusX}" 
          y="${statusY}" 
          text-anchor="end" 
          class="status-indicator" 
          style="animation: fadeInStatus ${config.layout.STATUS_INDICATOR.FADE_IN_DURATION_SEC}s ease forwards; animation-delay: ${statusAnimationDelay.toFixed(2)}s;">
            ${TextProcessor.escapeXML(statusText)}
        </text>`;
    }
    
    return `
    <g class="msg ${isMe ? 'me' : 'them'}" transform="translate(${x},${item.y})" style="${delay}">
      ${rect}
      ${tail}
      ${textLines}
      ${statusIndicator}
    </g>`;
  }
}

export default new SvgRenderer();