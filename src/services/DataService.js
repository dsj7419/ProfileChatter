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

/* ---------- local helpers ------------------------------------------------ */
const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
function formatDayOfWeek (d) { return days[d.getDay()] }
function formatDate      (d) { return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}` }
function formatTimePeriod (start) {
  const now = new Date()
  let y = now.getFullYear() - start.getFullYear()
  let m = now.getMonth()    - start.getMonth()
  let d = now.getDate()     - start.getDate()
  if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate() }
  if (m < 0) { y--; m += 12 }
  const parts = []
  if (y) parts.push(`${y} year${y!==1?'s':''}`)
  if (m) parts.push(`${m} month${m!==1?'s':''}`)
  if (d) parts.push(`${d} day${d!==1?'s':''}`)
  return parts.length ? (parts.length===1?parts[0]:parts.slice(0,-1).join(', ')+' and '+parts.slice(-1)) : '0 days'
}

/* ---------- service ------------------------------------------------------ */
class DataService {
  async getDynamicData (customData = {}) {
    // initialise base object so we have something even on catastrophic failure
    let baseData = {
      currentDayOfWeek: 'N/A',
      currentDate:      'N/A',
      workTenure:       'N/A',
      // API defaults
      temperature:        config.apiDefaults.TEMPERATURE,
      weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
      emoji:              config.apiDefaults.WEATHER_EMOJI,
      githubPublicRepos:  config.apiDefaults.GITHUB_PUBLIC_REPOS,
      githubFollowers:    config.apiDefaults.GITHUB_FOLLOWERS,
      twitterFollowers:   config.apiDefaults.TWITTER_FOLLOWERS,
      codestatsXP:        config.apiDefaults.CODESTATS_XP,
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
      /* local */
      const now = new Date()
      baseData.currentDayOfWeek = formatDayOfWeek(now)
      baseData.currentDate      = formatDate(now)
      baseData.workTenure       = formatTimePeriod(config.profile.WORK_START_DATE)

      /* remote */
      try {
        const [weather, github, wakatime, twitter, codestats] = await Promise.all([
          getWeatherData(),
          getGitHubData(),
          getWakaTimeData(),
          getTwitterData(),
          getCodeStatsData()
        ])
        Object.assign(baseData, weather, github, wakatime, twitter, codestats)
      } catch (apiErr) {
        console.error('Error fetching APIs:', apiErr.message)
        console.info('Using defaults already in baseData.')
      }

      return { ...baseData, ...customData }
    } catch (err) {
      console.error('Critical error in getDynamicData:', err.message)
      console.warn('Returning minimal dataset.')
      return { ...baseData, ...customData }
    }
  }
}
export default new DataService()