/**
 * twitterDataSource.js
 * Responsible for fetching and caching Twitter/X follower count
 * Single Responsibility: Twitter data acquisition
 */
import { config } from '../../config/config.js'

// Module‑level cache
let twitterCache = { data: null, expiresAt: 0 }

/**
 * Fetch Twitter follower count with robust error‑handling & caching
 * @returns {Promise<{twitterFollowers:string}>}
 */
export async function getTwitterData () {
  try {
    const username = config.profile.TWITTER_USERNAME
    if (!username) {
      console.info('Twitter username not configured – skipping Twitter call.')
      return {}
    }

    // serve from cache when fresh
    if (twitterCache.data && Date.now() < twitterCache.expiresAt) {
      console.info('Using cached Twitter data.')
      return twitterCache.data
    }

    const token = process.env.TWITTER_BEARER_TOKEN
    if (!token) throw new Error('TWITTER_BEARER_TOKEN not set in environment.')

    const endpoint = `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=public_metrics`
    const fetchImpl = typeof fetch === 'function' ? fetch : (await import('node-fetch')).default

    const res = await fetchImpl(endpoint, {
      headers: { Authorization: `Bearer ${token}` }
    })

    if (!res.ok) {
      switch (res.status) {
        case 401: throw new Error('Unauthorized – invalid bearer token.')
        case 403: throw new Error('Forbidden – check app permissions.')
        case 404: throw new Error(`User "${username}" not found.`)
        case 429: throw new Error('Rate‑limit exceeded.')
        default:  throw new Error(`Twitter API ${res.status}: ${res.statusText}`)
      }
    }

    const json = await res.json()
    const count = json?.data?.public_metrics?.followers_count
    if (typeof count !== 'number') throw new Error('Twitter API returned invalid follower count.')

    const result = { twitterFollowers: count.toString() }

    // cache & return
    twitterCache = {
      data: result,
      expiresAt: Date.now() + config.cache.TWITTER_CACHE_TTL_MS
    }
    console.info('Twitter data fetched & cached.')
    return result
  } catch (err) {
    console.error('Error fetching Twitter data:', err.message)
    console.info('Using default follower count.')
    return { twitterFollowers: config.apiDefaults.TWITTER_FOLLOWERS }
  }
}