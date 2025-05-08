/**
 * config.js
 * Unified configuration file for all application settings
 * Single Responsibility: Store and provide all application configurations
 */

// Exported configuration object
export const config = {
  // Theme selection - default to iOS theme
  activeTheme: "ios",

  // Avatar configuration
  avatars: {
    enabled: true, // Master toggle for avatars
    me: {
      imageUrl: "", // URL for 'me' avatar (e.g., GitHub profile pic)
      fallbackText: "DJ" // Initials or text for fallback
    },
    visitor: {
      imageUrl: "", // URL for visitor avatar (empty means use fallback)
      fallbackText: "?" // Placeholder for visitor
    },
    sizePx: 32,        // Diameter/width of the avatar
    shape: "circle",   // Shape: "circle" or "square"
    xOffsetPx: 8,      // Horizontal space between avatar and chat edge/bubble
    yOffsetPx: 0       // Vertical alignment offset relative to top of bubble
  },

  // Theme definitions
  themes: {
    // iOS theme (based on existing styles)
    ios: {
      ME_BUBBLE_COLOR: '#0B93F6',     // iOS blue for my messages
      VISITOR_BUBBLE_COLOR: '#E5E5EA', // iOS gray for visitor messages
      ME_TEXT_COLOR: '#FFFFFF',       // White text for my messages
      VISITOR_TEXT_COLOR: '#000000',  // Black text for visitor messages
      BACKGROUND_LIGHT: '#FFFFFF',    // iOS light background
      BACKGROUND_DARK: '#000000',     // iOS dark background
      BUBBLE_RADIUS_PX: 18,           // Rounded bubble corners
      FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      
      // Reaction styling for iOS theme
      REACTION_FONT_SIZE_PX: 14,          // Emoji font size
      REACTION_BG_COLOR: '#F1F1F1',       // Light gray background
      REACTION_BG_OPACITY: 0.9,           // Slightly transparent
      REACTION_TEXT_COLOR: '#000000',     // Black text (for future non-emoji reactions)
      REACTION_PADDING_X_PX: 8,           // Horizontal padding
      REACTION_PADDING_Y_PX: 4,           // Vertical padding
      REACTION_BORDER_RADIUS_PX: 12,      // Rounded corners like iOS reactions
      REACTION_OFFSET_X_PX: 0,            // Horizontal position offset
      REACTION_OFFSET_Y_PX: -12,          // Position above the bubble
      
      // Chart styling for iOS theme
      CHART_STYLES: {
        BAR_DEFAULT_COLOR: '#007AFF',     // iOS blue for bars
        BAR_HEIGHT_PX: 22,                // Height of individual bars
        BAR_SPACING_PX: 12,               // Vertical spacing between bars
        LABEL_FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        LABEL_FONT_SIZE_PX: 14,           // Font size for bar labels
        LABEL_COLOR: '#000000',           // Black text for labels
        LABEL_MAX_WIDTH_PX: 100,          // Maximum width for labels
        VALUE_TEXT_FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        VALUE_TEXT_FONT_SIZE_PX: 12,      // Font size for value text
        VALUE_TEXT_COLOR: '#000000',      // Black text for values
        TITLE_FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        TITLE_FONT_SIZE_PX: 16,           // Font size for chart title
        TITLE_COLOR: '#000000',           // Black text for title
        CHART_PADDING_X_PX: 14,           // Horizontal padding
        CHART_PADDING_Y_PX: 16,           // Vertical padding
        AXIS_LINE_COLOR: '#E5E5EA',       // Light gray for axis lines
        GRID_LINE_COLOR: '#F5F5F5'        // Very light gray for grid lines
      }
    },
    
    // Android theme (new)
    android: {
      ME_BUBBLE_COLOR: '#D1E6FF',     // Android-like light blue
      VISITOR_BUBBLE_COLOR: '#F0F0F0', // Light gray
      ME_TEXT_COLOR: '#000000',       // Black text on light bubble
      VISITOR_TEXT_COLOR: '#000000',  // Black text on light bubble
      BACKGROUND_LIGHT: '#FFFFFF',    // White background for light mode
      BACKGROUND_DARK: '#121212',     // Material Design dark background
      BUBBLE_RADIUS_PX: 8,            // Less rounded corners for Android
      FONT_FAMILY: "'Roboto', sans-serif", // Android default font
      
      // Reaction styling for Android theme
      REACTION_FONT_SIZE_PX: 14,          // Emoji font size
      REACTION_BG_COLOR: '#E8E8E8',       // Material design light gray 
      REACTION_BG_OPACITY: 1.0,           // Fully opaque (Android style)
      REACTION_TEXT_COLOR: '#000000',     // Black text
      REACTION_PADDING_X_PX: 6,           // Horizontal padding
      REACTION_PADDING_Y_PX: 3,           // Vertical padding
      REACTION_BORDER_RADIUS_PX: 12,      // Circular reactions (Material Design)
      REACTION_OFFSET_X_PX: 0,            // Horizontal position offset
      REACTION_OFFSET_Y_PX: -10,          // Position above the bubble
      
      // Chart styling for Android theme
      CHART_STYLES: {
        BAR_DEFAULT_COLOR: '#4285F4',     // Google blue for bars
        BAR_HEIGHT_PX: 20,                // Height of individual bars
        BAR_SPACING_PX: 14,               // Vertical spacing between bars
        LABEL_FONT_FAMILY: "'Roboto', sans-serif",
        LABEL_FONT_SIZE_PX: 14,           // Font size for bar labels
        LABEL_COLOR: '#000000',           // Black text for labels
        LABEL_MAX_WIDTH_PX: 100,          // Maximum width for labels
        VALUE_TEXT_FONT_FAMILY: "'Roboto', sans-serif",
        VALUE_TEXT_FONT_SIZE_PX: 12,      // Font size for value text
        VALUE_TEXT_COLOR: '#757575',      // Gray text for values (Material Design)
        TITLE_FONT_FAMILY: "'Roboto', sans-serif",
        TITLE_FONT_SIZE_PX: 16,           // Font size for chart title
        TITLE_COLOR: '#212121',           // Dark gray for title (Material Design)
        CHART_PADDING_X_PX: 16,           // Horizontal padding
        CHART_PADDING_Y_PX: 16,           // Vertical padding
        AXIS_LINE_COLOR: '#E0E0E0',       // Light gray for axis lines (Material Design)
        GRID_LINE_COLOR: '#F5F5F5'        // Very light gray for grid lines
      }
    }
  },
  
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
  
  // Cache settings for API requests
  cache: {
    WEATHER_CACHE_TTL_MS: 1800000, // Time To Live for weather data cache in milliseconds (30 minutes)
    GITHUB_CACHE_TTL_MS: 3600000   // TTL for GitHub data cache (1 hour)
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
    // Font settings (now sourced from active theme)
    FONT_SIZE_PX: 14,
    LINE_HEIGHT_PX: 20,
    
    // Bubble dimensions
    BUBBLE_PAD_X_PX: 12,
    BUBBLE_PAD_Y_PX: 8,
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
      DELIVERED_TEXT: "Delivered",
      READ_TEXT: "Read",
      FONT_SIZE_PX: 10,
      COLOR_ME: "#FFFFFFB3", // Semi-transparent white for subtle appearance
      OFFSET_Y_PX: 12,
      ANIMATION_DELAY_SEC: 0.2,
      FADE_IN_DURATION_SEC: 0.3,
      READ_DELAY_SEC: 1.5,   // Delay before switching from "Delivered" to "Read"
      READ_TRANSITION_SEC: 0.2 // Time to transition to "Read" status
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
      MESSAGE_VERTICAL_SPACING: 28,      // Spacing between message bubbles
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
      
      // Reaction animations 
      REACTION_ANIMATION_DURATION_SEC: 0.3,     // Duration of reaction animation
      REACTION_ANIMATION_DELAY_FACTOR_SEC: 1.1, // Delay after "Read" status appears
      
      // Chart animations
      CHART_BAR_ANIMATION_DURATION_SEC: 0.8,    // Duration of bar growth animation
      CHART_ANIMATION_DELAY_SEC: 0.3,           // Delay between successive bar animations
      
      // Shadow effect
      SHADOW_BLUR: 1,                   // Shadow blur amount
      SHADOW_OFFSET_X: 0,               // Shadow X offset
      SHADOW_OFFSET_Y: 1,               // Shadow Y offset
      SHADOW_OPACITY: 0.15,             // Shadow opacity
      
      // Scroll animation
      SCROLL_DELAY_BUFFER_SEC: 3.5,     // Delay after last message before scrolling starts
      MIN_SCROLL_DURATION_SEC: 1.2,     // Minimum scroll duration in seconds
      SCROLL_PIXELS_PER_SEC: 20,        // Pixels scrolled per second for a natural pace
    }
  }
};