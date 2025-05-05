/**
 * ProfileChatter - SVG Generator Module
 * 
 * This module provides functions to generate SVG content
 * based on chat data without using string templates directly.
 */

// Constants for SVG dimensions and styling
const SVG_WIDTH = 550
const AVG_CHAR_WIDTH = 9.2 // Adjusted for more accurate width calculation
const LINE_HEIGHT = 22 // Line height for text
const PADDING_X = 15 // Horizontal padding inside bubbles
const PADDING_Y = 10 // Vertical padding inside bubbles
const MESSAGE_MARGIN_BOTTOM = 10 // Margin between message bubbles
const MIN_BUBBLE_WIDTH = 60 // Minimum width for very short messages
const MIN_BUBBLE_HEIGHT = 42 // Minimum height for single-line messages
const TYPING_INDICATOR_WIDTH = 70 // Width of typing indicator bubble
// Bubble tail dimensions
const TAIL_WIDTH = 10 // Width of the bubble tail
const TAIL_HEIGHT = 8 // Height of the bubble tail

// Animation timing constants
const ANIMATION_BASE_DELAY = 1.0 // Base delay between elements in seconds
const TYPING_DURATION = 2.0 // Duration of typing indicator animation in seconds
const MESSAGE_REVEAL_DURATION = 0.3 // Duration of message reveal animation in seconds
const POST_TYPING_DELAY = 0.5 // Delay after typing indicator before message appears

/**
 * Calculates dimensions for text based on content
 * @param {string} text - The text content
 * @returns {Object} - Object containing width and height
 */
function calculateTextDimensions(text) {
  const lines = text.split('\n')
  const lineCount = lines.length
  
  // Find the longest line to determine width
  let maxLineWidth = 0
  lines.forEach(line => {
    const lineWidth = line.length * AVG_CHAR_WIDTH
    maxLineWidth = Math.max(maxLineWidth, lineWidth)
  })
  
  // Calculate bubble dimensions with padding
  const bubbleWidth = Math.max(MIN_BUBBLE_WIDTH, maxLineWidth + (PADDING_X * 2))
  const bubbleHeight = Math.max(MIN_BUBBLE_HEIGHT, (lineCount * LINE_HEIGHT) + (PADDING_Y * 2))
  
  return {
    width: bubbleWidth,
    height: bubbleHeight,
    lineCount,
    lines
  }
}

/**
 * Creates the SVG header and style block
 * @param {number} width - SVG width
 * @param {number} height - SVG height
 * @returns {string} - SVG header string
 */
function createSVGHeader(width, height) {
  return `<svg 
    width="${width}" 
    height="${height}" 
    viewBox="0 0 ${width} ${height}"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
  
  <style>
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      src: url(data:application/font-woff2;charset=utf-8;base64,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) format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
    }
    
    /* Basic bubble styling */
    .bubble {
      fill: #e9e9eb;
    }
    
    /* Sender bubble styling */
    .bubble-me {
      fill: #007aff;
    }
    
    /* Basic text styling */
    text {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 18px;
      letter-spacing: -0.02em;
      fill: #000000;
    }
    
    /* Sender text styling */
    .text-me {
      fill: #ffffff;
    }
    
    /* Message animation */
    .message-bubble {
      opacity: 0;
      animation: msg-reveal ${MESSAGE_REVEAL_DURATION}s ease-out forwards;
    }
    
    @keyframes msg-reveal {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    /* Typing indicator styling */
    .typing-indicator {
      opacity: 0;
      animation: fade-in-out ${TYPING_DURATION}s forwards;
    }
    
    .typing-indicator circle {
      opacity: 0.3;
      animation: typing-dot 1.2s forwards;
      animation-iteration-count: 1;
    }
    
    @keyframes fade-in-out {
      0% { opacity: 0; }
      10%, 90% { opacity: 1; }
      100% { opacity: 0; }
    }
    
    @keyframes typing-dot {
      0%, 60%, 100% { opacity: 0.3; }
      30% { opacity: 1; }
    }
    
    /* Dark mode styles - Set me bubbles to blue in dark mode too */
    @media (prefers-color-scheme: dark) {
      .bubble {
        fill: #262629;
      }
      
      .bubble-me {
        fill: #007aff;
      }
      
      text {
        fill: #E9E9EB;
      }
      
      .text-me {
        fill: #ffffff;
      }
    }
  </style>`
}

/**
 * Creates a typing indicator SVG element
 * @param {number} delay - Animation delay in seconds
 * @param {number} yPos - Y position for the indicator
 * @returns {string} - SVG string for typing indicator
 */
function createTypingIndicator(delay, yPos) {
  const iterationCount = Math.ceil(TYPING_DURATION / 1.2)
  
  return `
  <g class="typing-indicator bubble" transform="translate(10, ${yPos})" style="animation: fade-in-out ${TYPING_DURATION}s ${delay}s forwards;">
    <rect width="${TYPING_INDICATOR_WIDTH}" height="${MIN_BUBBLE_HEIGHT}" rx="18" />
    <circle cx="25" cy="21" r="4" fill="#999999" style="animation: typing-dot 1.2s ${delay}s forwards; animation-iteration-count: ${iterationCount};" />
    <circle cx="40" cy="21" r="4" fill="#999999" style="animation: typing-dot 1.2s ${delay + 0.2}s forwards; animation-iteration-count: ${iterationCount};" />
    <circle cx="55" cy="21" r="4" fill="#999999" style="animation: typing-dot 1.2s ${delay + 0.4}s forwards; animation-iteration-count: ${iterationCount};" />
  </g>
  `
}

/**
 * Creates a message bubble SVG element
 * @param {Object} message - Message data
 * @param {Object} positionInfo - Position and dimension info
 * @param {number} delay - Animation delay in seconds
 * @returns {string} - SVG string for message bubble
 */
