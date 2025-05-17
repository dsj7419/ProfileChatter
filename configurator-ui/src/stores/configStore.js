import { writable } from 'svelte/store';

// Initial profile configuration that mirrors the structure in config.js
const initialProfileConfig = {
  NAME: "Your Name",
  PROFESSION: "Your Profession",
  LOCATION: "Your City",
  COMPANY: "Your Company",
  CURRENT_PROJECT: "ProfileChatter SVG Generator",
  GITHUB_USERNAME: "your_github",
  WAKATIME_USERNAME: "your_wakatime",
  TWITTER_USERNAME: "",
  CODESTATS_USERNAME: ""
};

// Initial avatar configuration that mirrors the structure in config.js
const initialAvatarsConfig = {
  enabled: true,
  me: { imageUrl: "", fallbackText: "ME" }, // Default to "ME" or user's initials if available
  visitor: { imageUrl: "", fallbackText: "?" },
  sizePx: 32, // Could be configurable later, for now use default
  shape: "circle", // 'circle' or 'square'
  // xOffsetPx and yOffsetPx are layout details, less critical for user UI in MVP
};

// Client-side safe version of the themes from config.js
const clientSideThemes = {
  ios: {
    ME_BUBBLE_COLOR: '#0B93F6',
    VISITOR_BUBBLE_COLOR: '#E5E5EA',
    ME_TEXT_COLOR: '#FFFFFF',
    VISITOR_TEXT_COLOR: '#000000',
    BACKGROUND_LIGHT: '#FFFFFF',
    BACKGROUND_DARK: '#000000',
    BUBBLE_RADIUS_PX: 18,
    FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    
    REACTION_FONT_SIZE_PX: 20,
    REACTION_BG_COLOR: '#F1F1F1',
    REACTION_BG_OPACITY: 0.9,
    REACTION_TEXT_COLOR: '#000000',
    REACTION_PADDING_X_PX: 8,
    REACTION_PADDING_Y_PX: 4,
    REACTION_BORDER_RADIUS_PX: 14,
    REACTION_OFFSET_X_PX: 0,
    REACTION_OFFSET_Y_PX: -12,
    
    CHART_STYLES: {
      BAR_DEFAULT_COLOR: '#007AFF',
      BAR_TRACK_COLOR: '#D3D3D8',
      BAR_CORNER_RADIUS_PX: 8,
      VALUE_TEXT_INSIDE_COLOR: '#FFFFFF',
      BAR_HEIGHT_PX: 18,
      BAR_SPACING_PX: 10,
      LABEL_FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      LABEL_FONT_SIZE_PX: 13,
      VALUE_TEXT_FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      VALUE_TEXT_FONT_SIZE_PX: 12,
      TITLE_FONT_FAMILY: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      TITLE_FONT_SIZE_PX: 15,
      TITLE_LINE_HEIGHT_MULTIPLIER: 1.3,
      TITLE_BOTTOM_MARGIN_PX: 10,
      CHART_PADDING_X_PX: 16,
      CHART_PADDING_Y_PX: 14,
      AXIS_LINE_COLOR: '#E5E5EA',
      GRID_LINE_COLOR: '#F5F5F5',
      DONUT_STROKE_WIDTH_PX: 30,
      DONUT_CENTER_TEXT_FONT_SIZE_PX: 16,
      DONUT_CENTER_TEXT_FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      ME_DONUT_CENTER_TEXT_COLOR: '#FFFFFF',
      VISITOR_DONUT_CENTER_TEXT_COLOR: '#000000',
      ME_DONUT_LEGEND_TEXT_COLOR: '#FFFFFF',
      VISITOR_DONUT_LEGEND_TEXT_COLOR: '#000000',
      DONUT_LEGEND_FONT_SIZE_PX: 12,
      DONUT_LEGEND_ITEM_SPACING_PX: 8,
      DONUT_LEGEND_MARKER_SIZE_PX: 10,
      DONUT_ANIMATION_DURATION_SEC: 1.0,
      DONUT_SEGMENT_ANIMATION_DELAY_SEC: 0.1,
    
      ME_TITLE_COLOR: '#FFFFFF',
      ME_LABEL_COLOR: '#FFFFFF',
      ME_VALUE_TEXT_COLOR: '#FFFFFF',
    
      VISITOR_TITLE_COLOR: '#000000',
      VISITOR_LABEL_COLOR: '#000000',
      VISITOR_VALUE_TEXT_COLOR: '#333333',
    }
  },
  
  android: {
    ME_BUBBLE_COLOR: '#D1E6FF',
    VISITOR_BUBBLE_COLOR: '#F0F0F0',
    ME_TEXT_COLOR: '#000000',
    VISITOR_TEXT_COLOR: '#000000',
    BACKGROUND_LIGHT: '#FFFFFF',
    BACKGROUND_DARK: '#121212',
    BUBBLE_RADIUS_PX: 8,
    FONT_FAMILY: "'Roboto', sans-serif",
    
    REACTION_FONT_SIZE_PX: 14,
    REACTION_BG_COLOR: '#E8E8E8',
    REACTION_BG_OPACITY: 1.0,
    REACTION_TEXT_COLOR: '#000000',
    REACTION_PADDING_X_PX: 6,
    REACTION_PADDING_Y_PX: 3,
    REACTION_BORDER_RADIUS_PX: 12,
    REACTION_OFFSET_X_PX: 0,
    REACTION_OFFSET_Y_PX: -10,
    
    CHART_STYLES: {
      BAR_DEFAULT_COLOR: '#4285F4',
      BAR_TRACK_COLOR: '#E0E0E0',
      BAR_CORNER_RADIUS_PX: 7,
      VALUE_TEXT_INSIDE_COLOR: '#FFFFFF',
      BAR_HEIGHT_PX: 16,
      BAR_SPACING_PX: 9,
      LABEL_FONT_FAMILY: "'Roboto', sans-serif",
      LABEL_FONT_SIZE_PX: 13,
      VALUE_TEXT_FONT_FAMILY: "'Roboto', sans-serif",
      VALUE_TEXT_FONT_SIZE_PX: 12,
      TITLE_FONT_FAMILY: "'Roboto Medium', 'Roboto', sans-serif",
      TITLE_FONT_SIZE_PX: 15,
      TITLE_LINE_HEIGHT_MULTIPLIER: 1.3,
      TITLE_BOTTOM_MARGIN_PX: 10,
      CHART_PADDING_X_PX: 16,
      CHART_PADDING_Y_PX: 14,
      AXIS_LINE_COLOR: '#E0E0E0',
      GRID_LINE_COLOR: '#F5F5F5',
      DONUT_STROKE_WIDTH_PX: 28,
      DONUT_CENTER_TEXT_FONT_SIZE_PX: 16,
      DONUT_CENTER_TEXT_FONT_FAMILY: "'Roboto', sans-serif",
      ME_DONUT_CENTER_TEXT_COLOR: '#000000',
      VISITOR_DONUT_CENTER_TEXT_COLOR: '#000000',
      ME_DONUT_LEGEND_TEXT_COLOR: '#000000',
      VISITOR_DONUT_LEGEND_TEXT_COLOR: '#000000',
      DONUT_LEGEND_FONT_SIZE_PX: 12,
      DONUT_LEGEND_ITEM_SPACING_PX: 8,
      DONUT_LEGEND_MARKER_SIZE_PX: 10,
      DONUT_ANIMATION_DURATION_SEC: 1.0,
      DONUT_SEGMENT_ANIMATION_DELAY_SEC: 0.1,
    
      ME_TITLE_COLOR: '#000000',
      ME_LABEL_COLOR: '#000000',
      ME_VALUE_TEXT_COLOR: '#222222',
    
      VISITOR_TITLE_COLOR: '#000000',
      VISITOR_LABEL_COLOR: '#000000',
      VISITOR_VALUE_TEXT_COLOR: '#424242',
    }
  }
};

// Main configuration store
export const userConfig = writable({
  profile: { ...initialProfileConfig },
  activeTheme: "ios", // Default theme
  avatars: { ...initialAvatarsConfig }, // Add avatar config
  // other config sections will be added later
});

// Create a new editable theme store that tracks the current theme object
export const editableTheme = writable(JSON.parse(JSON.stringify(clientSideThemes.ios))); // Default to iOS

// Subscribe to userConfig changes to update the editableTheme
userConfig.subscribe(value => {
  if (value.activeTheme && clientSideThemes[value.activeTheme]) {
    editableTheme.set(JSON.parse(JSON.stringify(clientSideThemes[value.activeTheme])));
  }
});

// Separate store for WORK_START_DATE as string components
export const workStartDate = writable({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1, // 1-indexed for UI
  day: new Date().getDate()
});

// Store for chat messages
export const chatMessages = writable([]);