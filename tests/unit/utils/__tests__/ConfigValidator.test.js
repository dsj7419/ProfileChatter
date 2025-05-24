/**
 * ConfigValidator.test.js
 * Unit tests for configuration validation including Twitter manual input support
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validateConfiguration } from '../../../../src/utils/ConfigValidator.js';

describe('ConfigValidator', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Helper function to create a valid configuration
  function createValidConfig() {
    return {
      activeTheme: 'ios',
      avatars: {
        enabled: true,
        me: { imageUrl: 'test.jpg', fallbackText: 'ME' },
        visitor: { imageUrl: 'visitor.jpg', fallbackText: 'V' },
        sizePx: 32,
        shape: 'circle',
        xOffsetPx: 0,
        yOffsetPx: 0
      },
      weather: {
        enabled: true
      },
      twitter: {
        enabled_api_fetch: false
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
          FONT_FAMILY: 'Arial, sans-serif',
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
            LABEL_FONT_FAMILY: 'Arial, sans-serif',
            LABEL_FONT_SIZE_PX: 13,
            VALUE_TEXT_FONT_FAMILY: 'Arial, sans-serif',
            VALUE_TEXT_FONT_SIZE_PX: 12,
            TITLE_FONT_FAMILY: 'Arial, sans-serif',
            TITLE_FONT_SIZE_PX: 15,
            TITLE_LINE_HEIGHT_MULTIPLIER: 1.3,
            TITLE_BOTTOM_MARGIN_PX: 10,
            CHART_PADDING_X_PX: 16,
            CHART_PADDING_Y_PX: 14,
            AXIS_LINE_COLOR: '#D3D3D8',
            GRID_LINE_COLOR: '#F5F5F5',
            ME_TITLE_COLOR: '#FFFFFF',
            ME_LABEL_COLOR: '#E2F0FF',
            ME_VALUE_TEXT_COLOR: '#FFFFFF',
            VISITOR_TITLE_COLOR: '#000000',
            VISITOR_LABEL_COLOR: '#444444',
            VISITOR_VALUE_TEXT_COLOR: '#000000',
            DONUT_STROKE_WIDTH_PX: 30,
            DONUT_CENTER_TEXT_FONT_SIZE_PX: 16,
            DONUT_CENTER_TEXT_FONT_FAMILY: 'Arial, sans-serif',
            ME_DONUT_CENTER_TEXT_COLOR: '#FFFFFF',
            VISITOR_DONUT_CENTER_TEXT_COLOR: '#000000',
            ME_DONUT_LEGEND_TEXT_COLOR: '#FFFFFF',
            VISITOR_DONUT_LEGEND_TEXT_COLOR: '#000000',
            DONUT_LEGEND_FONT_SIZE_PX: 12,
            DONUT_LEGEND_ITEM_SPACING_PX: 8,
            DONUT_LEGEND_MARKER_SIZE_PX: 10,
            DONUT_ANIMATION_DURATION_SEC: 1.0,
            DONUT_SEGMENT_ANIMATION_DELAY_SEC: 0.2
          }
        }
      },
      profile: {
        NAME: 'Test User',
        PROFESSION: 'Developer',
        LOCATION: 'Test City',
        COMPANY: 'Test Company',
        CURRENT_PROJECT: 'Test Project',
        WORK_START_DATE: new Date(2020, 0, 1),
        GITHUB_USERNAME: 'testuser',
        WAKATIME_USERNAME: 'testuser',
        TWITTER_USERNAME: 'testuser',
        TWITTER_FOLLOWERS: '100',
        CODESTATS_USERNAME: 'testuser'
      },
      cache: {
        WEATHER_CACHE_TTL_MS: 1800000,
        GITHUB_CACHE_TTL_MS: 3600000,
        TWITTER_CACHE_TTL_MS: 3600000,
        CODESTATS_CACHE_TTL_MS: 7200000
      },
      apiDefaults: {
        TEMPERATURE: '72°F',
        WEATHER_DESCRIPTION: 'sunny',
        WEATHER_EMOJI: '☀️',
        GITHUB_PUBLIC_REPOS: '10',
        GITHUB_FOLLOWERS: '50',
        TWITTER_FOLLOWERS: '100',
        CODESTATS_XP: '1000'
      },
      layout: {
        FONT_SIZE_PX: 14,
        LINE_HEIGHT_PX: 20,
        CHAT_WIDTH_PX: 320,
        CHAT_HEIGHT_PX: 450,
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
        VISIBLE_MESSAGES: 6,
        STATUS_INDICATOR: {
          DELIVERED_TEXT: 'Delivered',
          READ_TEXT: 'Read',
          FONT_SIZE_PX: 10,
          COLOR_ME: '#FFFFFF',
          OFFSET_Y_PX: 10,
          ANIMATION_DELAY_SEC: 0.2,
          FADE_IN_DURATION_SEC: 0.3,
          READ_DELAY_SEC: 1.5,
          READ_TRANSITION_SEC: 0.2
        },
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
          BUBBLE_ANIMATION_CURVE: 'cubic-bezier(.36,1.64,.36,1)',
          BUBBLE_START_SCALE: 0.8,
          REACTION_ANIMATION_DURATION_SEC: 0.3,
          REACTION_ANIMATION_DELAY_FACTOR_SEC: 1.1,
          CHART_BAR_ANIMATION_DURATION_SEC: 0.8,
          CHART_ANIMATION_DELAY_SEC: 0.3,
          SHADOW_BLUR: 1,
          SHADOW_OFFSET_X: 0,
          SHADOW_OFFSET_Y: 1,
          SHADOW_OPACITY: 0.15,
          SCROLL_DELAY_BUFFER_SEC: 2.2,
          MIN_SCROLL_DURATION_SEC: 1.2,
          SCROLL_PIXELS_PER_SEC: 18
        }
      },
      wakatime: {
        enabled: true,
        defaults: {
          wakatime_summary: 'No data',
          wakatime_top_language: 'JavaScript',
          wakatime_top_language_percent: '0'
        },
        cacheTtlMs: 7200000
      }
    };
  }

  describe('validateConfiguration', () => {
    it('should validate a correct configuration', () => {
      const validConfig = createValidConfig();
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should fail when config is null', () => {
      const result = validateConfiguration(null);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: Root config must be an object.');
    });

    it('should fail when config is not an object', () => {
      const result = validateConfiguration('invalid');
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: Root config must be an object.');
    });

    it('should fail when activeTheme does not exist in themes', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.activeTheme = 'nonExistentTheme';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: activeTheme "nonExistentTheme" does not exist in config.themes.');
    });

    it('should fail when layout FONT_SIZE_PX is not a number', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.layout.FONT_SIZE_PX = 'invalid';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.layout.FONT_SIZE_PX must be a number, got string.');
    });

    it('should fail when WORK_START_DATE has invalid year', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.profile.WORK_START_DATE = { year: 1800, month: 1, day: 1 };
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.profile.WORK_START_DATE.year must be a valid year >= 1900');
    });

    it('should fail when WORK_START_DATE has invalid month', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.profile.WORK_START_DATE = { year: 2020, month: 13, day: 1 };
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.profile.WORK_START_DATE.month must be a valid month (1-12)');
    });

    it('should fail when WORK_START_DATE has invalid day', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.profile.WORK_START_DATE = { year: 2020, month: 1, day: 32 };
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.profile.WORK_START_DATE.day must be a valid day (1-31)');
    });

    it('should handle WORK_START_DATE as Date object', () => {
      const validConfig = createValidConfig();
      validConfig.profile.WORK_START_DATE = new Date(2020, 0, 1);
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should handle WORK_START_DATE as object with year/month/day', () => {
      const validConfig = createValidConfig();
      validConfig.profile.WORK_START_DATE = { year: 2020, month: 1, day: 1 };
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should fail when hex color is invalid', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.themes.ios.ME_BUBBLE_COLOR = 'invalid-color';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('must be a valid hex color'));
    });

    it('should fail when opacity value is out of range', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.themes.ios.REACTION_BG_OPACITY = 1.5;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('must be between 0 and 1'));
    });

    it('should fail when required string is empty', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.profile.NAME = '';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.profile.NAME cannot be an empty string.');
    });

    it('should fail when positive number is negative', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.layout.FONT_SIZE_PX = -5;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.layout.FONT_SIZE_PX must be a positive number, got -5.');
    });

    it('should fail when avatar shape is invalid', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.avatars.shape = 'triangle';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('must be one of: circle, square'));
    });

    it('should fail when boolean is not boolean', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.avatars.enabled = 'true';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.avatars.enabled must be a boolean, got string.');
    });

    it('should validate string representing number correctly', () => {
      const validConfig = createValidConfig();
      validConfig.apiDefaults.GITHUB_PUBLIC_REPOS = '123';
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should fail when string does not represent number', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.apiDefaults.GITHUB_PUBLIC_REPOS = 'not-a-number';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('must be a string representing a number'));
    });

    // Test various null object scenarios
    it('should fail when profile config is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.profile = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.profile must be an object.');
    });

    it('should fail when profile config is not an object', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.profile = 'invalid';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.profile must be an object.');
    });

    it('should fail when layout ANIMATION object is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.layout.ANIMATION = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.layout.ANIMATION must be an object.');
    });

    it('should fail when layout ANIMATION object is not an object', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.layout.ANIMATION = 'invalid';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.layout.ANIMATION must be an object.');
    });

    it('should fail when DOT_ANIMATION_DURATION is not a number', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.layout.ANIMATION.DOT_ANIMATION_DURATION = 'invalid';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.layout.ANIMATION.DOT_ANIMATION_DURATION must be a number, got string.');
    });

    it('should fail when STATUS_INDICATOR object is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.layout.STATUS_INDICATOR = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.layout.STATUS_INDICATOR must be an object.');
    });

    it('should fail when TIMING object is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.layout.TIMING = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.layout.TIMING must be an object.');
    });

    it('should fail when avatars me object is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.avatars.me = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.avatars.me must be an object.');
    });

    it('should fail when avatars visitor object is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.avatars.visitor = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.avatars.visitor must be an object.');
    });

    it('should fail when theme CHART_STYLES object is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.themes.ios.CHART_STYLES = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.themes.ios.CHART_STYLES must be an object.');
    });

    it('should fail when wakatime defaults object is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.wakatime.defaults = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.wakatime.defaults must be an object.');
    });

    it('should fail when cache object is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.cache = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.cache must be an object.');
    });

    it('should fail when apiDefaults object is null', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.apiDefaults = null;
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.apiDefaults must be an object.');
    });

    it('should validate weather configuration correctly', () => {
      const validConfig = createValidConfig();
      validConfig.weather.enabled = false;
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should fail when weather.enabled is not a boolean', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.weather.enabled = 'true';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.weather.enabled must be a boolean, got string.');
    });

    it('should validate twitter configuration correctly', () => {
      const validConfig = createValidConfig();
      validConfig.twitter.enabled_api_fetch = true;
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should fail when twitter.enabled_api_fetch is not a boolean', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.twitter.enabled_api_fetch = 'true';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.twitter.enabled_api_fetch must be a boolean, got string.');
    });

    it('should validate TWITTER_FOLLOWERS as string representing number', () => {
      const validConfig = createValidConfig();
      validConfig.profile.TWITTER_FOLLOWERS = '250';
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should allow empty string for TWITTER_FOLLOWERS', () => {
      const validConfig = createValidConfig();
      validConfig.profile.TWITTER_FOLLOWERS = '';
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should fail when TWITTER_FOLLOWERS is not a valid number string', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.profile.TWITTER_FOLLOWERS = 'not-a-number';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.profile.TWITTER_FOLLOWERS must be a string representing a number, got \'not-a-number\'.');
    });

    it('should validate twitter configuration correctly', () => {
      const validConfig = createValidConfig();
      validConfig.twitter.enabled_api_fetch = true;
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should fail when twitter.enabled_api_fetch is not a boolean', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.twitter.enabled_api_fetch = 'true';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.twitter.enabled_api_fetch must be a boolean, got string.');
    });

    it('should validate TWITTER_FOLLOWERS as string representing number', () => {
      const validConfig = createValidConfig();
      validConfig.profile.TWITTER_FOLLOWERS = '250';
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should allow empty string for TWITTER_FOLLOWERS', () => {
      const validConfig = createValidConfig();
      validConfig.profile.TWITTER_FOLLOWERS = '';
      const result = validateConfiguration(validConfig);
      expect(result).toBe(true);
    });

    it('should fail when TWITTER_FOLLOWERS is not a valid number string', () => {
      const invalidConfig = createValidConfig();
      invalidConfig.profile.TWITTER_FOLLOWERS = 'not-a-number';
      const result = validateConfiguration(invalidConfig);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Configuration error: config.profile.TWITTER_FOLLOWERS must be a string representing a number, got \'not-a-number\'.');
    });
  });
});