function createMessageElement(message, positionInfo, delay) {
    const { yPos, width: bubbleWidth, height: bubbleHeight, lines, lineCount } = positionInfo
    
    // Determine position and classes based on sender
    const isSender = message.sender === "me"
    const xPos = isSender ? SVG_WIDTH - bubbleWidth - 10 : 10
    const bubbleClass = isSender ? "bubble-me" : "bubble"
    const textClass = isSender ? "text-me" : ""
    
    // Calculate text alignment within bubble
    const textAlign = isSender ? "end" : "start"
    const textX = isSender ? bubbleWidth - PADDING_X : PADDING_X
    
    // Start building the message group
    let messageString = `
    <g class="message-bubble ${bubbleClass}" id="${message.id}" transform="translate(${xPos}, ${yPos})" style="animation-delay: ${delay}s;">
      <rect width="${bubbleWidth}" height="${bubbleHeight}" rx="18" />
      <text class="${textClass}" x="${textX}" y="28" text-anchor="${textAlign}">
    `
    
    // Handle text content (single or multi-line)
    if (lineCount === 1) {
      messageString += `${message.text}`
    } else {
      // First line
      messageString += `<tspan x="${textX}" dy="0">${lines[0]}</tspan>`
      
      // Subsequent lines
      for (let i = 1; i < lineCount; i++) {
        messageString += `<tspan x="${textX}" dy="${LINE_HEIGHT}">${lines[i]}</tspan>`
      }
    }
    
    // Close text element
    messageString += `
      </text>
    `
    
    // Add bubble tail path based on sender type
    if (isSender) {
      // For sender ("me") messages - tail on right side pointing right
      messageString += `
      <path class="${bubbleClass}" d="M${bubbleWidth},${bubbleHeight - TAIL_HEIGHT} L${bubbleWidth + TAIL_WIDTH},${bubbleHeight} L${bubbleWidth},${bubbleHeight} Z" />
      `
    } else {
      // For visitor messages - tail on left side pointing left
      messageString += `
      <path class="${bubbleClass}" d="M0,${bubbleHeight - TAIL_HEIGHT} L-${TAIL_WIDTH},${bubbleHeight} L0,${bubbleHeight} Z" />
      `
    }
    
    // Close the group
    messageString += `
    </g>
    `
    
    return messageString
  }

/**
 * Generates an SVG element with the provided chat data
 * @param {Array} chatData - The chat data to visualize
 * @param {Object} dynamicData - Dynamic data to replace placeholders
 * @returns {string} - The SVG content as a string
 */
export function generateSVG(chatData, dynamicData = {}) {
  // Create a deep copy of chat data to avoid modifying the original
  chatData = JSON.parse(JSON.stringify(chatData))
  
  // Replace placeholders in chat data with dynamic values
  chatData.forEach(message => {
    if (message.text) {
      // Replace each placeholder with its corresponding dynamic value
      Object.entries(dynamicData).forEach(([key, value]) => {
        const placeholder = `{${key}}`
        message.text = message.text.replace(new RegExp(placeholder, 'g'), value)
      })
    }
  })
  
  // PASS 1: Calculate positions and dimensions of all elements
  const elementsToRender = []
  let currentY = 20 // Initial top padding
  
  // Add initial typing indicator
  elementsToRender.push({
    type: 'typing',
    yPos: currentY,
    height: MIN_BUBBLE_HEIGHT,
    delay: ANIMATION_BASE_DELAY
  })
  
  // Update Y position after the typing indicator
  currentY += MIN_BUBBLE_HEIGHT + MESSAGE_MARGIN_BOTTOM
  
  // Process each message
  for (let i = 0; i < chatData.length; i++) {
    const message = chatData[i]
    const dimensions = calculateTextDimensions(message.text)
    
    // Add message element details
    elementsToRender.push({
      type: 'message',
      yPos: currentY,
      message: message,
      ...dimensions
    })
    
    // Update Y position after the message
    currentY += dimensions.height + MESSAGE_MARGIN_BOTTOM
    
    // Check if we need a typing indicator after this message
    // Only add if sender changes from 'me' to 'visitor'
    if (i < chatData.length - 1 && 
        chatData[i + 1].sender === "visitor" && 
        message.sender === "me") {
      
      elementsToRender.push({
        type: 'typing',
        yPos: currentY,
        height: MIN_BUBBLE_HEIGHT
      })
      
      // Update Y position after the typing indicator
      currentY += MIN_BUBBLE_HEIGHT + MESSAGE_MARGIN_BOTTOM
    }
  }
  
  // Calculate final SVG height with bottom padding
  const totalHeight = currentY + 10
  
  // PASS 2: Generate SVG content with calculated positions
  let svgString = createSVGHeader(SVG_WIDTH, totalHeight)
  let currentDelay = ANIMATION_BASE_DELAY
  
  // Process each element to generate SVG
  for (let i = 0; i < elementsToRender.length; i++) {
    const element = elementsToRender[i]
    
    if (element.type === 'typing') {
      // Add typing indicator with current delay
      svgString += createTypingIndicator(currentDelay, element.yPos)
      
      // Update delay after typing indicator
      currentDelay += TYPING_DURATION + POST_TYPING_DELAY
    } else if (element.type === 'message') {
      // Calculate message delay
      const messageDelay = currentDelay + ANIMATION_BASE_DELAY
      
      // Add message element with calculated delay
      svgString += createMessageElement(
        element.message, 
        element, 
        messageDelay
      )
      
      // Update delay after message
      currentDelay = messageDelay + MESSAGE_REVEAL_DURATION
    }
  }
  
  // Close SVG element
  svgString += `</svg>`
  
  return svgString
}