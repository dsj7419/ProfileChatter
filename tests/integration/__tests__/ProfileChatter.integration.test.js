/**
 * ProfileChatter.integration.test.js
 * Integration tests for ProfileChatter.generateChatSVG()
 * Tests the overall flow from configuration to SVG generation with minimal mocking
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateChatSVG } from '../../../src/ProfileChatter.js'

// Mock all the data source functions (external API calls)
vi.mock('../../../src/services/data_sources/weatherDataSource.js', () => ({
  getWeatherData: vi.fn(),
}))

vi.mock('../../../src/services/data_sources/githubDataSource.js', () => ({
  getGitHubData: vi.fn(),
}))

vi.mock('../../../src/services/data_sources/spotifyDataSource.js', () => ({
  getSpotifyData: vi.fn(),
}))

vi.mock('../../../src/services/data_sources/wakatimeDataSource.js', () => ({
  getWakaTimeData: vi.fn(),
}))

vi.mock('../../../src/services/data_sources/twitterDataSource.js', () => ({
  getTwitterData: vi.fn(),
}))

vi.mock('../../../src/services/data_sources/codestatsDataSource.js', () => ({
  getCodeStatsData: vi.fn(),
}))

vi.mock('../../../src/services/data_sources/githubOAuthDataSource.js', () => ({
  getGitHubOAuthData: vi.fn(),
}))

// Mock the config validator
vi.mock('../../../src/utils/ConfigValidator.js', () => ({
  validateConfiguration: vi.fn(),
}))

// Mock DateTimeFormatService to return consistent values for testing
vi.mock('../../../src/services/DateTimeFormatService.js', () => ({
  default: {
    formatCurrentDateTime: vi.fn(() => ({
      currentDayOfWeek: 'Friday',
      currentDate: 'May 23, 2025',
      dayName: 'Friday',
      dayNameShort: 'Fri',
      monthName: 'May',
      monthNameShort: 'May',
      day: '23',
      year: '2025',
      time: '10:30 AM',
      time24: '10:30',
      dateTime: 'May 23, 2025 at 10:30 AM',
      timezone: 'UTC',
      timezoneAbbr: 'UTC',
    })),
    formatWorkTenure: vi.fn(() => '18 years, 1 month and 7 days'),
  },
}))

// Mock the config with a minimal but complete configuration
vi.mock('../../../src/config/config.js', () => ({
  config: {
    activeTheme: 'ios',

    avatars: {
      enabled: true,
      me: { imageUrl: '', fallbackText: 'DJ' },
      visitor: { imageUrl: '', fallbackText: '?' },
      sizePx: 32,
      shape: 'circle',
      xOffsetPx: 8,
      yOffsetPx: 0,
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
        FONT_FAMILY:
          "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",

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
          LABEL_FONT_FAMILY:
            "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          LABEL_FONT_SIZE_PX: 13,
          VALUE_TEXT_FONT_FAMILY:
            "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          VALUE_TEXT_FONT_SIZE_PX: 12,
          TITLE_FONT_FAMILY:
            "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          TITLE_FONT_SIZE_PX: 15,
          TITLE_LINE_HEIGHT_MULTIPLIER: 1.3,
          TITLE_BOTTOM_MARGIN_PX: 10,
          CHART_PADDING_X_PX: 16,
          CHART_PADDING_Y_PX: 14,
          AXIS_LINE_COLOR: '#D3D3D8',
          GRID_LINE_COLOR: '#F5F5F5',
          DONUT_STROKE_WIDTH_PX: 30,
          DONUT_CENTER_TEXT_FONT_SIZE_PX: 16,
          DONUT_CENTER_TEXT_FONT_FAMILY:
            "'SF Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          ME_DONUT_CENTER_TEXT_COLOR: '#FFFFFF',
          VISITOR_DONUT_CENTER_TEXT_COLOR: '#000000',
          ME_DONUT_LEGEND_TEXT_COLOR: '#FFFFFF',
          VISITOR_DONUT_LEGEND_TEXT_COLOR: '#000000',
          DONUT_LEGEND_FONT_SIZE_PX: 12,
          DONUT_LEGEND_ITEM_SPACING_PX: 8,
          DONUT_LEGEND_MARKER_SIZE_PX: 10,
          DONUT_ANIMATION_DURATION_SEC: 1.0,
          DONUT_SEGMENT_ANIMATION_DELAY_SEC: 0.2,

          ME_TITLE_COLOR: '#FFFFFF',
          ME_LABEL_COLOR: '#E2F0FF',
          ME_VALUE_TEXT_COLOR: '#FFFFFF',

          VISITOR_TITLE_COLOR: '#000000',
          VISITOR_LABEL_COLOR: '#444444',
          VISITOR_VALUE_TEXT_COLOR: '#000000',
        },
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

          ME_TITLE_COLOR: '#0D47A1',
          ME_LABEL_COLOR: '#1976D2',
          ME_VALUE_TEXT_COLOR: '#0D47A1',

          VISITOR_TITLE_COLOR: '#212121',
          VISITOR_LABEL_COLOR: '#616161',
          VISITOR_VALUE_TEXT_COLOR: '#212121',
        },
      },
    },

    profile: {
      NAME: 'Test User',
      PROFESSION: 'Software Developer',
      LOCATION: 'Test City',
      COMPANY: 'Test Company',
      CURRENT_PROJECT: 'Test Project',
      WORK_START_DATE: new Date(2007, 3, 16), // April 16, 2007
      GITHUB_USERNAME: 'testuser',
      WAKATIME_USERNAME: 'testuser',
      TWITTER_USERNAME: 'testuser',
      CODESTATS_USERNAME: 'testuser',
      TIMEZONE: 'UTC',
    },

    cache: {
      WEATHER_CACHE_TTL_MS: 1800000,
      GITHUB_CACHE_TTL_MS: 3600000,
      GITHUB_OAUTH_CACHE_TTL_MS: 3600000,
      TWITTER_CACHE_TTL_MS: 3600000,
      CODESTATS_CACHE_TTL_MS: 7200000,
      SPOTIFY_CACHE_TTL_MS: 900000,
    },

    apiDefaults: {
      TEMPERATURE: '72°F (22°C)',
      WEATHER_DESCRIPTION: 'partly cloudy',
      WEATHER_EMOJI: '⛅',
      GITHUB_PUBLIC_REPOS: '12',
      GITHUB_FOLLOWERS: '48',
      GITHUB_TOTAL_STARS: '0',
      GITHUB_COMMITS_LAST_YEAR: '0',
      GITHUB_CONTRIBUTED_REPOS: '0',
      GITHUB_PRIMARY_LANGUAGE: 'None',
      TWITTER_FOLLOWERS: '120',
      CODESTATS_XP: '0',
      SPOTIFY_NOW_PLAYING: 'Not currently listening to music.',
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
        DELIVERED_TEXT: 'Delivered',
        READ_TEXT: 'Read',
        FONT_SIZE_PX: 10,
        COLOR_ME: '#FFFFFFB3',
        OFFSET_Y_PX: 10,
        ANIMATION_DELAY_SEC: 0.2,
        FADE_IN_DURATION_SEC: 0.3,
        READ_DELAY_SEC: 1.5,
        READ_TRANSITION_SEC: 0.2,
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
        ANIMATION_END_BUFFER_MS: 2000,
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
        SCROLL_PIXELS_PER_SEC: 18,
        SCROLL_SPEED_MULTIPLIER: 1.0,
      },
    },

    wakatime: {
      enabled: true,
      defaults: {
        wakatime_summary: 'No coding activity data available',
        wakatime_top_language: 'N/A',
        wakatime_top_language_percent: '0',
        wakatime_chart_data: [],
      },
      cacheTtlMs: 7200000,
    },
  },
}))

// Import mocked modules to access their mock functions
import { getWeatherData } from '../../../src/services/data_sources/weatherDataSource.js'
import { getGitHubData } from '../../../src/services/data_sources/githubDataSource.js'
import { getSpotifyData } from '../../../src/services/data_sources/spotifyDataSource.js'
import { getWakaTimeData } from '../../../src/services/data_sources/wakatimeDataSource.js'
import { getTwitterData } from '../../../src/services/data_sources/twitterDataSource.js'
import { getCodeStatsData } from '../../../src/services/data_sources/codestatsDataSource.js'
import { getGitHubOAuthData } from '../../../src/services/data_sources/githubOAuthDataSource.js'
import { validateConfiguration } from '../../../src/utils/ConfigValidator.js'

// Mock console methods to check for expected logging
let consoleMocks

describe('ProfileChatter Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Set up console mocks
    consoleMocks = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    }
  })

  afterEach(() => {
    // Restore console methods
    consoleMocks.error.mockRestore()
    consoleMocks.warn.mockRestore()
    consoleMocks.log.mockRestore()
    consoleMocks.info.mockRestore()

    vi.restoreAllMocks()
  })

  describe('generateChatSVG()', () => {
    it('Scenario 1: Successful End-to-End Flow with Basic customContext', async () => {
      // Arrange
      validateConfiguration.mockReturnValue(true)

      // Mock all data source functions to return their default values
      getWeatherData.mockResolvedValue({
        temperature: '72°F (22°C)',
        weatherDescription: 'partly cloudy',
        emoji: '⛅',
      })

      getGitHubData.mockResolvedValue({
        status: 'ok',
        value: { githubPublicRepos: '12', githubFollowers: '48' },
      })

      getSpotifyData.mockResolvedValue({
        spotifyTrack: 'Not currently listening to music.',
      })

      getWakaTimeData.mockResolvedValue({
        wakatime_summary: 'No coding activity data available',
        wakatime_top_language: 'N/A',
        wakatime_top_language_percent: '0',
      })

      getTwitterData.mockResolvedValue({
        twitterFollowers: '120',
      })

      getCodeStatsData.mockResolvedValue({
        codestatsXP: '0',
      })

      getGitHubOAuthData.mockResolvedValue({
        status: 'ok',
        value: {
          githubTotalStars: '0',
          githubCommitsLastYear: '0',
          githubContributedRepos: '0',
          githubPrimaryLanguage: 'None',
        },
      })

      const customContext = {
        profile: { NAME: 'John Doe' },
        activeTheme: 'ios',
        chatMessages: [
          { id: '1', sender: 'me', text: 'Hello {name}!' },
          { id: '2', sender: 'visitor', text: 'Hi there! How are you?' },
        ],
      }

      // Act
      const result = await generateChatSVG(customContext)

      // Assert
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
      expect(result.startsWith('<svg')).toBe(true)
      expect(result.endsWith('</svg>')).toBe(true)
      expect(result).toContain('John Doe') // Profile name should be in the SVG
      expect(result).toContain('Hello John Doe!') // Chat message with placeholder replacement
      expect(result).toContain('#0B93F6') // iOS theme color should be present
      expect(consoleMocks.error).not.toHaveBeenCalledWith(
        expect.stringMatching(/Error generating SVG/)
      )
    })

    it('Scenario 2: Flow with Specific Mocked API Data & All Placeholders Used', async () => {
      // Arrange
      validateConfiguration.mockReturnValue(true)

      // Mock each data source function to return specific, non-default data
      getWeatherData.mockResolvedValue({
        temperature: '75F Test',
        weatherDescription: 'testing clouds',
        emoji: '🧪',
      })

      getGitHubData.mockResolvedValue({
        status: 'ok',
        value: { githubPublicRepos: '25', githubFollowers: '150' },
      })

      getSpotifyData.mockResolvedValue({
        spotifyTrack: 'Test Song by Test Artist',
      })

      getWakaTimeData.mockResolvedValue({
        wakatime_summary: 'Coded for 40 hrs in the last week',
        wakatime_top_language: 'JavaScript',
        wakatime_top_language_percent: '65',
      })

      getTwitterData.mockResolvedValue({
        twitterFollowers: '500',
      })

      getCodeStatsData.mockResolvedValue({
        codestatsXP: '15000',
      })

      getGitHubOAuthData.mockResolvedValue({
        status: 'ok',
        value: {
          githubTotalStars: '100',
          githubCommitsLastYear: '250',
          githubContributedRepos: '15',
          githubPrimaryLanguage: 'TypeScript',
        },
      })

      const customContext = {
        profile: { NAME: 'Jane Developer' },
        activeTheme: 'android',
        chatMessages: [
          {
            id: '1',
            sender: 'me',
            text: 'Weather is {temperature} with {weatherDescription} {emoji}',
          },
          {
            id: '2',
            sender: 'visitor',
            text: 'I have {githubPublicRepos} repos and {githubFollowers} followers',
          },
          { id: '3', sender: 'me', text: 'Currently listening to: {spotifyTrack}' },
          {
            id: '4',
            sender: 'visitor',
            text: 'My top language is {wakatime_top_language} at {wakatime_top_language_percent}%',
          },
          {
            id: '5',
            sender: 'me',
            text: 'Follow me on Twitter! I have {twitterFollowers} followers',
          },
          { id: '6', sender: 'visitor', text: 'Code::Stats XP: {codestatsXP}' },
          {
            id: '7',
            sender: 'me',
            text: 'GitHub stats: {githubTotalStars} stars, {githubCommitsLastYear} commits',
          },
        ],
      }

      // Act
      const result = await generateChatSVG(customContext)

      // Assert
      expect(result).toBeDefined()
      expect(result).toContain('75F Test') // Specific weather temperature
      expect(result).toContain('testing clouds') // Specific weather description
      expect(result).toContain('🧪') // Specific weather emoji
      expect(result).toContain('25') // Specific GitHub repos
      expect(result).toContain('150') // Specific GitHub followers
      // Check for Spotify track (may be wrapped across lines)
      expect(result).toContain('Test Song by Test') // Specific Spotify track (partial match due to wrapping)
      expect(result).toContain('Artist') // Second part of Spotify track
      expect(result).toContain('JavaScript') // Specific WakaTime language
      expect(result).toContain('65%') // Specific WakaTime percentage
      expect(result).toContain('500') // Specific Twitter followers
      expect(result).toContain('15000') // Specific Code::Stats XP
      expect(result).toContain('100') // Specific GitHub stars
      expect(result).toContain('250') // Specific GitHub commits
      expect(result).toContain('#D1E6FF') // Android theme color should be present
    })

    it('Scenario 3: One Data Source Fails, All Fall Back to Defaults', async () => {
      // Arrange
      validateConfiguration.mockReturnValue(true)

      // Mock getWeatherData to reject with an error
      getWeatherData.mockRejectedValue(new Error('Weather API failed'))

      // Mock other data sources to succeed with sample data
      getGitHubData.mockResolvedValue({
        status: 'ok',
        value: { githubPublicRepos: '20', githubFollowers: '100' },
      })

      getSpotifyData.mockResolvedValue({
        spotifyTrack: 'Working Song by Developer',
      })

      getWakaTimeData.mockResolvedValue({
        wakatime_summary: 'Coded for 30 hrs in the last week',
        wakatime_top_language: 'Python',
        wakatime_top_language_percent: '50',
      })

      getTwitterData.mockResolvedValue({
        twitterFollowers: '200',
      })

      getCodeStatsData.mockResolvedValue({
        codestatsXP: '8000',
      })

      getGitHubOAuthData.mockResolvedValue({
        status: 'ok',
        value: {
          githubTotalStars: '50',
          githubCommitsLastYear: '150',
          githubContributedRepos: '10',
          githubPrimaryLanguage: 'JavaScript',
        },
      })

      const customContext = {
        profile: { NAME: 'Test User' },
        activeTheme: 'ios',
        chatMessages: [
          { id: '1', sender: 'me', text: 'Weather: {temperature} {weatherDescription}' },
          { id: '2', sender: 'visitor', text: 'GitHub: {githubPublicRepos} repos' },
          { id: '3', sender: 'me', text: 'Music: {spotifyTrack}' },
        ],
      }

      // Act
      const result = await generateChatSVG(customContext)

      // Assert
      expect(result).toBeDefined()
      expect(result.startsWith('<svg')).toBe(true)
      expect(result.endsWith('</svg>')).toBe(true)

      // When one API fails, DataService.getDynamicData() catches the error and uses defaults for all
      expect(result).toContain('72°F (22°C)') // Default temperature
      expect(result).toContain('partly cloudy') // Default weather description
      expect(result).toContain('12') // Default GitHub repos (not the mocked 20)
      expect(result).toContain('listening to music') // Default Spotify text (partial match due to line wrapping)

      // Should have logged an error about fetching APIs, but SVG generation should still succeed
      expect(consoleMocks.error).toHaveBeenCalledWith('Error fetching APIs:', 'Weather API failed')
    })

    it('Scenario 4: validateConfiguration returns false', async () => {
      // Arrange
      validateConfiguration.mockReturnValue(false)

      // Mock data sources (they shouldn't be called due to early validation failure)
      getWeatherData.mockResolvedValue({})
      getGitHubData.mockResolvedValue({ status: 'ok', value: {} })
      getSpotifyData.mockResolvedValue({})
      getWakaTimeData.mockResolvedValue({})
      getTwitterData.mockResolvedValue({})
      getCodeStatsData.mockResolvedValue({})
      getGitHubOAuthData.mockResolvedValue({ status: 'ok', value: {} })

      const customContext = {
        profile: { NAME: 'Test User' },
        activeTheme: 'ios',
        chatMessages: [{ id: '1', sender: 'me', text: 'This should not be rendered' }],
      }

      // Act
      const result = await generateChatSVG(customContext)

      // Assert
      expect(result).toBeDefined()
      expect(result).toContain('Configuration Error!')
      expect(result).toContain('Please check console logs')
      expect(result).toContain('for details.')
      expect(result.startsWith('<svg')).toBe(true)
      expect(result.endsWith('</svg>')).toBe(true)

      // Should have logged configuration error
      expect(consoleMocks.error).toHaveBeenCalledWith(
        expect.stringContaining('Critical configuration errors found')
      )

      // Data source functions should not have been called
      expect(getWeatherData).not.toHaveBeenCalled()
      expect(getGitHubData).not.toHaveBeenCalled()
      expect(getSpotifyData).not.toHaveBeenCalled()
      expect(getWakaTimeData).not.toHaveBeenCalled()
      expect(getTwitterData).not.toHaveBeenCalled()
      expect(getCodeStatsData).not.toHaveBeenCalled()
      expect(getGitHubOAuthData).not.toHaveBeenCalled()
    })
  })
})
