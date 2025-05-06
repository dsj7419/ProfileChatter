/**
 * SvgRenderer.js
 * Responsible for rendering the timeline into SVG
 * Single Responsibility: Create SVG markup from timeline data
 */
import { 
    CHAT_WIDTH_PX, 
    CHAT_HEIGHT_PX, 
    FONT_FAMILY, 
    FONT_SIZE_PX,
    BUBBLE_PAD_X_PX,
    BUBBLE_PAD_Y_PX,
    BUBBLE_RADIUS_PX,
    LINE_HEIGHT_PX,
    COLORS,
    ANIMATION,
    TYPING_DOT_RADIUS_PX
  } from '../config/LayoutConstants.js';
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
      const fontFaceStyle = INTER_FONT_BASE64 ? 
        `@font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          src: url("${INTER_FONT_BASE64}") format('woff2');
        }` : '';
      
      // Add a much longer delay before scrolling starts (wait for more messages)
      const scrollDelay = (totalTypingTime / 1000) + ANIMATION.SCROLL_DELAY_BUFFER_SEC;
      
      // Make the scrolling slow and smooth
      const scrollDuration = Math.max(
        ANIMATION.MIN_SCROLL_DURATION_SEC, 
        totalDuration / 1000 * ANIMATION.SCROLL_DURATION_MULTIPLIER
      );
      
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${CHAT_WIDTH_PX}" height="${CHAT_HEIGHT_PX}" font-family="${FONT_FAMILY}" font-size="${FONT_SIZE_PX}" shape-rendering="geometricPrecision">
    <defs>
      <filter id="shadowEffect" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="${ANIMATION.SHADOW_BLUR}"/>
        <feOffset dx="${ANIMATION.SHADOW_OFFSET_X}" dy="${ANIMATION.SHADOW_OFFSET_Y}" result="offsetblur"/>
        <feComponentTransfer>
          <feFuncA type="linear" slope="${ANIMATION.SHADOW_OPACITY}"/>
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
        0%, 100% { opacity: ${ANIMATION.DOT_MIN_OPACITY}; transform: scale(${ANIMATION.DOT_MIN_SCALE}); }
        40% { opacity: ${ANIMATION.DOT_MAX_OPACITY}; transform: scale(${ANIMATION.DOT_MAX_SCALE}); }
      }
      @keyframes typingDot2 { 
        0%, 100% { opacity: ${ANIMATION.DOT_MIN_OPACITY}; transform: scale(${ANIMATION.DOT_MIN_SCALE}); }
        40% { opacity: ${ANIMATION.DOT_MAX_OPACITY}; transform: scale(${ANIMATION.DOT_MAX_SCALE}); }
      }
      @keyframes typingDot3 { 
        0%, 100% { opacity: ${ANIMATION.DOT_MIN_OPACITY}; transform: scale(${ANIMATION.DOT_MIN_SCALE}); }
        40% { opacity: ${ANIMATION.DOT_MAX_OPACITY}; transform: scale(${ANIMATION.DOT_MAX_SCALE}); }
      }
      @keyframes bubbleIn { 
        0% { scale: ${ANIMATION.BUBBLE_START_SCALE}; opacity: 0; }
        100% { scale: 1; opacity: 1; }
      }
      @keyframes scrollUp { 
        0% { transform: translateY(0); }
        100% { transform: translateY(-${scrollDistance}px); }
      }
      
      /* Scrolling with hardware acceleration and smooth movement */
      .track { 
        animation: scrollUp ${scrollDuration}s linear forwards; 
        animation-delay: ${scrollDelay}s; 
        transform: translate3d(0,0,0);
        backface-visibility: hidden;
        perspective: 1000px;
        will-change: transform;
      }
      
      .msg { 
        transform-origin: top left; 
        animation: bubbleIn ${ANIMATION.BUBBLE_ANIMATION_DURATION}s ${ANIMATION.BUBBLE_ANIMATION_CURVE} forwards; 
        opacity: 0; 
        filter: url(#shadowEffect);
      }
      
      .typing { 
        opacity: 0;
        filter: url(#shadowEffect);
      }
      
      .typing-dot1 { animation: typingDot1 ${ANIMATION.DOT_ANIMATION_DURATION}s infinite; animation-delay: 0s; }
      .typing-dot2 { animation: typingDot2 ${ANIMATION.DOT_ANIMATION_DURATION}s infinite; animation-delay: ${ANIMATION.DOT_DELAY_2}s; }
      .typing-dot3 { animation: typingDot3 ${ANIMATION.DOT_ANIMATION_DURATION}s infinite; animation-delay: ${ANIMATION.DOT_DELAY_3}s; }
      
      /* Support dark/light mode */
      @media (prefers-color-scheme: dark) {
        svg { background: ${COLORS.BACKGROUND_DARK}; }
      }
      @media (prefers-color-scheme: light) {
        svg { background: ${COLORS.BACKGROUND_LIGHT}; }
      }
    </style>
    
    <!-- Background shape -->
    <rect width="${CHAT_WIDTH_PX}" height="${CHAT_HEIGHT_PX}" fill="transparent" />
    
    <!-- Scrolling message container -->
    <g class="track">`;
    }
    
    /**
     * Render a typing indicator with proper iOS styling
     * @param {TypingIndicator} item - Typing indicator item
     * @returns {string} - SVG markup for typing indicator
     */
    renderTypingIndicator(item) {
      // Position based on sender (right for me, left for visitor)
      const isMe = item.sender === 'me';
      const bubbleWidth = ANIMATION.TYPING_BUBBLE_WIDTH;
      const bubbleHeight = ANIMATION.TYPING_BUBBLE_HEIGHT;
      const x = isMe ? CHAT_WIDTH_PX - bubbleWidth - 20 : 20;
      
      // Create bubble background for typing indicator
      const fillColor = isMe ? COLORS.ME_BUBBLE : COLORS.VISITOR_BUBBLE;
      const textColor = isMe ? COLORS.TEXT : COLORS.VISITOR_TEXT;
      
      // Add bubble with proper iOS-style rounded rectangle
      const bubble = `<rect x="0" y="0" rx="${BUBBLE_RADIUS_PX}" ry="${BUBBLE_RADIUS_PX}" width="${bubbleWidth}" height="${bubbleHeight}" fill="${fillColor}" />`;
      
      // Dots with staggered animations (iOS-style)
      const dotY = bubbleHeight/2;
      const dotRadius = TYPING_DOT_RADIUS_PX;
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
      // Calculate dimensions and wrap text
      const { lines, width, height } = item.layout ?? TextProcessor.wrapText(item.text);
      const isMe = item.sender === 'me';
      const x = isMe ? CHAT_WIDTH_PX - width - 20 : 20;
      const delay = item.getDelayCSS();
      
      // Create bubble rectangle with correct color
      const fillColor = isMe ? COLORS.ME_BUBBLE : COLORS.VISITOR_BUBBLE;
      const rect = `<rect x="0" y="0" rx="${BUBBLE_RADIUS_PX}" ry="${BUBBLE_RADIUS_PX}" width="${width}" height="${height}" fill="${fillColor}" />`;
      
      // Add text lines with correct color based on sender
      const textColor = isMe ? COLORS.TEXT : COLORS.VISITOR_TEXT;
      const textLines = lines
        .map((line, index) => {
          const y = BUBBLE_PAD_Y_PX + (index + 1) * LINE_HEIGHT_PX - 6;
          return `<text x="${BUBBLE_PAD_X_PX}" y="${y}" fill="${textColor}" dominant-baseline="middle">${TextProcessor.escapeXML(line)}</text>`;
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
      
      return `
      <g class="msg ${isMe ? 'me' : 'them'}" transform="translate(${x},${item.y})" style="${delay}">
        ${rect}
        ${tail}
        ${textLines}
      </g>`;
    }
  }
  
  export default new SvgRenderer();