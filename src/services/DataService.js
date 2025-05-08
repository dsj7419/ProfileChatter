/**
 * DataService.js
 * Responsible for orchestrating data acquisition from various data sources
 * Single Responsibility: Data orchestration and formatting
 */
import { config } from '../config/config.js';
import { getGitHubData } from './data_sources/githubDataSource.js';
import { getWeatherData } from './data_sources/weatherDataSource.js';
import { getWakaTimeData } from './data_sources/wakatimeDataSource.js';

/**
 * Format a date to day of week (e.g., "Monday")
 */
function formatDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Format a date to month, day, year (e.g., "May 5, 2025")
 */
function formatDate(date) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

/**
 * Calculate time period from a start date until now
 */
function formatTimePeriod(startDate) {
  const now = new Date();
  const diffYears = now.getFullYear() - startDate.getFullYear();
  const diffMonths = now.getMonth() - startDate.getMonth();
  
  let years = diffYears;
  let months = diffMonths;
  
  if (diffMonths < 0) {
    years--;
    months = 12 + diffMonths;
  }
  
  if (years > 0) {
    return months > 0 ? `${years} years and ${months} months` : `${years} years`;
  } else {
    return `${months} months`;
  }
}

/**
 * DataService class - Provides dynamic data for chat messages
 */
class DataService {
  /**
   * Get all dynamic data needed for chat messages
   * @param {Object} customData - Optional override values
   * @returns {Promise<Object>} - Complete data for message placeholders
   */
  async getDynamicData(customData = {}) {
    try {
      const now = new Date();
      
      // First, get basic date information and profile data synchronously
      const baseData = {
        currentDayOfWeek: formatDayOfWeek(now),
        currentDate: formatDate(now),
        workTenure: formatTimePeriod(config.profile.WORK_START_DATE),
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI,
        githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
        githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS,
        name: config.profile.NAME,
        profession: config.profile.PROFESSION,
        location: config.profile.LOCATION,
        company: config.profile.COMPANY,
        currentProject: config.profile.CURRENT_PROJECT,
        wakatime_summary: config.wakatime.defaults.wakatime_summary,
        wakatime_top_language: config.wakatime.defaults.wakatime_top_language,
        wakatime_top_language_percent: config.wakatime.defaults.wakatime_top_language_percent
      };
      
      // Then, fetch API data in parallel from different data source modules
      try {
        const [weatherResult, githubResult, wakatimeResult] = await Promise.all([
          getWeatherData(),
          getGitHubData(),
          getWakaTimeData()
        ]);
        
        // Merge API data with base data
        Object.assign(baseData, weatherResult, githubResult, wakatimeResult);
      } catch (error) {
        console.error('Error fetching API data:', error.message);
        console.info('Using default data for some values due to API errors.');
      }
      
      // Finally, merge with any custom override data
      return { ...baseData, ...customData };
    } catch (error) {
      console.error('Error in getDynamicData:', error.message);
      
      // Provide fallback data if anything goes wrong
      return {
        currentDayOfWeek: 'Monday',
        currentDate: 'May 5, 2025',
        workTenure: '3 years and 4 months',
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI,
        githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
        githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS,
        name: config.profile.NAME,
        profession: config.profile.PROFESSION,
        location: config.profile.LOCATION,
        company: config.profile.COMPANY,
        currentProject: config.profile.CURRENT_PROJECT,
        wakatime_summary: config.wakatime.defaults.wakatime_summary,
        wakatime_top_language: config.wakatime.defaults.wakatime_top_language,
        wakatime_top_language_percent: config.wakatime.defaults.wakatime_top_language_percent,
        ...customData
      };
    }
  }
}

export default new DataService();