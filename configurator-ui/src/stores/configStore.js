import { writable } from 'svelte/store';

// Initial default values
const defaultThemes = {
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
    REACTION_ANIMATION_DURATION_SEC: 0.3,
    REACTION_ANIMATION_DELAY_SEC: 0.2,
    
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
      AXIS_LINE_COLOR: '#D3D3D8',
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
      CHART_BAR_ANIMATION_DURATION_SEC: 0.8,
      CHART_ANIMATION_DELAY_SEC: 0.3,
      BAR_ANIMATION_DURATION_SEC: 0.8,
    
      ME_TITLE_COLOR: '#FFFFFF',
      ME_LABEL_COLOR: '#E2F0FF',
      ME_VALUE_TEXT_COLOR: '#FFFFFF',
    
      VISITOR_TITLE_COLOR: '#000000',
      VISITOR_LABEL_COLOR: '#444444',
      VISITOR_VALUE_TEXT_COLOR: '#000000',
    }
  },
  android: {
    ME_BUBBLE_COLOR: '#D1E6FF',
    VISITOR_BUBBLE_COLOR: '#F0F0F0',
    ME_TEXT_COLOR: '#0D47A1',
    VISITOR_TEXT_COLOR: '#212121',
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
    REACTION_ANIMATION_DURATION_SEC: 0.3,
    REACTION_ANIMATION_DELAY_SEC: 0.2,
    
    CHART_STYLES: {
      BAR_DEFAULT_COLOR: '#4285F4',
      BAR_TRACK_COLOR: '#CCCCCC',
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
      AXIS_LINE_COLOR: '#CCCCCC',
      GRID_LINE_COLOR: '#F5F5F5',
      DONUT_STROKE_WIDTH_PX: 28,
      DONUT_CENTER_TEXT_FONT_SIZE_PX: 16,
      DONUT_CENTER_TEXT_FONT_FAMILY: "'Roboto', sans-serif",
      ME_DONUT_CENTER_TEXT_COLOR: '#0D47A1',
      VISITOR_DONUT_CENTER_TEXT_COLOR: '#212121',
      ME_DONUT_LEGEND_TEXT_COLOR: '#0D47A1',
      VISITOR_DONUT_LEGEND_TEXT_COLOR: '#212121',
      DONUT_LEGEND_FONT_SIZE_PX: 12,
      DONUT_LEGEND_ITEM_SPACING_PX: 8,
      DONUT_LEGEND_MARKER_SIZE_PX: 10,
      DONUT_ANIMATION_DURATION_SEC: 1.0,
      DONUT_SEGMENT_ANIMATION_DELAY_SEC: 0.1,
      CHART_BAR_ANIMATION_DURATION_SEC: 0.8,
      CHART_ANIMATION_DELAY_SEC: 0.3,
      BAR_ANIMATION_DURATION_SEC: 0.8,

      ME_TITLE_COLOR: '#0D47A1',
      ME_LABEL_COLOR: '#1976D2',
      ME_VALUE_TEXT_COLOR: '#0D47A1',

      VISITOR_TITLE_COLOR: '#212121',
      VISITOR_LABEL_COLOR: '#616161',
      VISITOR_VALUE_TEXT_COLOR: '#212121',
    }
  }
};

// Default font options
const defaultFontOptions = {
  standard: [
    "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    "'Roboto', sans-serif",
    "'Roboto Medium', 'Roboto', sans-serif",
    "'Helvetica Neue', Helvetica, Arial, sans-serif",
    "'Arial', sans-serif",
    "'Georgia', serif",
    "'Courier New', monospace"
  ]
};

// Initial profile configuration
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

// Initial avatar configuration
const initialAvatarsConfig = {
  enabled: true,
  me: { imageUrl: "", fallbackText: "ME" },
  visitor: { imageUrl: "", fallbackText: "?" },
  sizePx: 32,
  shape: "circle",
};

// Function to load config from the server API (async)
async function loadConfigFromServer() {
  try {
    const response = await fetch('http://localhost:3001/api/initial-config-data');
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load config from server:', error);
    // Return null on error, we'll fall back to defaults
    return null;
  }
}

// Deep clone helper
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Create stores with default values
export const userConfig = writable({
  profile: deepClone(initialProfileConfig),
  activeTheme: "ios",
  avatars: deepClone(initialAvatarsConfig),
});

// Source of themes with defaults
export const themes = writable(deepClone(defaultThemes));

// Source of font options
export const fontOptions = writable(deepClone(defaultFontOptions));

// Create a store for the editable theme based on the active theme
export const editableTheme = writable(deepClone(defaultThemes.ios));

// When userConfig changes, update the editableTheme
userConfig.subscribe(value => {
  if (value.activeTheme) {
    themes.subscribe(allThemes => {
      if (allThemes[value.activeTheme]) {
        editableTheme.set(deepClone(allThemes[value.activeTheme]));
      }
    });
  }
});

// Try to load config from server (non-blocking)
loadConfigFromServer().then(serverConfig => {
  if (serverConfig) {
    // Update stores with server data
    if (serverConfig.themes) {
      themes.set(deepClone(serverConfig.themes));
    }
    
    if (serverConfig.fontOptions) {
      fontOptions.set(deepClone(serverConfig.fontOptions));
    }
    
    if (serverConfig.defaultProfile) {
      userConfig.update(cfg => ({
        ...cfg,
        profile: deepClone(serverConfig.defaultProfile)
      }));
    }
    
    if (serverConfig.defaultAvatars) {
      userConfig.update(cfg => ({
        ...cfg,
        avatars: deepClone(serverConfig.defaultAvatars)
      }));
    }
    
    if (serverConfig.activeTheme) {
      userConfig.update(cfg => ({
        ...cfg,
        activeTheme: serverConfig.activeTheme
      }));
    }
    
    console.log('Loaded configuration from server');
  } else {
    console.log('Using default configuration');
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

// Get a complete configuration object for the preview
export function getPreviewConfiguration() {
  // Get current values from stores
  let currentConfig;
  let currentTheme;
  let currentMessages;
  let currentWorkDate;
  
  userConfig.subscribe(value => { currentConfig = value; })();
  editableTheme.subscribe(value => { currentTheme = value; })();
  chatMessages.subscribe(value => { currentMessages = value; })();
  workStartDate.subscribe(value => { currentWorkDate = value; })();
  
  return {
    profile: {
      ...currentConfig.profile,
      // Include the date components formatted in the way the preview server expects
      WORK_START_DATE: {
        year: currentWorkDate.year,
        month: currentWorkDate.month,
        day: currentWorkDate.day
      }
    },
    activeTheme: currentConfig.activeTheme,
    avatars: currentConfig.avatars,
    chatMessages: currentMessages,
    // Include theme overrides
    themeOverrides: currentTheme
  };
}