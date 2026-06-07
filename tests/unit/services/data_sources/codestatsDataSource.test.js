// tests/unit/services/data_sources/codestatsDataSource.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../../../src/config/config.js', () => ({
  config: {
    profile: { CODESTATS_USERNAME: 'u' },
    cache: { CODESTATS_CACHE_TTL_MS: 7200000 },
    apiDefaults: { CODESTATS_XP: '0' },
  },
}))

let getCodeStatsData
let config
const noSleep = () => Promise.resolve()
const okFetch = (body) =>
  vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body })

beforeEach(async () => {
  vi.clearAllMocks()
  vi.resetModules()
  config = (await import('../../../../src/config/config.js')).config
  config.profile.CODESTATS_USERNAME = 'u' // reset shared mock (mutated by skip test)
  ;({ getCodeStatsData } = await import(
    '../../../../src/services/data_sources/codestatsDataSource.js'
  ))
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('codestatsDataSource — discriminated results', () => {
  it('returns ok with the total XP', async () => {
    const fetchImpl = okFetch({ total_xp: 12345 })
    const r = await getCodeStatsData({ fetchImpl, sleep: noSleep })
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({ codestatsXP: '12345' })
    expect(fetchImpl.mock.calls[0][0]).toBe('https://codestats.net/api/users/u')
  })

  it('returns ok({}) (skip) when not configured', async () => {
    config.profile.CODESTATS_USERNAME = undefined
    const fetchImpl = vi.fn()
    const r = await getCodeStatsData({ fetchImpl })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({})
  })

  it('returns a FALLBACK on a 404 (distinguishable, carries status)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({}),
    })
    const r = await getCodeStatsData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('fallback')
    expect(r.error.status).toBe(404)
    expect(r.value).toEqual({ codestatsXP: '0' })
  })

  it('returns a FALLBACK on invalid/missing total_xp', async () => {
    const r = await getCodeStatsData({ fetchImpl: okFetch({ nope: true }), sleep: noSleep })
    expect(r.status).toBe('fallback')
  })

  it('caches an ok result', async () => {
    const fetchImpl = okFetch({ total_xp: 1 })
    await getCodeStatsData({ fetchImpl, sleep: noSleep })
    await getCodeStatsData({ fetchImpl, sleep: noSleep })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
