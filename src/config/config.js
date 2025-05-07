/**
 * config.js
 * Unified configuration file for all application settings
 * Single Responsibility: Store and provide all application configurations
 */

// Exported configuration object
export const config = {
    // Profile information and user data
    profile: {
      // Personal information
      NAME: "Dan Johnson",
      PROFESSION: "Software Developer",
      LOCATION: "San Diego",
      COMPANY: "Encore",
      CURRENT_PROJECT: "ProfileChatter SVG Generator",
      
      // Work information
      WORK_START_DATE: new Date(2022, 0, 1), // January 1, 2022
      
      // GitHub username for stats
      GITHUB_USERNAME: "dsj7419"
    },
    
    // Default values used when APIs fail
    apiDefaults: {
      // Weather defaults
      TEMPERATURE: "72°F (22°C)",
      WEATHER_DESCRIPTION: "partly cloudy",
      WEATHER_EMOJI: "⛅",
      
      // GitHub defaults
      GITHUB_PUBLIC_REPOS: "12",
      GITHUB_FOLLOWERS: "48"
    },
    
    // Layout and styling parameters
    layout: {
      // Font settings
      FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      FONT_SIZE_PX: 14,
      LINE_HEIGHT_PX: 20,
      
      // Bubble dimensions
      BUBBLE_PAD_X_PX: 12,
      BUBBLE_PAD_Y_PX: 8,
      BUBBLE_RADIUS_PX: 18,
      MIN_BUBBLE_W_PX: 40,
      MAX_BUBBLE_W_PX: 260,
      
      // Bubble tail dimensions (exactly matching the CSS example)
      BUBBLE_TAIL_HEIGHT_PX: 25,  // Height of the tail portion
      BUBBLE_TAIL_WIDTH_PX: 20,   // Width of the colored tail extension
      BUBBLE_TAIL_EXT_WIDTH_PX: 26, // Width of the background extension
      BUBBLE_TAIL_RADIUS_X: 16,   // X-radius of the tail curve
      BUBBLE_TAIL_RADIUS_Y: 14,   // Y-radius of the tail curve
      TYPING_DOT_RADIUS_PX: 4,
      
      // Animation settings
      TYPING_CHAR_MS: 40,   // Typing speed per character
      TYPING_MIN_MS: 1600,  // Minimum typing time
      TYPING_MAX_MS: 3000,  // Maximum typing time
      
      // Status indicator settings
      STATUS_INDICATOR: {
        TEXT: "Delivered",
        FONT_SIZE_PX: 10,
        COLOR_ME: "#FFFFFFB3", // Semi-transparent white for subtle appearance
        OFFSET_Y_PX: 12,
        ANIMATION_DELAY_SEC: 0.2,
        FADE_IN_DURATION_SEC: 0.3
      },
      
      // Layout settings
      VISIBLE_MESSAGES: 6,  // How many messages to keep visible before scrolling
      CHAT_WIDTH_PX: 320,   // Total width of the chat container
      CHAT_HEIGHT_PX: 450,  // Total height of the chat container
      
      // Timing constants for natural conversation flow
      TIMING: {
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
      },
      
      // Animation constants
      ANIMATION: {
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
        SCROLL_DELAY_BUFFER_SEC: 3.5,     // Delay after last message before scrolling starts
        MIN_SCROLL_DURATION_SEC: 1.2,     // Minimum scroll duration in seconds
        SCROLL_PIXELS_PER_SEC: 10,       // Pixels scrolled per second for a natural pace
      },
      
      // Theme colors (iOS Messages app style)
      COLORS: {
        ME_BUBBLE: '#0B93F6',       // iOS blue for my messages
        VISITOR_BUBBLE: '#E5E5EA',  // iOS gray for visitor messages
        TEXT: '#FFFFFF',            // White text for my messages
        VISITOR_TEXT: '#000000',    // Black text for visitor messages
        BACKGROUND_LIGHT: '#FFFFFF', // iOS light background
        BACKGROUND_DARK: '#000000'   // iOS dark background
      }
    }
  };