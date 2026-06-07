// tests/unit/services/data_sources/weatherDataSource.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../../../src/config/config.js', () => ({
  config: {
    weather: { enabled: true },
    cache: { WEATHER_CACHE_TTL_MS: 1800000 },
    apiDefaults: {
      TEMPERATURE: '72°F (22°C)',
      WEATHER_DESCRIPTION: 'partly cloudy',
      WEATHER_EMOJI: '⛅',
    },
  },
}))

let getWeatherData
let config
const originalEnv = process.env
const noSleep = () => Promise.resolve()
const okFetch = (body) =>
  vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => body })

beforeEach(async () => {
  vi.clearAllMocks()
  vi.resetModules()
  process.env = { ...originalEnv, WEATHER_API_KEY: 'k', LOCATION_KEY: 'loc' }
  config = (await import('../../../../src/config/config.js')).config
  ;({ getWeatherData } = await import('../../../../src/services/data_sources/weatherDataSource.js'))
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  process.env = originalEnv
})

describe('weatherDataSource — discriminated results', () => {
  it('returns ok with formatted temperature, description and emoji', async () => {
    const fetchImpl = okFetch([{ Temperature: { Imperial: { Value: 75 } }, WeatherText: 'Sunny' }])
    const r = await getWeatherData({ fetchImpl, sleep: noSleep })
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({
      temperature: '75°F (24°C)',
      weatherDescription: 'sunny',
      emoji: '☀️',
    })
    expect(fetchImpl.mock.calls[0][0]).toBe(
      'https://dataservice.accuweather.com/currentconditions/v1/loc?apikey=k'
    )
  })

  it.each([
    ['Sunny', '☀️'],
    ['Mostly Sunny', '🌤️'],
    ['Partly Cloudy', '⛅'],
    ['Cloudy', '☁️'],
    ['Rain', '🌧️'],
    ['Thunderstorm', '⛈️'],
    ['Snow', '❄️'],
    ['Fog', '🌫️'],
    ['Unknown Weather', '⛅'],
  ])('maps "%s" to %s', async (text, emoji) => {
    const fetchImpl = okFetch([{ Temperature: { Imperial: { Value: 70 } }, WeatherText: text }])
    const r = await getWeatherData({ fetchImpl, sleep: noSleep })
    expect(r.value.emoji).toBe(emoji)
  })

  it('caches an ok result', async () => {
    const fetchImpl = okFetch([{ Temperature: { Imperial: { Value: 70 } }, WeatherText: 'Clear' }])
    await getWeatherData({ fetchImpl, sleep: noSleep })
    await getWeatherData({ fetchImpl, sleep: noSleep })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('returns a FALLBACK (defaults + error) on an API error — distinguishable', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      })
    const r = await getWeatherData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('fallback')
    expect(r.error.status).toBe(401)
    expect(r.value).toEqual({
      temperature: config.apiDefaults.TEMPERATURE,
      weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
      emoji: config.apiDefaults.WEATHER_EMOJI,
    })
  })

  it('returns a FALLBACK on empty data', async () => {
    const r = await getWeatherData({ fetchImpl: okFetch([]), sleep: noSleep })
    expect(r.status).toBe('fallback')
  })

  it('returns ok({}) (skip) when API/location keys are missing', async () => {
    delete process.env.WEATHER_API_KEY
    const fetchImpl = vi.fn()
    const r = await getWeatherData({ fetchImpl, sleep: noSleep })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({})
  })
})

describe('weatherDataSource — disabled', () => {
  it('returns ok({}) (skip) when weather is disabled', async () => {
    vi.resetModules()
    vi.doMock('../../../../src/config/config.js', () => ({
      config: {
        weather: { enabled: false },
        cache: { WEATHER_CACHE_TTL_MS: 1 },
        apiDefaults: { TEMPERATURE: 'x', WEATHER_DESCRIPTION: 'y', WEATHER_EMOJI: 'z' },
      },
    }))
    const { getWeatherData: disabled } = await import(
      '../../../../src/services/data_sources/weatherDataSource.js'
    )
    const fetchImpl = vi.fn()
    const r = await disabled({ fetchImpl })
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({})
  })
})
