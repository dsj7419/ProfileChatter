// tests/unit/services/data_sources/wakatimeDataSource.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../../../src/config/config.js', () => ({
  config: {
    wakatime: {
      enabled: true,
      cacheTtlMs: 1800000,
      defaults: {
        wakatime_summary: 'No data',
        wakatime_top_language: 'None',
        wakatime_top_language_percent: '0',
      },
    },
    profile: { WAKATIME_USERNAME: 'u' },
  },
}))

let getWakaTimeData
let config
const originalEnv = process.env
const noSleep = () => Promise.resolve()
const okFetch = (body) =>
  vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body })

beforeEach(async () => {
  vi.clearAllMocks()
  vi.resetModules()
  process.env = { ...originalEnv, WAKATIME_API_KEY: 'key' }
  config = (await import('../../../../src/config/config.js')).config
  config.wakatime.enabled = true // reset shared mock (mutated by disabled test)
  ;({ getWakaTimeData } = await import(
    '../../../../src/services/data_sources/wakatimeDataSource.js'
  ))
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  process.env = originalEnv
})

describe('wakatimeDataSource — discriminated results', () => {
  it('returns ok with summary, top language and chart data', async () => {
    const fetchImpl = okFetch({
      data: {
        human_readable_total_including_other_language: '8 hrs',
        languages: [
          { name: 'JavaScript', percent: 65.4 },
          { name: 'Python', percent: 20 },
        ],
      },
    })
    const r = await getWakaTimeData({ fetchImpl, sleep: noSleep })
    expect(r.status).toBe('ok')
    expect(r.value.wakatime_summary).toBe('Coded for 8 hrs in the last week')
    expect(r.value.wakatime_top_language).toBe('JavaScript')
    expect(r.value.wakatime_top_language_percent).toBe('65')
    expect(r.value.wakatime_chart_data).toHaveLength(2)
    expect(r.value.wakatime_chart_data[0]).toMatchObject({ label: 'JavaScript', value: 65 })
  })

  it('returns ok({}) (skip) when disabled', async () => {
    config.wakatime.enabled = false
    const fetchImpl = vi.fn()
    const r = await getWakaTimeData({ fetchImpl })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({})
  })

  it('returns a FALLBACK when enabled but the API key is missing (misconfigured)', async () => {
    delete process.env.WAKATIME_API_KEY
    const fetchImpl = vi.fn()
    const r = await getWakaTimeData({ fetchImpl, sleep: noSleep })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('fallback')
    expect(r.value.wakatime_summary).toBe('No data')
  })

  it('returns a FALLBACK on an API error (distinguishable, carries status)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({}),
    })
    const r = await getWakaTimeData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('fallback')
    expect(r.error.status).toBe(401)
  })

  it('caches an ok result', async () => {
    const fetchImpl = okFetch({
      data: { human_readable_total_including_other_language: '1 hr', languages: [] },
    })
    await getWakaTimeData({ fetchImpl, sleep: noSleep })
    await getWakaTimeData({ fetchImpl, sleep: noSleep })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
