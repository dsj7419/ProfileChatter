/**
 * wakatimeDataSource.js
 * Single Responsibility: WakaTime coding activity acquisition
 *
 * Returns a discriminated source result (see sourceResult.js): `ok` with live
 * values (or `ok({})` when WakaTime is disabled — an intentional skip), or
 * `fallback` carrying defaults AND the error.
 */
import { config } from '../../config/config.js'
import { getLanguageColor } from '../utils/languageColors.js'
import { fetchJson } from '../utils/httpClient.js'
import { ok, fallback } from '../utils/sourceResult.js'

let wakatimeCache = { result: null, expiresAt: 0 }

async function getWakaTimeData(deps = {}) {
  if (!config.wakatime.enabled) return ok({})
  if (wakatimeCache.result && Date.now() < wakatimeCache.expiresAt) return wakatimeCache.result

  const apiKey = process.env.WAKATIME_API_KEY
  const username = config.profile.WAKATIME_USERNAME
  if (!apiKey || !username) {
    // Enabled but misconfigured → a real failure (distinct from disabled skip).
    return fallback(
      config.wakatime.defaults,
      new Error('WakaTime enabled but API key or username is not configured.')
    )
  }

  try {
    const authHeader = 'Basic ' + Buffer.from(apiKey).toString('base64')
    const data = await fetchJson(
      `https://wakatime.com/api/v1/users/${username}/stats/last_7_days`,
      { headers: { Authorization: authHeader, Accept: 'application/json' }, ...deps }
    )
    if (!data || !data.data) {
      throw new Error('WakaTime API returned empty or invalid data.')
    }
    const stats = data.data
    const result = {
      wakatime_summary: `Coded for ${stats.human_readable_total_including_other_language || '0 hrs'} in the last week`,
      wakatime_top_language: 'None',
      wakatime_top_language_percent: '0',
      wakatime_chart_data: [],
    }
    if (stats.languages && stats.languages.length > 0) {
      const topLang = stats.languages[0]
      result.wakatime_top_language = topLang.name
      result.wakatime_top_language_percent = Math.round(topLang.percent).toString()
      result.wakatime_chart_data = stats.languages.slice(0, 5).map((lang) => ({
        label: lang.name,
        value: Math.round(lang.percent),
        color: getLanguageColor(lang.name),
      }))
    }
    const okResult = ok(result)
    wakatimeCache = { result: okResult, expiresAt: Date.now() + config.wakatime.cacheTtlMs }
    return okResult
  } catch (error) {
    console.warn(`WakaTime data unavailable, using defaults: ${error.message}`)
    return fallback(config.wakatime.defaults, error)
  }
}

export { getWakaTimeData }
