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

// Initial placeholder data
const initialPlaceholderData = [
  // Profile Info category
  {
    id: 'name',
    value: '{name}',
    label: 'User\'s Name',
    description: 'Your full name as configured in the Profile Settings.',
    category: 'Profile Info'
  },
  {
    id: 'profession',
    value: '{profession}',
    label: 'Profession',
    description: 'Your professional title or occupation as set in Profile Settings.',
    category: 'Profile Info'
  },
  {
    id: 'location',
    value: '{location}',
    label: 'Location',
    description: 'Your geographical location as defined in Profile Settings.',
    category: 'Profile Info'
  },
  {
    id: 'company',
    value: '{company}',
    label: 'Company',
    description: 'Your current company or organization name from Profile Settings.',
    category: 'Profile Info'
  },
  {
    id: 'currentProject',
    value: '{currentProject}',
    label: 'Current Project',
    description: 'The name of your current project as set in Profile Settings.',
    category: 'Profile Info'
  },
  {
    id: 'workTenure',
    value: '{workTenure}',
    label: 'Work Tenure',
    description: 'Time period at current company, calculated from Work Start Date.',
    category: 'Profile Info'
  },

  // Date & Time category
  {
    id: 'currentDayOfWeek',
    value: '{currentDayOfWeek}',
    label: 'Current Day of Week',
    description: 'The current day of the week (e.g., Monday, Tuesday).',
    category: 'Date & Time'
  },
  {
    id: 'currentDate',
    value: '{currentDate}',
    label: 'Current Date',
    description: 'The current date in a readable format (e.g., January 1, 2025).',
    category: 'Date & Time'
  },

  // Weather category
  {
    id: 'temperature',
    value: '{temperature}',
    label: 'Temperature',
    description: 'Current temperature at your location, fetched from AccuWeather API.',
    category: 'Weather'
  },
  {
    id: 'weatherDescription',
    value: '{weatherDescription}',
    label: 'Weather Description',
    description: 'Text description of current weather conditions at your location.',
    category: 'Weather'
  },
  {
    id: 'emoji',
    value: '{emoji}',
    label: 'Weather Emoji',
    description: 'An emoji representing the current weather conditions.',
    category: 'Weather'
  },

  // GitHub Stats category
  {
    id: 'githubPublicRepos',
    value: '{githubPublicRepos}',
    label: 'GitHub Public Repos',
    description: 'Number of your public repositories on GitHub.',
    category: 'GitHub Stats'
  },
  {
    id: 'githubFollowers',
    value: '{githubFollowers}',
    label: 'GitHub Followers',
    description: 'Your current follower count on GitHub.',
    category: 'GitHub Stats'
  },

  // WakaTime category
  {
    id: 'wakatime_summary',
    value: '{wakatime_summary}',
    label: 'WakaTime Summary',
    description: 'A summary of your coding activity from WakaTime.',
    category: 'WakaTime'
  },
  {
    id: 'wakatime_top_language',
    value: '{wakatime_top_language}',
    label: 'WakaTime Top Language',
    description: 'Your most used programming language according to WakaTime.',
    category: 'WakaTime'
  },
  {
    id: 'wakatime_top_language_percent',
    value: '{wakatime_top_language_percent}',
    label: 'WakaTime Top Language Percentage',
    description: 'Percentage of time spent using your top language on WakaTime.',
    category: 'WakaTime'
  },

  // Twitter Stats category
  {
    id: 'twitterFollowers',
    value: '{twitterFollowers}',
    label: 'Twitter Followers',
    description: 'Your current follower count on Twitter/X.',
    category: 'Twitter Stats'
  },

  // Code::Stats category
  {
    id: 'codestatsXP',
    value: '{codestatsXP}',
    label: 'Code::Stats XP',
    description: 'Your experience points accumulated on Code::Stats.',
    category: 'Code::Stats'
  },
  
  // Spotify category
  {
    id: 'spotifyTrack',
    value: '{spotifyTrack}',
    label: 'Spotify Track',
    description: 'Currently playing or last played track on Spotify (e.g., "Song Title by Artist Name"). Requires Spotify connection.',
    category: 'Spotify'
  },
  {
    id: 'githubTotalStars',
    value: '{githubTotalStars}',
    label: 'GitHub Total Stars',
    description: 'Total number of stars received across all your repositories.',
    category: 'GitHub Stats (OAuth)'
  },
  {
    id: 'githubCommitsLastYear',
    value: '{githubCommitsLastYear}',
    label: 'GitHub Commits (Last Year)',
    description: 'Approximate number of commits you made in the last year.',
    category: 'GitHub Stats (OAuth)'
  },
  {
    id: 'githubContributedRepos',
    value: '{githubContributedRepos}',
    label: 'GitHub Contributed Repos',
    description: 'Number of repositories you have contributed to.',
    category: 'GitHub Stats (OAuth)'
  },
  {
    id: 'githubPrimaryLanguage',
    value: '{githubPrimaryLanguage}',
    label: 'GitHub Primary Language',
    description: 'Your most used programming language based on repository count.',
    category: 'GitHub Stats (OAuth)'
  }
];

