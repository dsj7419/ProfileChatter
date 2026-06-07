/**
 * weatherDataSource.js
 * Single Responsibility: Weather data acquisition (AccuWeather)
 *
 * Returns a discriminated source result (see sourceResult.js): `ok` with live
 * values (or `ok({})` when weather is disabled / not configured — an intentional
 * skip, not a failure), or `fallback` carrying defaults AND the error.
 */
import { config } from '../../config/config.js'
import { fetchJson } from '../utils/httpClient.js'
import { ok, fallback } from '../utils/sourceResult.js'

let weatherCache = { result: null, expiresAt: 0 }

/**
 * Maps weather conditions to appropriate emojis
 * @param {string} weatherText - Weather condition text
 * @returns {string} - Corresponding emoji
 */
function getWeatherEmoji(weatherText) {
  const weatherMap = {
    'mostly sunny': '🌤️',
    'partly sunny': '⛅',
    'mostly cloudy': '🌥️',
    'partly cloudy': '⛅',
    sunny: '☀️',
    clear: '☀️',
    cloudy: '☁️',
    rain: '🌧️',
    showers: '🌦️',
    thunderstorm: '⛈️',
    snow: '❄️',
    ice: '🧊',
    fog: '🌫️',
    windy: '💨',
  }

  if (!weatherText) return config.apiDefaults.WEATHER_EMOJI

  const lowerWeatherText = weatherText.toLowerCase()
  let bestMatch = ''
  let bestEmoji = config.apiDefaults.WEATHER_EMOJI

  for (const [condition, emoji] of Object.entries(weatherMap)) {
    if (lowerWeatherText.includes(condition) && condition.length > bestMatch.length) {
      bestMatch = condition
      bestEmoji = emoji
    }
  }
  return bestEmoji
}

async function getWeatherData(deps = {}) {
  // Disabled or not configured → intentional skip (no failure to flag).
  if (!config.weather.enabled) return ok({})
  if (weatherCache.result && Date.now() < weatherCache.expiresAt) return weatherCache.result

  const apiKey = process.env.WEATHER_API_KEY
  const locationKey = process.env.LOCATION_KEY
  if (!apiKey || !locationKey) return ok({})

  const defaults = {
    temperature: config.apiDefaults.TEMPERATURE,
    weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
    emoji: config.apiDefaults.WEATHER_EMOJI,
  }

  try {
    const data = await fetchJson(
      `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`,
      { ...deps }
    )
    if (!data || data.length === 0) {
      throw new Error('AccuWeather API returned empty data.')
    }
    const weatherData = data[0]
    const tempF = weatherData.Temperature.Imperial.Value
    const tempC = Math.round(((tempF - 32) * 5) / 9)
    const result = ok({
      temperature: `${tempF}°F (${tempC}°C)`,
      weatherDescription: weatherData.WeatherText.toLowerCase(),
      emoji: getWeatherEmoji(weatherData.WeatherText),
    })
    weatherCache = { result, expiresAt: Date.now() + config.cache.WEATHER_CACHE_TTL_MS }
    return result
  } catch (error) {
    console.warn(`Weather data unavailable, using defaults: ${error.message}`)
    return fallback(defaults, error)
  }
}

export { getWeatherData }
