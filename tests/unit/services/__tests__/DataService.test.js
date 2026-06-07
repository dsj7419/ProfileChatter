/**
 * Unit tests for DataService.js
 * Tests data orchestration with extensive mocking of dependencies
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock all data source modules BEFORE importing DataService
vi.mock('../../../../src/services/data_sources/weatherDataSource.js', () => ({
  getWeatherData: vi.fn(),
}))

vi.mock('../../../../src/services/data_sources/githubDataSource.js', () => ({
  getGitHubData: vi.fn(),
}))

vi.mock('../../../../src/services/data_sources/wakatimeDataSource.js', () => ({
  getWakaTimeData: vi.fn(),
}))

vi.mock('../../../../src/services/data_sources/twitterDataSource.js', () => ({
  getTwitterData: vi.fn(),
}))

vi.mock('../../../../src/services/data_sources/codestatsDataSource.js', () => ({
  getCodeStatsData: vi.fn(),
}))

vi.mock('../../../../src/services/data_sources/spotifyDataSource.js', () => ({
  getSpotifyData: vi.fn(),
}))

vi.mock('../../../../src/services/data_sources/githubOAuthDataSource.js', () => ({
  getGitHubOAuthData: vi.fn(),
}))

// Mock DateTimeFormatService
vi.mock('../../../../src/services/DateTimeFormatService.js', () => ({
  default: {
    formatCurrentDateTime: vi.fn(),
    formatWorkTenure: vi.fn(),
  },
}))

// Mock config
vi.mock('../../../../src/config/config.js', () => ({
  config: {
    profile: {
      NAME: 'Test User',
      PROFESSION: 'Developer',
      LOCATION: 'Test City',
      COMPANY: 'Test Company',
      CURRENT_PROJECT: 'Test Project',
      TIMEZONE: 'UTC',
      WORK_START_DATE: new Date('2020-01-01T00:00:00.000Z'),
    },
    apiDefaults: {
      TEMPERATURE: '70°F',
      WEATHER_DESCRIPTION: 'sunny',
      WEATHER_EMOJI: '☀️',
      GITHUB_PUBLIC_REPOS: '10',
      GITHUB_FOLLOWERS: '5',
      GITHUB_TOTAL_STARS: '0',
      GITHUB_COMMITS_LAST_YEAR: '0',
      GITHUB_CONTRIBUTED_REPOS: '0',
      GITHUB_PRIMARY_LANGUAGE: 'JavaScript',
      TWITTER_FOLLOWERS: '100',
      CODESTATS_XP: '1000',
      SPOTIFY_NOW_PLAYING: 'Not listening',
    },
    wakatime: {
      defaults: {
        wakatime_summary: 'No data',
        wakatime_top_language: 'None',
        wakatime_top_language_percent: '0',
      },
    },
  },
}))

// Import after mocks are set up
import DataService from '../../../../src/services/DataService.js'
import { getWeatherData } from '../../../../src/services/data_sources/weatherDataSource.js'
import { getGitHubData } from '../../../../src/services/data_sources/githubDataSource.js'
import { getWakaTimeData } from '../../../../src/services/data_sources/wakatimeDataSource.js'
import { getTwitterData } from '../../../../src/services/data_sources/twitterDataSource.js'
import { getCodeStatsData } from '../../../../src/services/data_sources/codestatsDataSource.js'
import { getSpotifyData } from '../../../../src/services/data_sources/spotifyDataSource.js'
import { getGitHubOAuthData } from '../../../../src/services/data_sources/githubOAuthDataSource.js'
import DateTimeFormatServiceInstance from '../../../../src/services/DateTimeFormatService.js'

describe('DataService', () => {
  let consoleErrorSpy
  let consoleInfoSpy
  let consoleWarnSpy

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleWarnSpy.mockRestore()
  })

  describe('getDynamicData', () => {
    const mockDateTimeData = {
      currentDayOfWeek: 'Monday',
      currentDate: 'June 5, 2023',
      dayName: 'Monday',
      dayNameShort: 'Mon',
      monthName: 'June',
      monthNameShort: 'Jun',
      day: '5',
      year: '2023',
      time: '2:30 PM',
      time24: '14:30',
      dateTime: 'June 5, 2023 at 2:30 PM',
      timezone: 'UTC',
      timezoneAbbr: 'UTC',
    }

    beforeEach(() => {
      // Set up default DateTimeFormatService mocks
      DateTimeFormatServiceInstance.formatCurrentDateTime.mockReturnValue(mockDateTimeData)
      DateTimeFormatServiceInstance.formatWorkTenure.mockReturnValue('3 years and 5 months')
    })

    it('should successfully merge data from all API sources', async () => {
      // Mock all data sources to return success data (discriminated results)
      getWeatherData.mockResolvedValue({
        status: 'ok',
        value: { temperature: '75°F (24°C)', weatherDescription: 'partly cloudy', emoji: '⛅' },
      })

      getGitHubData.mockResolvedValue({
        status: 'ok',
        value: { githubPublicRepos: '15', githubFollowers: '25' },
      })

      getWakaTimeData.mockResolvedValue({
        status: 'ok',
        value: {
          wakatime_summary: 'Coded for 8 hrs',
          wakatime_top_language: 'JavaScript',
          wakatime_top_language_percent: '65',
        },
      })

      getTwitterData.mockResolvedValue({ status: 'ok', value: { twitterFollowers: '150' } })

      getCodeStatsData.mockResolvedValue({ status: 'ok', value: { codestatsXP: '2500' } })

      getSpotifyData.mockResolvedValue({
        status: 'ok',
        value: { spotifyTrack: 'Test Song by Test Artist' },
      })

      getGitHubOAuthData.mockResolvedValue({
        status: 'ok',
        value: {
          githubTotalStars: '50',
          githubCommitsLastYear: '300',
          githubContributedRepos: '8',
          githubPrimaryLanguage: 'TypeScript',
        },
      })

      const result = await DataService.getDynamicData()

      // Verify all date/time data is included
      expect(result.currentDayOfWeek).toBe('Monday')
      expect(result.dayName).toBe('Monday')
      expect(result.time).toBe('2:30 PM')
      expect(result.timezone).toBe('UTC')

      // Verify API data is merged
      expect(result.temperature).toBe('75°F (24°C)')
      expect(result.githubPublicRepos).toBe('15')
      expect(result.wakatime_summary).toBe('Coded for 8 hrs')
      expect(result.twitterFollowers).toBe('100')
      expect(result.codestatsXP).toBe('2500')
      expect(result.spotifyTrack).toBe('Test Song by Test Artist')
      expect(result.githubTotalStars).toBe('50')

      // Verify profile data from config
      expect(result.name).toBe('Test User')
      expect(result.profession).toBe('Developer')
      expect(result.workTenure).toBe('3 years and 5 months')

      // Verify DateTimeFormatService was called correctly
      expect(DateTimeFormatServiceInstance.formatCurrentDateTime).toHaveBeenCalledWith('UTC')
      expect(DateTimeFormatServiceInstance.formatWorkTenure).toHaveBeenCalled()
    })

    it('records per-source status so a fallback is distinguishable from live data', async () => {
      getWeatherData.mockResolvedValue({})
      getWakaTimeData.mockResolvedValue({})
      getTwitterData.mockResolvedValue({})
      getCodeStatsData.mockResolvedValue({})
      getSpotifyData.mockResolvedValue({})
      // github fell back to defaults; githubOAuth is live
      getGitHubData.mockResolvedValue({
        status: 'fallback',
        value: { githubPublicRepos: '10', githubFollowers: '5' },
        error: { message: 'rate limited', status: 403 },
        fetchedAt: 123,
      })
      getGitHubOAuthData.mockResolvedValue({
        status: 'ok',
        value: { githubTotalStars: '7' },
        fetchedAt: 456,
      })

      await DataService.getDynamicData()

      const bySource = Object.fromEntries(DataService.lastSourceStatuses.map((s) => [s.source, s]))
      expect(bySource.github.status).toBe('fallback')
      expect(bySource.github.error.status).toBe(403)
      expect(bySource.githubOAuth.status).toBe('ok')
    })

    it('records a classification per source (live / skip / fallback) for the status manifest', async () => {
      // An intentional ok({}) skip must be distinguishable from live ok(data) and
      // from a configured fallback — the manifest is built off this classification.
      getWeatherData.mockResolvedValue({ status: 'ok', value: {}, fetchedAt: 1 }) // skip
      getGitHubData.mockResolvedValue({
        status: 'ok',
        value: { githubFollowers: '5' },
        fetchedAt: 1,
      }) // live
      getWakaTimeData.mockResolvedValue({
        status: 'ok',
        value: { wakatime_summary: 'x' },
        fetchedAt: 1,
      })
      getTwitterData.mockResolvedValue({ status: 'ok', value: {}, fetchedAt: 1 }) // skip
      getCodeStatsData.mockResolvedValue({
        status: 'ok',
        value: { codestatsXP: '9' },
        fetchedAt: 1,
      })
      getSpotifyData.mockResolvedValue({ status: 'ok', value: { spotifyTrack: 'x' }, fetchedAt: 1 })
      getGitHubOAuthData.mockResolvedValue({
        status: 'fallback',
        value: { githubTotalStars: '0' },
        error: { message: 'Unauthorized', status: 401 },
        fetchedAt: 1,
      })

      await DataService.getDynamicData()

      const bySource = Object.fromEntries(DataService.lastSourceStatuses.map((s) => [s.source, s]))
      expect(bySource.weather.classification).toBe('skip')
      expect(bySource.github.classification).toBe('live')
      expect(bySource.wakatime.classification).toBe('live')
      expect(bySource.twitter.classification).toBe('skip')
      expect(bySource.githubOAuth.classification).toBe('fallback')
    })

    it('resets source statuses each run (no stale leak when a later run fails early)', async () => {
      // Run 1: populate statuses with a github fallback.
      getWeatherData.mockResolvedValue({})
      getWakaTimeData.mockResolvedValue({})
      getTwitterData.mockResolvedValue({})
      getCodeStatsData.mockResolvedValue({})
      getSpotifyData.mockResolvedValue({})
      getGitHubData.mockResolvedValue({ status: 'fallback', value: {}, error: { message: 'x' } })
      getGitHubOAuthData.mockResolvedValue({ status: 'ok', value: {} })
      await DataService.getDynamicData()
      expect(DataService.lastSourceStatuses.some((s) => s.source === 'github')).toBe(true)

      // Run 2: a source throws so the remote phase fails before statuses are populated.
      // The reused singleton must NOT retain run 1's statuses.
      getWeatherData.mockRejectedValueOnce(new Error('boom'))
      await DataService.getDynamicData()
      expect(DataService.lastSourceStatuses).toEqual([])
    })

    it('should handle API failures gracefully', async () => {
      // Mock all APIs to fail to test error handling
      getWeatherData.mockRejectedValue(new Error('Weather API failed'))
      getGitHubData.mockRejectedValue(new Error('GitHub API failed'))
      getWakaTimeData.mockRejectedValue(new Error('WakaTime API failed'))
      getTwitterData.mockRejectedValue(new Error('Twitter API failed'))
      getCodeStatsData.mockRejectedValue(new Error('CodeStats API failed'))
      getSpotifyData.mockRejectedValue(new Error('Spotify API failed'))
      getGitHubOAuthData.mockRejectedValue(new Error('GitHub OAuth API failed'))

      const result = await DataService.getDynamicData()

      // Should use defaults for failed APIs
      expect(result.temperature).toBe('70°F')
      expect(result.githubPublicRepos).toBe('10')
      expect(result.wakatime_summary).toBe('No data') // From config defaults

      // Should log errors
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching APIs:', expect.any(String))
    })

    it('should handle custom profile data overrides', async () => {
      // Mock all APIs to return empty data
      getWeatherData.mockResolvedValue({})
      getGitHubData.mockResolvedValue({ status: 'ok', value: {} })
      getWakaTimeData.mockResolvedValue({})
      getTwitterData.mockResolvedValue({})
      getCodeStatsData.mockResolvedValue({})
      getSpotifyData.mockResolvedValue({})
      getGitHubOAuthData.mockResolvedValue({ status: 'ok', value: {} })

      const customData = {
        profile: {
          NAME: 'Custom Name',
          PROFESSION: 'Custom Profession',
          LOCATION: 'Custom City',
          COMPANY: 'Custom Company',
          CURRENT_PROJECT: 'Custom Project',
          TIMEZONE: 'America/New_York',
          WORK_START_DATE: { year: 2021, month: 6, day: 15 },
        },
      }

      const result = await DataService.getDynamicData(customData)

      // Should use custom profile data
      expect(result.name).toBe('Custom Name')
      expect(result.profession).toBe('Custom Profession')
      expect(result.location).toBe('Custom City')
      expect(result.company).toBe('Custom Company')
      expect(result.currentProject).toBe('Custom Project')

      // Should use custom timezone for date formatting
      expect(DateTimeFormatServiceInstance.formatCurrentDateTime).toHaveBeenCalledWith(
        'America/New_York'
      )

      // Should calculate work tenure with custom start date
      expect(DateTimeFormatServiceInstance.formatWorkTenure).toHaveBeenCalledWith(expect.any(Date))
    })

    it('should handle WORK_START_DATE as Date object', async () => {
      // Mock all APIs
      getWeatherData.mockResolvedValue({})
      getGitHubData.mockResolvedValue({ status: 'ok', value: {} })
      getWakaTimeData.mockResolvedValue({})
      getTwitterData.mockResolvedValue({})
      getCodeStatsData.mockResolvedValue({})
      getSpotifyData.mockResolvedValue({})
      getGitHubOAuthData.mockResolvedValue({ status: 'ok', value: {} })

      const customWorkStartDate = new Date('2022-03-10T00:00:00.000Z')
      const customData = {
        profile: {
          WORK_START_DATE: customWorkStartDate,
        },
      }

      await DataService.getDynamicData(customData)

      // Should call formatWorkTenure with the Date object
      expect(DateTimeFormatServiceInstance.formatWorkTenure).toHaveBeenCalledWith(
        customWorkStartDate
      )
    })

    it('should handle customData.workStartDate directly', async () => {
      // Mock all APIs
      getWeatherData.mockResolvedValue({})
      getGitHubData.mockResolvedValue({ status: 'ok', value: {} })
      getWakaTimeData.mockResolvedValue({})
      getTwitterData.mockResolvedValue({})
      getCodeStatsData.mockResolvedValue({})
      getSpotifyData.mockResolvedValue({})
      getGitHubOAuthData.mockResolvedValue({ status: 'ok', value: {} })

      const customWorkStartDate = new Date('2021-08-01T00:00:00.000Z')
      const customData = {
        workStartDate: customWorkStartDate,
      }

      await DataService.getDynamicData(customData)

      // Should call formatWorkTenure with the direct workStartDate
      expect(DateTimeFormatServiceInstance.formatWorkTenure).toHaveBeenCalledWith(
        customWorkStartDate
      )
    })

    it('should fallback to UTC on timezone formatting error', async () => {
      // Mock all APIs
      getWeatherData.mockResolvedValue({})
      getGitHubData.mockResolvedValue({ status: 'ok', value: {} })
      getWakaTimeData.mockResolvedValue({})
      getTwitterData.mockResolvedValue({})
      getCodeStatsData.mockResolvedValue({})
      getSpotifyData.mockResolvedValue({})
      getGitHubOAuthData.mockResolvedValue({ status: 'ok', value: {} })

      // Mock DateTimeFormatService to throw error first, then succeed
      DateTimeFormatServiceInstance.formatCurrentDateTime
        .mockImplementationOnce(() => {
          throw new Error('Invalid timezone')
        })
        .mockReturnValueOnce(mockDateTimeData)

      const customData = {
        profile: { TIMEZONE: 'Invalid/Timezone' },
      }

      const result = await DataService.getDynamicData(customData)

      // Should have called formatCurrentDateTime twice (once with invalid, once with UTC)
      expect(DateTimeFormatServiceInstance.formatCurrentDateTime).toHaveBeenCalledTimes(2)
      expect(DateTimeFormatServiceInstance.formatCurrentDateTime).toHaveBeenCalledWith(
        'Invalid/Timezone'
      )
      expect(DateTimeFormatServiceInstance.formatCurrentDateTime).toHaveBeenCalledWith('UTC')

      expect(result.currentDayOfWeek).toBe('Monday')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error formatting date/time')
      )
    })

    it('should handle critical error and return minimal dataset', async () => {
      // Mock DateTimeFormatService to throw critical error
      DateTimeFormatServiceInstance.formatCurrentDateTime.mockImplementation(() => {
        throw new Error('Critical formatting error')
      })

      const result = await DataService.getDynamicData()

      // Should return baseData with defaults
      expect(result.name).toBe('Test User')
      expect(result.temperature).toBe('70°F')
      expect(result.currentDayOfWeek).toBe('N/A') // Base data fallback

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Critical error in getDynamicData:',
        'Critical formatting error'
      )
      expect(consoleWarnSpy).toHaveBeenCalledWith('Returning minimal dataset.')
    })

    it('should preserve additional customData properties', async () => {
      // Mock all APIs
      getWeatherData.mockResolvedValue({})
      getGitHubData.mockResolvedValue({ status: 'ok', value: {} })
      getWakaTimeData.mockResolvedValue({})
      getTwitterData.mockResolvedValue({})
      getCodeStatsData.mockResolvedValue({})
      getSpotifyData.mockResolvedValue({})
      getGitHubOAuthData.mockResolvedValue({ status: 'ok', value: {} })

      const customData = {
        customProperty: 'custom value',
        anotherProperty: 42,
      }

      const result = await DataService.getDynamicData(customData)

      // Should preserve custom properties
      expect(result.customProperty).toBe('custom value')
      expect(result.anotherProperty).toBe(42)
    })
  })
})
