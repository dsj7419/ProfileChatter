// Behavior guard for PR-6: weather ships off-by-default. AccuWeather now needs a
// trial/paid key, so it must not look "broken" out of the box for new adopters.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const originalEnv = process.env

describe('weather is off by default (shipped config)', () => {
  let getWeatherData

  beforeEach(async () => {
    vi.resetModules()
    // Keys ARE present on purpose: ONLY the shipped default (weather.enabled=false)
    // should cause the skip here, not a missing key.
    process.env = { ...originalEnv, WEATHER_API_KEY: 'k', LOCATION_KEY: 'loc' }
    ;({ getWeatherData } = await import('../../../src/services/data_sources/weatherDataSource.js'))
  })

  afterEach(() => {
    process.env = originalEnv
    vi.restoreAllMocks()
  })

  it('config.weather.enabled is false in the shipped default config', async () => {
    const { config } = await import('../../../src/config/config.js')
    expect(config.weather.enabled).toBe(false)
  })

  it('skips weather as an intentional ok({}) even when API keys are present', async () => {
    const fetchImpl = vi.fn()
    const r = await getWeatherData({ fetchImpl })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({})
  })
})
