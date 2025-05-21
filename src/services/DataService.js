/**
 * DataService.js
 * Responsible for orchestrating data acquisition from various data sources
 * Single Responsibility: Data orchestration and formatting
 */
import { config } from '../config/config.js'
import { getGitHubData }   from './data_sources/githubDataSource.js'
import { getWeatherData }  from './data_sources/weatherDataSource.js'
import { getWakaTimeData } from './data_sources/wakatimeDataSource.js'
import { getTwitterData }  from './data_sources/twitterDataSource.js'
import { getCodeStatsData } from './data_sources/codestatsDataSource.js'
import { getSpotifyData } from './data_sources/spotifyDataSource.js'
import { getGitHubOAuthData } from './data_sources/githubOAuthDataSource.js'
import DateTimeFormatService from './DateTimeFormatService.js'

/* ---------- service ------------------------------------------------------ */
class DataService {
  async getDynamicData (customData = {}) {
    // initialise base object so we have something even on catastrophic failure
    let baseData = {
      currentDayOfWeek: 'N/A',
      currentDate:      'N/A',
      dayName:          'N/A',
      dayNameShort:     'N/A',
      monthName:        'N/A',
      monthNameShort:   'N/A',
      day:              'N/A',
      year:             'N/A',
      time:             'N/A',
      time24:           'N/A',
      dateTime:         'N/A',
      timezone:         'N/A',
      timezoneAbbr:     'N/A',
      workTenure:       'N/A',
      // API defaults
      temperature:        config.apiDefaults.TEMPERATURE,
      weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
      emoji:              config.apiDefaults.WEATHER_EMOJI,
      githubPublicRepos:  config.apiDefaults.GITHUB_PUBLIC_REPOS,
      githubFollowers:    config.apiDefaults.GITHUB_FOLLOWERS,
      twitterFollowers:   config.apiDefaults.TWITTER_FOLLOWERS,
      codestatsXP:        config.apiDefaults.CODESTATS_XP,
      spotifyTrack:       config.apiDefaults.SPOTIFY_NOW_PLAYING,
      // Add new GitHub OAuth defaults
      githubTotalStars:     config.apiDefaults.GITHUB_TOTAL_STARS,
      githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
      githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
      githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE,
      // static profile
      name:           config.profile.NAME,
      profession:     config.profile.PROFESSION,
      location:       config.profile.LOCATION,
      company:        config.profile.COMPANY,
      currentProject: config.profile.CURRENT_PROJECT,
      // WakaTime fallback
      wakatime_summary:              config.wakatime.defaults.wakatime_summary,
      wakatime_top_language:         config.wakatime.defaults.wakatime_top_language,
      wakatime_top_language_percent: config.wakatime.defaults.wakatime_top_language_percent
    }

    try {
      // Get timezone from configuration
      const effectiveTimeZone = customData.profile?.TIMEZONE || config.profile.TIMEZONE || 'UTC';
      
      // Use the DateTimeFormatService to get all date/time formatted values
      try {
        const dateTimeData = DateTimeFormatService.formatCurrentDateTime(effectiveTimeZone);
        
        // Merge all date/time data into baseData
        Object.assign(baseData, dateTimeData);
        
        console.log(`DataService: Using timezone "${effectiveTimeZone}" for date formatting.`);
      } catch (e) {
        console.warn(`DataService: Error formatting date/time: ${e.message}`);
        
        // If there's an error, try with UTC
        const utcDateTimeData = DateTimeFormatService.formatCurrentDateTime('UTC');
        Object.assign(baseData, utcDateTimeData);
      }
      
      // First use the default work start date from config
      let workStartDate = config.profile.WORK_START_DATE;
      
      /* remote */
      try {
        const [weather, github, wakatime, twitter, codestats, spotify, githubOAuth] = await Promise.all([
          getWeatherData(),
          getGitHubData(),
          getWakaTimeData(),
          getTwitterData(),
          getCodeStatsData(),
          getSpotifyData(),
          getGitHubOAuthData()
        ]);
        Object.assign(baseData, weather, github, wakatime, twitter, codestats, spotify, githubOAuth);
      } catch (apiErr) {
        console.error('Error fetching APIs:', apiErr.message);
        console.info('Using defaults already in baseData.');
      }

      // Map nested profile overrides to the expected lowercase keys
      if (customData.profile) {
        const p = customData.profile
        if (typeof p.NAME === 'string') baseData.name = p.NAME
        if (typeof p.PROFESSION === 'string') baseData.profession = p.PROFESSION
        if (typeof p.LOCATION === 'string') baseData.location = p.LOCATION
        if (typeof p.COMPANY === 'string') baseData.company = p.COMPANY
        if (typeof p.CURRENT_PROJECT === 'string') baseData.currentProject = p.CURRENT_PROJECT
        
        // Check if we have a custom work start date to use
        if (p.WORK_START_DATE) {
          // If it's an object with year, month, day properties (from UI)
          if (typeof p.WORK_START_DATE === 'object' && 
              p.WORK_START_DATE.year !== undefined &&
              p.WORK_START_DATE.month !== undefined &&
              p.WORK_START_DATE.day !== undefined) {
            
            const year = parseInt(p.WORK_START_DATE.year, 10);
            const month = parseInt(p.WORK_START_DATE.month, 10); // UI month is 1-indexed
            const day = parseInt(p.WORK_START_DATE.day, 10);
            
            if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
              // Create a new Date object (JS months are 0-indexed)
              workStartDate = new Date(year, month - 1, day);
              console.log(`Using custom work start date: ${workStartDate.toDateString()}`);
            }
          }
          // If it's already a Date object
          else if (p.WORK_START_DATE instanceof Date) {
            workStartDate = p.WORK_START_DATE;
            console.log(`Using Date object from profile.WORK_START_DATE: ${workStartDate.toDateString()}`);
          }
        }
      }
      
      // Also check if customData.workStartDate exists (how previewServer.js passes it)
      if (customData.workStartDate instanceof Date) {
        workStartDate = customData.workStartDate;
        console.log(`Using Date object from customData.workStartDate: ${workStartDate.toDateString()}`);
      }
      
      // Calculate workTenure using the DateTimeFormatService
      baseData.workTenure = DateTimeFormatService.formatWorkTenure(workStartDate);
      
      return { ...baseData, ...customData }
    } catch (err) {
      console.error('Critical error in getDynamicData:', err.message)
      console.warn('Returning minimal dataset.')
      return { ...baseData, ...customData }
    }
  }
}

export default new DataService()