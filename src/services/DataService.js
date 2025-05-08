/**
 * DataService.js
 * Responsible for orchestrating data acquisition from various data sources
 * Single Responsibility: Data orchestration and formatting
 */
import { config } from '../config/config.js';
import { getGitHubData } from './data_sources/githubDataSource.js';
import { getWeatherData } from './data_sources/weatherDataSource.js';
import { getWakaTimeData } from './data_sources/wakatimeDataSource.js';

/* ---------- local helpers ------------------------------------------------ */

/** Format a date to day of week (e.g. "Monday") */
function formatDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/** Format a date to "Month D, YYYY" (e.g. "May 8, 2025") */
function formatDate(date) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Calculate a human‑friendly time‑period from `startDate` until now */
function formatTimePeriod(startDate) {
  const now = new Date();

  /* work out raw differences */
  let years  = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth()    - startDate.getMonth();
  let days   = now.getDate()     - startDate.getDate();

  /* normalise negatives by “borrowing” from larger units */
  if (days < 0) {
    months -= 1;
    const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  /* build readable parts */
  const parts = [];
  if (years  > 0) parts.push(`${years} year${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months !== 1 ? 's' : ''}`);
  if (days   > 0) parts.push(`${days} day${days !== 1 ? 's' : ''}`);

  /* always show at least the biggest unit so “0 days” never happens */
  if (parts.length === 0) return '0 days';

  /* join with Oxford‑comma style */
  return parts.length === 1
    ? parts[0]
    : parts.slice(0, -1).join(', ') + ' and ' + parts.slice(-1);
}

/* ---------- service ------------------------------------------------------ */

class DataService {
  /**
   * Get all dynamic data needed for chat messages
   * @param {Object} customData – optional overrides
   * @returns {Promise<Object>} merged data object
   */
  async getDynamicData(customData = {}) {
    /* ---- declare baseData first so it is visible to outer catch ---- */
    let baseData = {
      /* local calculated placeholders – overwritten in try‑block */
      currentDayOfWeek: 'N/A',
      currentDate:       'N/A',
      workTenure:        'N/A',

      /* API‑derived fields initialised with config defaults          */
      temperature:        config.apiDefaults.TEMPERATURE,
      weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
      emoji:              config.apiDefaults.WEATHER_EMOJI,
      githubPublicRepos:  config.apiDefaults.GITHUB_PUBLIC_REPOS,
      githubFollowers:    config.apiDefaults.GITHUB_FOLLOWERS,

      /* static profile information                                   */
      name:           config.profile.NAME,
      profession:     config.profile.PROFESSION,
      location:       config.profile.LOCATION,
      company:        config.profile.COMPANY,
      currentProject: config.profile.CURRENT_PROJECT,

      /* WakaTime defaults                                            */
      wakatime_summary:              config.wakatime.defaults.wakatime_summary,
      wakatime_top_language:         config.wakatime.defaults.wakatime_top_language,
      wakatime_top_language_percent: config.wakatime.defaults.wakatime_top_language_percent,
    };

    try {
      /* ---------- locally‑calculated values ----------------------- */
      const now = new Date();
      baseData.currentDayOfWeek = formatDayOfWeek(now);
      baseData.currentDate      = formatDate(now);
      baseData.workTenure       = formatTimePeriod(config.profile.WORK_START_DATE);

      /* ---------- remote API calls (non‑critical) ----------------- */
      try {
        const [weather, github, wakatime] = await Promise.all([
          getWeatherData(),
          getGitHubData(),
          getWakaTimeData(),
        ]);
        Object.assign(baseData, weather, github, wakatime);
      } catch (apiErr) {
        console.error('Error fetching API data:', apiErr.message);
        console.info('Using default API values stored in baseData.');
        /* baseData already carries safe defaults – nothing else to do */
      }

      /* ---------- final merge & return ---------------------------- */
      return { ...baseData, ...customData };

    } catch (err) {
      console.error('Critical error in getDynamicData:', err.message);

      /* ensure we still return *something* useful */
      const safeBase = baseData && Object.keys(baseData).length
        ? baseData
        : {
            /* minimal safe structure */
            currentDayOfWeek: 'Unknown',
            currentDate:      formatDate(new Date()),
            workTenure:       'N/A',
            temperature:      config.apiDefaults.TEMPERATURE,
            weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
            emoji:            config.apiDefaults.WEATHER_EMOJI,
            name:             config.profile.NAME,
          };

      console.warn('Returning data with defaults due to error during processing.');
      return { ...safeBase, ...customData };
    }
  }
}

export default new DataService();
