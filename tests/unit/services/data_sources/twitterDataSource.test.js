// tests/unit/services/data_sources/twitterDataSource.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../../../src/config/config.js', () => ({
  config: {
    twitter: { enabled_api_fetch: true },
    profile: { TWITTER_USERNAME: 'u' },
    cache: { TWITTER_CACHE_TTL_MS: 3600000 },
    apiDefaults: { TWITTER_FOLLOWERS: '100' },
  },
}))

let getTwitterData
let config
const originalEnv = process.env
const noSleep = () => Promise.resolve()
const okFetch = (body) =>
  vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body })

beforeEach(async () => {
  vi.clearAllMocks()
  vi.resetModules()
  process.env = { ...originalEnv, TWITTER_BEARER_TOKEN: 'tok' }
  config = (await import('../../../../src/config/config.js')).config
  config.twitter.enabled_api_fetch = true // reset shared mock (mutated by disabled test)
  ;({ getTwitterData } = await import('../../../../src/services/data_sources/twitterDataSource.js'))
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  process.env = originalEnv
})

describe('twitterDataSource — discriminated results', () => {
  it('returns ok with the follower count when configured', async () => {
    const fetchImpl = okFetch({ data: { public_metrics: { followers_count: 1234 } } })
    const r = await getTwitterData({ fetchImpl, sleep: noSleep })
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({ twitterFollowers: '1234' })
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('Bearer tok')
  })

  it('returns ok({}) (skip) when no bearer token is present (manual count used)', async () => {
    delete process.env.TWITTER_BEARER_TOKEN
    const fetchImpl = vi.fn()
    const r = await getTwitterData({ fetchImpl, sleep: noSleep })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({})
  })

  it('returns ok({}) (skip) when API fetch is disabled', async () => {
    config.twitter.enabled_api_fetch = false
    const fetchImpl = vi.fn()
    const r = await getTwitterData({ fetchImpl })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({})
  })

  it('returns a FALLBACK on an API error (distinguishable, carries status)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({}),
    })
    const r = await getTwitterData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('fallback')
    expect(r.error.status).toBe(401)
    expect(r.value).toEqual({ twitterFollowers: '100' })
  })

  it('caches an ok result', async () => {
    const fetchImpl = okFetch({ data: { public_metrics: { followers_count: 5 } } })
    await getTwitterData({ fetchImpl, sleep: noSleep })
    await getTwitterData({ fetchImpl, sleep: noSleep })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
