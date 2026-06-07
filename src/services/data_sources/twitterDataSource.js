/**
 * twitterDataSource.js
 * Single Responsibility: Twitter/X follower count acquisition
 *
 * Returns a discriminated source result (see sourceResult.js). Twitter is
 * normally manual: when API fetch is disabled, the username is unset, or no
 * bearer token is present, this returns `ok({})` — an intentional skip (the
 * manual follower count is used downstream), NOT a failure. A configured fetch
 * that fails returns `fallback` with the default AND the error.
 */
import { config } from '../../config/config.js'
import { fetchJson } from '../utils/httpClient.js'
import { ok, fallback } from '../utils/sourceResult.js'

let twitterCache = { result: null, expiresAt: 0 }

export async function getTwitterData(deps = {}) {
  if (!config.twitter.enabled_api_fetch) return ok({})

  const username = config.profile.TWITTER_USERNAME
  if (!username) return ok({})

  const token = process.env.TWITTER_BEARER_TOKEN
  if (!token) return ok({})

  if (twitterCache.result && Date.now() < twitterCache.expiresAt) {
    return twitterCache.result
  }

  try {
    const endpoint = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(
      username
    )}?user.fields=public_metrics`
    const json = await fetchJson(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      ...deps,
    })
    const count = json?.data?.public_metrics?.followers_count
    if (typeof count !== 'number') {
      throw new Error('Twitter API returned invalid follower count.')
    }
    const result = ok({ twitterFollowers: count.toString() })
    twitterCache = { result, expiresAt: Date.now() + config.cache.TWITTER_CACHE_TTL_MS }
    return result
  } catch (err) {
    console.warn(`Twitter data unavailable, using default follower count: ${err.message}`)
    return fallback({ twitterFollowers: config.apiDefaults.TWITTER_FOLLOWERS }, err)
  }
}
