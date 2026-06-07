/**
 * codestatsDataSource.js
 * Single Responsibility: Code::Stats total XP acquisition
 *
 * Returns a discriminated source result (see sourceResult.js): `ok` with live
 * value (or `ok({})` when not configured — an intentional skip), or `fallback`
 * carrying the default AND the error.
 */
import { config } from '../../config/config.js'
import { fetchJson } from '../utils/httpClient.js'
import { ok, fallback } from '../utils/sourceResult.js'

let codestatsCache = { result: null, expiresAt: 0 }

async function getCodeStatsData(deps = {}) {
  const username = config.profile.CODESTATS_USERNAME
  if (!username) return ok({}) // not configured — skip

  if (codestatsCache.result && Date.now() < codestatsCache.expiresAt) {
    return codestatsCache.result
  }

  try {
    const data = await fetchJson(
      `https://codestats.net/api/users/${encodeURIComponent(username)}`,
      { ...deps }
    )
    if (!data || typeof data.total_xp !== 'number') {
      throw new Error('Code::Stats API returned invalid or missing total_xp data.')
    }
    const result = ok({ codestatsXP: data.total_xp.toString() })
    codestatsCache = { result, expiresAt: Date.now() + config.cache.CODESTATS_CACHE_TTL_MS }
    return result
  } catch (error) {
    console.warn(`Code::Stats data unavailable, using default: ${error.message}`)
    return fallback({ codestatsXP: config.apiDefaults.CODESTATS_XP }, error)
  }
}

export { getCodeStatsData }
