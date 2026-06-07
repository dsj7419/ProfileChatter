// tests/unit/services/data_sources/spotifyDataSource.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import spotifyOAuthService from '../../../../src/services/auth/spotifyOAuthService.js'

vi.mock('../../../../src/config/config.js', () => ({
  config: {
    cache: { SPOTIFY_CACHE_TTL_MS: 900000 },
    apiDefaults: { SPOTIFY_NOW_PLAYING: 'Not listening' },
  },
}))

vi.mock('../../../../src/services/auth/spotifyOAuthService.js', () => ({
  default: { getAccessToken: vi.fn() },
}))

let getSpotifyData
const res = (status, body) => ({ status, json: async () => body })

beforeEach(async () => {
  vi.clearAllMocks()
  vi.resetModules()
  ;({ getSpotifyData } = await import('../../../../src/services/data_sources/spotifyDataSource.js'))
  spotifyOAuthService.getAccessToken.mockResolvedValue('tok')
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('spotifyDataSource — discriminated results', () => {
  it('returns ok with the currently playing track', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(res(200, { item: { name: 'Song', artists: [{ name: 'Artist' }] } }))
    const r = await getSpotifyData({ fetchImpl })
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({ spotifyTrack: 'Song by Artist' })
  })

  it('falls through to recently played when nothing is currently playing (204)', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(res(204, {}))
      .mockResolvedValueOnce(
        res(200, { items: [{ track: { name: 'R', artists: [{ name: 'A' }] } }] })
      )
    const r = await getSpotifyData({ fetchImpl })
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({ spotifyTrack: 'R by A' })
  })

  it('returns ok with the default "not listening" string when nothing is playing at all', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(res(204, {}))
      .mockResolvedValueOnce(res(200, { items: [] }))
    const r = await getSpotifyData({ fetchImpl })
    expect(r.status).toBe('ok') // not listening is a SUCCESS, not a failure
    expect(r.value).toEqual({ spotifyTrack: 'Not listening' })
  })

  it('returns a FALLBACK on an auth failure', async () => {
    spotifyOAuthService.getAccessToken.mockRejectedValueOnce(new Error('no token'))
    const fetchImpl = vi.fn()
    const r = await getSpotifyData({ fetchImpl })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('fallback')
    expect(r.value).toEqual({ spotifyTrack: 'Not listening' })
  })

  it('returns a FALLBACK on a rate-limit (429) carrying the status', async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(res(429, {}))
    const r = await getSpotifyData({ fetchImpl })
    expect(r.status).toBe('fallback')
    expect(r.error.status).toBe(429)
  })

  it('caches an ok result', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(res(200, { item: { name: 'S', artists: [{ name: 'A' }] } }))
    await getSpotifyData({ fetchImpl })
    const callsAfterFirst = fetchImpl.mock.calls.length
    await getSpotifyData({ fetchImpl })
    expect(fetchImpl).toHaveBeenCalledTimes(callsAfterFirst)
  })
})
