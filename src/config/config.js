/**
 * config.js
 * Unified configuration file for all application settings
 * Single Responsibility: Store and provide all application configurations
 */

import { makeDate } from '../utils/dateHelper.js';

export const config = {
  activeTheme: "ios",

  avatars: {
    enabled: true,
    me: { imageUrl: "", fallbackText: "DJ" },
    visitor: { imageUrl: "", fallbackText: "?" },
    sizePx: 32,
    shape: "circle",
    xOffsetPx: 8,
    yOffsetPx: 0
  },

  themes: {
    ios: {
      ME_BUBBLE_COLOR: '#0B93F6',
      VISITOR_BUBBLE_COLOR: '#E5E5EA',
      ME_TEXT_COLOR: '#FFFFFF',
      VISITOR_TEXT_COLOR: '#000000',
      BACKGROUND_LIGHT: '#FFFFFF',
      BACKGROUND_DARK: '#000000',
      BUBBLE_RADIUS_PX: 18,
      FONT_FAMILY: "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      
      REACTION_FONT_SIZE_PX: 14,
      REACTION_BG_COLOR: '#F1F1F1',
      REACTION_BG_OPACITY: 0.9,
      REACTION_TEXT_COLOR: '#000000',
      REACTION_PADDING_X_PX: 8,
      REACTION_PADDING_Y_PX: 4,
      REACTION_BORDER_RADIUS_PX: 12,
      REACTION_OFFSET_X_PX: 0,
      REACTION_OFFSET_Y_PX: -12,
      
      CHART_STYLES: {
        BAR_DEFAULT_COLOR: '#007AFF',       // Default for items without specific color
        BAR_TRACK_COLOR:   '#E5E5EA',       // Track for all bars
        BAR_CORNER_RADIUS_PX: 8,
        VALUE_TEXT_INSIDE_COLOR: '#FFFFFF', // Value text when it fits inside the bar (universal)
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
      
        // Sender-specific text colors for charts
        ME_TITLE_COLOR: '#FFFFFF',
        ME_LABEL_COLOR: '#FFFFFF',
        ME_VALUE_TEXT_COLOR: '#FFFFFF',       // For values outside the bar on 'me' charts
      
        VISITOR_TITLE_COLOR: '#000000',
        VISITOR_LABEL_COLOR: '#000000',
        VISITOR_VALUE_TEXT_COLOR: '#333333',  // For values outside the bar on 'visitor' charts
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
        BAR_TRACK_COLOR:   '#E0E0E0',       // Make sure this is consistently defined
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
  
        ME_TITLE_COLOR: '#000000',
        ME_LABEL_COLOR: '#000000',
        ME_VALUE_TEXT_COLOR: '#222222',
  
        VISITOR_TITLE_COLOR: '#000000',
        VISITOR_LABEL_COLOR: '#000000',
        VISITOR_VALUE_TEXT_COLOR: '#424242',  // Dark gray for better contrast
      }
    }
  },
  
  profile: {
    NAME: "Dan Johnson",
    PROFESSION: "Software Developer",
    LOCATION: "San Diego",
    COMPANY: "Encore",
    CURRENT_PROJECT: "ProfileChatter SVG Generator",
    WORK_START_DATE: makeDate(2007, 4, 16),
    GITHUB_USERNAME: "dsj7419",
    WAKATIME_USERNAME: "dsj7419"
  },
  
  cache: {
    WEATHER_CACHE_TTL_MS: 1800000,
    GITHUB_CACHE_TTL_MS: 3600000
  },
  
  apiDefaults: {
    TEMPERATURE: "72°F (22°C)",
    WEATHER_DESCRIPTION: "partly cloudy",
    WEATHER_EMOJI: "⛅",
    GITHUB_PUBLIC_REPOS: "12",
    GITHUB_FOLLOWERS: "48"
  },
  
  layout: {
    FONT_SIZE_PX: 14,
    LINE_HEIGHT_PX: 20,
    BUBBLE_PAD_X_PX: 12,
    BUBBLE_PAD_Y_PX: 8,
    MIN_BUBBLE_W_PX: 40,
    MAX_BUBBLE_W_PX: 260,
    BUBBLE_TAIL_HEIGHT_PX: 25,
    BUBBLE_TAIL_WIDTH_PX: 20,
    BUBBLE_TAIL_EXT_WIDTH_PX: 26,
    BUBBLE_TAIL_RADIUS_X: 16,
    BUBBLE_TAIL_RADIUS_Y: 14,
    TYPING_DOT_RADIUS_PX: 4,
    TYPING_CHAR_MS: 40,
    TYPING_MIN_MS: 1600,
    TYPING_MAX_MS: 3000,
    
    STATUS_INDICATOR: {
      DELIVERED_TEXT: "Delivered",
      READ_TEXT: "Read",
      FONT_SIZE_PX: 10,
      COLOR_ME: "#FFFFFFB3",
      OFFSET_Y_PX: 10,
      ANIMATION_DELAY_SEC: 0.2,
      FADE_IN_DURATION_SEC: 0.3,
      READ_DELAY_SEC: 1.5,
      READ_TRANSITION_SEC: 0.2
    },
    
    VISIBLE_MESSAGES: 6,
    CHAT_WIDTH_PX: 320,
    CHAT_HEIGHT_PX: 450,
    
    TIMING: {
      MIN_READING_TIME_MS: 1000,
      MS_PER_WORD: 250,
      READING_RANDOMNESS_MS: 1000,
      SAME_SENDER_DELAY_MS: 600,
      SENDER_CHANGE_DELAY_MS: 1800,
      MESSAGE_VERTICAL_SPACING: 32,
      BOTTOM_MARGIN: 40,
      ANIMATION_END_BUFFER_MS: 2000
    },
    
    ANIMATION: {
      TYPING_BUBBLE_WIDTH: 70,
      TYPING_BUBBLE_HEIGHT: 36,
      DOT_ANIMATION_DURATION: 1.4,
      DOT_DELAY_2: 0.2,
      DOT_DELAY_3: 0.4,
      DOT_MIN_OPACITY: 0.4,
      DOT_MAX_OPACITY: 1.0,
      DOT_MIN_SCALE: 0.8,
      DOT_MAX_SCALE: 1.0,
      BUBBLE_ANIMATION_DURATION: 0.36,
      BUBBLE_ANIMATION_CURVE: "cubic-bezier(.36,1.64,.36,1)",
      BUBBLE_START_SCALE: 0.8,
      REACTION_ANIMATION_DURATION_SEC: 0.3,
      REACTION_ANIMATION_DELAY_FACTOR_SEC: 1.1,
      CHART_BAR_ANIMATION_DURATION_SEC: 0.8,
      CHART_ANIMATION_DELAY_SEC: 0.3,
      SHADOW_BLUR: 1,
      SHADOW_OFFSET_X: 0,
      SHADOW_OFFSET_Y: 1,
      SHADOW_OPACITY: 0.15,
      SCROLL_DELAY_BUFFER_SEC: 3.2,
      MIN_SCROLL_DURATION_SEC: 1.2,
      SCROLL_PIXELS_PER_SEC: 30,
    }
  },
  
  wakatime: {
    enabled: true,
    defaults: {
      wakatime_summary: "No coding activity data available",
      wakatime_top_language: "N/A",
      wakatime_top_language_percent: "0"
    },
    cacheTtlMs: 7200000
  }
};