/**
 * Debounce utility function - limits how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} wait - Time to wait in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 2000) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Save current configuration to local file system via server API
 * @async
 */
async function saveLocalConfigToServer() {
  try {
    const fullConfig = getPreviewConfiguration();
    console.log('Saving configuration to local file system...');
    
    const response = await fetch('http://localhost:3001/api/save-local-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullConfig)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server responded with ${response.status}: ${errorData.error || 'Unknown error'}`);
    }
    
    const result = await response.json();
    console.log('Configuration saved successfully:', result.message);
  } catch (error) {
    console.error('Failed to save local configuration:', error.message);
  }
}

// Create debounced version of the save function with 2-second delay
const debouncedSaveLocalConfig = debounce(saveLocalConfigToServer, 2000);

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
    layout: { 
      ANIMATION: { 
        SCROLL_SPEED_MULTIPLIER: 1.0 
      } 
    }
  });

// Source of themes with defaults
export const themes = writable(deepClone(defaultThemes));

// Source of font options
export const fontOptions = writable(deepClone(defaultFontOptions));

// Create a store for the editable theme based on the active theme
export const editableTheme = writable(deepClone(defaultThemes.ios));

// Create a store for placeholder data
export const placeholderData = writable(deepClone(initialPlaceholderData));

// Create a store for the preview mode (light/dark)
/** 
 * Single source-of-truth for light/dark preview state.
 * Values: 'light' | 'dark'
 */
export const previewMode = writable('light');

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

// Flag to track initial load status
let initialLoadComplete = false;

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
  
  // Mark initial load as complete after loading from server
  initialLoadComplete = true;
}).catch(error => {
  console.error('Error during initial config load:', error);
  // Mark as complete even on error, so we can start saving changes
  initialLoadComplete = true;
});

// Separate store for WORK_START_DATE as string components
export const workStartDate = writable({
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1, // 1-indexed for UI
  day: new Date().getDate()
});

// Store for chat messages
export const chatMessages = writable([]);

// Set up subscriptions to save configuration on changes
userConfig.subscribe(() => {
  if (initialLoadComplete) {
    debouncedSaveLocalConfig();
  }
});

editableTheme.subscribe(() => {
  if (initialLoadComplete) {
    debouncedSaveLocalConfig();
  }
});

chatMessages.subscribe(() => {
  if (initialLoadComplete) {
    debouncedSaveLocalConfig();
  }
});

workStartDate.subscribe(() => {
  if (initialLoadComplete) {
    debouncedSaveLocalConfig();
  }
});

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
    
    // Add console log to verify profile data is being included correctly
    console.log('getPreviewConfiguration profile data:', {
      name: currentConfig.profile.NAME,
      profession: currentConfig.profile.PROFESSION,
      location: currentConfig.profile.LOCATION
    });
    
    return {
      profile: {
        ...currentConfig.profile,
        WORK_START_DATE: {
          year: currentWorkDate.year,
          month: currentWorkDate.month,
          day: currentWorkDate.day
        }
      },
      activeTheme: currentConfig.activeTheme,
      avatars: currentConfig.avatars,
      chatMessages: currentMessages,
      themeOverrides: currentTheme,
      layoutAnimationOverrides: {
        SCROLL_SPEED_MULTIPLIER: currentConfig.layout?.ANIMATION?.SCROLL_SPEED_MULTIPLIER || 1.0
      }
    };
  }