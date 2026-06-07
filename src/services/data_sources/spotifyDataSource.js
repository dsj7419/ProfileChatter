/**
 * spotifyDataSource.js
 * Single Responsibility: Spotify track acquisition (currently / recently played)
 *
 * Returns a discriminated source result (see sourceResult.js). "Nothing playing"
 * (204 / no item) is a SUCCESS (`ok` with the default track string) — the user
 * simply isn't listening. Auth, rate-limit, server, and network failures return
 * `fallback` carrying the default AND the error, so they are distinguishable.
 *
 * Spotify keeps a bespoke fetch (rather than fetchJson) because 204 is a valid,
 * body-less success it must interpret — not an error.
 */
import { config } from '../../config/config.js'
import spotifyOAuthService from '../auth/spotifyOAuthService.js'
import { ok, fallback } from '../utils/sourceResult.js'

let spotifyCache = { result: null, expiresAt: 0 }

const nothingPlaying = () => ({ spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING })

async function getSpotifyData(deps = {}) {
  if (spotifyCache.result && Date.now() < spotifyCache.expiresAt) {
    return spotifyCache.result
  }

  let token
  try {
    token = await spotifyOAuthService.getAccessToken()
  } catch (authError) {
    console.warn(`Spotify auth unavailable, using default: ${authError.message}`)
    return fallback(nothingPlaying(), authError)
  }

  try {
    const value = await fetchSpotifyTrack(token, deps)
    const result = ok(value)
    spotifyCache = { result, expiresAt: Date.now() + config.cache.SPOTIFY_CACHE_TTL_MS }
    return result
  } catch (error) {
    console.warn(`Spotify data unavailable, using default: ${error.message}`)
    return fallback(nothingPlaying(), error)
  }
}

function classifyHardError(status) {
  if (status === 401 || status === 403 || status === 429 || status >= 500) {
    const err = new Error(`Spotify API error (${status})`)
    err.status = status // carried into the source result so PR-5b can flag 401/403/429
    throw err
  }
}

/**
 * Resolve the track to display. Returns { spotifyTrack }. Throws on hard errors
 * (auth/rate-limit/server/network) so the caller can classify them as fallback.
 * @param {string} token
 * @param {{ fetchImpl?: typeof fetch }} [deps]
 */
async function fetchSpotifyTrack(token, deps = {}) {
  const fetchImpl = deps.fetchImpl || (typeof fetch === 'function' ? fetch : undefined)
  if (typeof fetchImpl !== 'function') {
    throw new Error('No fetch implementation available')
  }
  const headers = { Authorization: `Bearer ${token}` }

  const current = await fetchImpl('https://api.spotify.com/v1/me/player/currently-playing', {
    headers,
  })
  if (current.status === 200) {
    const data = await current.json()
    if (data && data.item) {
      return { spotifyTrack: `${data.item.name} by ${data.item.artists[0].name}` }
    }
  } else if (current.status !== 204) {
    classifyHardError(current.status)
  }

  const recent = await fetchImpl('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers,
  })
  if (recent.status === 200) {
    const recentData = await recent.json()
    if (recentData && recentData.items && recentData.items.length > 0) {
      const track = recentData.items[0].track
      return { spotifyTrack: `${track.name} by ${track.artists[0].name}` }
    }
  } else {
    classifyHardError(recent.status)
  }

  // Nothing currently or recently playing — a successful "not listening" state.
  return nothingPlaying()
}

export { getSpotifyData }
