/**
 * LayoutConstants.js
 * Central configuration for layout and styling parameters
 * Single Responsibility: Store and provide configuration constants
 */

// Font settings
export const FONT_FAMILY = "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
export const FONT_SIZE_PX = 14;
export const LINE_HEIGHT_PX = 20;

// Bubble dimensions
export const BUBBLE_PAD_X_PX = 12;
export const BUBBLE_PAD_Y_PX = 8;
export const BUBBLE_RADIUS_PX = 18;
export const MIN_BUBBLE_W_PX = 40;
export const MAX_BUBBLE_W_PX = 260;

// Bubble tail dimensions (exactly matching the CSS example)
export const BUBBLE_TAIL_HEIGHT_PX = 25;  // Height of the tail portion
export const BUBBLE_TAIL_WIDTH_PX = 20;   // Width of the colored tail extension
export const BUBBLE_TAIL_EXT_WIDTH_PX = 26; // Width of the background extension
export const BUBBLE_TAIL_RADIUS_X = 16;   // X-radius of the tail curve
export const BUBBLE_TAIL_RADIUS_Y = 14;   // Y-radius of the tail curve
export const TYPING_DOT_RADIUS_PX = 4;

// Animation settings
export const TYPING_CHAR_MS = 40;   // Typing speed per character
export const TYPING_MIN_MS = 1600;  // Minimum typing time
export const TYPING_MAX_MS = 3000;  // Maximum typing time

// Layout settings
export const VISIBLE_MESSAGES = 6;  // How many messages to keep visible before scrolling
export const CHAT_WIDTH_PX = 320;   // Total width of the chat container
export const CHAT_HEIGHT_PX = 450;  // Total height of the chat container

// Timing constants for natural conversation flow
export const TIMING = {
  // Reading time calculations
  MIN_READING_TIME_MS: 1000,         // Minimum time to "read" a message
  MS_PER_WORD: 250,                  // Time to read each word
  READING_RANDOMNESS_MS: 1000,       // Random variation to add to reading time
  
  // Delays between messages
  SAME_SENDER_DELAY_MS: 600,         // Delay between messages from same sender
  SENDER_CHANGE_DELAY_MS: 1800,      // Delay when sender changes (conversation turn)
  
  // Layout spacing
  MESSAGE_VERTICAL_SPACING: 22,      // Spacing between message bubbles
  BOTTOM_MARGIN: 40,                 // Bottom margin after last message
  
  // Animation timing buffers
  ANIMATION_END_BUFFER_MS: 2000      // Buffer time at end of animation
};

// Animation constants
export const ANIMATION = {
  // Typing bubble dimensions
  TYPING_BUBBLE_WIDTH: 70,          // Width of typing indicator bubble
  TYPING_BUBBLE_HEIGHT: 36,         // Height of typing indicator bubble
  
  // Typing dot animation
  DOT_ANIMATION_DURATION: 1.4,      // Duration of typing dot animation in seconds
  DOT_DELAY_2: 0.2,                 // Delay for second dot animation
  DOT_DELAY_3: 0.4,                 // Delay for third dot animation
  DOT_MIN_OPACITY: 0.4,             // Minimum opacity of typing dots
  DOT_MAX_OPACITY: 1.0,             // Maximum opacity of typing dots
  DOT_MIN_SCALE: 0.8,               // Minimum scale of typing dots
  DOT_MAX_SCALE: 1.0,               // Maximum scale of typing dots
  
  // Bubble animations
  BUBBLE_ANIMATION_DURATION: 0.36,  // Duration of bubble-in animation
  BUBBLE_ANIMATION_CURVE: "cubic-bezier(.36,1.64,.36,1)", // Animation curve
  BUBBLE_START_SCALE: 0.8,          // Starting scale for bubble-in animation
  
  // Shadow effect
  SHADOW_BLUR: 1,                   // Shadow blur amount
  SHADOW_OFFSET_X: 0,               // Shadow X offset
  SHADOW_OFFSET_Y: 1,               // Shadow Y offset
  SHADOW_OPACITY: 0.15,             // Shadow opacity
  
  // Scroll animation
  SCROLL_DELAY_BUFFER_SEC: 12,      // Extra time before scrolling starts (increased significantly)
  MIN_SCROLL_DURATION_SEC: 40,      // Minimum scroll duration
  SCROLL_DURATION_MULTIPLIER: 3     // Multiplier for scroll duration
};

// Theme colors (iOS Messages app style)
export const COLORS = {
  ME_BUBBLE: '#0B93F6',       // iOS blue for my messages
  VISITOR_BUBBLE: '#E5E5EA',  // iOS gray for visitor messages
  TEXT: '#FFFFFF',            // White text for my messages
  VISITOR_TEXT: '#000000',    // Black text for visitor messages
  BACKGROUND_LIGHT: '#FFFFFF', // iOS light background
  BACKGROUND_DARK: '#000000'   // iOS dark background
};