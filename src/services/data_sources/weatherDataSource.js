/**
 * weatherDataSource.js
 * Responsible for fetching and caching weather data
 * Single Responsibility: Weather data acquisition
 */
import { config } from '../../config/config.js';

// Initialize module-level cache store
let weatherCache = { data: null, expiresAt: 0 };

/**
 * Maps weather conditions to appropriate emojis
 * @param {string} weatherText - Weather condition text
 * @returns {string} - Corresponding emoji
 */
function getWeatherEmoji(weatherText) {
  const weatherMap = {
    'sunny': '☀️',
    'clear': '☀️',
    'mostly sunny': '🌤️',
    'partly sunny': '⛅',
    'partly cloudy': '⛅',
    'mostly cloudy': '🌥️',
    'cloudy': '☁️',
    'rain': '🌧️',
    'showers': '🌦️',
    'thunderstorm': '⛈️',
    'snow': '❄️',
    'ice': '🧊',
    'fog': '🌫️',
    'windy': '💨'
  };

  if (!weatherText) return config.apiDefaults.WEATHER_EMOJI;
  
  const lowerWeatherText = weatherText.toLowerCase();
  
  for (const [condition, emoji] of Object.entries(weatherMap)) {
    if (lowerWeatherText.includes(condition)) {
      return emoji;
    }
  }
  
  return config.apiDefaults.WEATHER_EMOJI;
}

/**
 * Fetch weather data from AccuWeather API with robust error handling and caching
 * @returns {Promise<Object>} - Weather data (temperature, description, emoji)
 */
async function getWeatherData() {
  try {
    // Check if valid cached data exists
    if (weatherCache.data && Date.now() < weatherCache.expiresAt) {
      console.info('Using cached weather data.');
      return weatherCache.data;
    }

    // Get API key and location key from environment variables
    const apiKey = process.env.WEATHER_API_KEY;
    const locationKey = process.env.LOCATION_KEY;
    
    if (!apiKey || !locationKey) {
      throw new Error("Weather API key or location key not provided in environment variables.");
    }
    
    // For browser environments
    if (typeof fetch === 'function') {
      const response = await fetch(
        `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`
      );
      
      if (!response.ok) {
        // Handle specific HTTP error status codes
        switch (response.status) {
          case 401:
            throw new Error(`AccuWeather API error (${response.status}): Unauthorized. Your WEATHER_API_KEY may be invalid.`);
          case 400:
          case 403:
            throw new Error(`AccuWeather API error (${response.status}): Bad request or forbidden. Check your LOCATION_KEY and API key permissions.`);
          case 429:
            throw new Error(`AccuWeather API error (${response.status}): Rate limit exceeded. You may have reached your AccuWeather API quota.`);
          default:
            throw new Error(`AccuWeather API server error (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const weatherData = data[0];
        const tempF = weatherData.Temperature.Imperial.Value;
        const tempC = Math.round((tempF - 32) * 5 / 9);
        
        const result = {
          temperature: `${tempF}°F (${tempC}°C)`,
          weatherDescription: weatherData.WeatherText.toLowerCase(),
          emoji: getWeatherEmoji(weatherData.WeatherText)
        };

        // Cache the successful API response
        weatherCache.data = result;
        weatherCache.expiresAt = Date.now() + config.cache.WEATHER_CACHE_TTL_MS;
        console.info('Weather data fetched from API and cached.');
        
        return result;
      } else {
        throw new Error("AccuWeather API returned empty data.");
      }
    } 
    else {
      // Node.js environment - try with node-fetch
      try {
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(
          `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`
        );
        
        if (!response.ok) {
          // Handle specific HTTP error status codes
          switch (response.status) {
            case 401:
              throw new Error(`AccuWeather API error (${response.status}): Unauthorized. Your WEATHER_API_KEY may be invalid.`);
            case 400:
            case 403:
              throw new Error(`AccuWeather API error (${response.status}): Bad request or forbidden. Check your LOCATION_KEY and API key permissions.`);
            case 429:
              throw new Error(`AccuWeather API error (${response.status}): Rate limit exceeded. You may have reached your AccuWeather API quota.`);
            default:
              throw new Error(`AccuWeather API server error (${response.status}): ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const weatherData = data[0];
          const tempF = weatherData.Temperature.Imperial.Value;
          const tempC = Math.round((tempF - 32) * 5 / 9);
          
          const result = {
            temperature: `${tempF}°F (${tempC}°C)`,
            weatherDescription: weatherData.WeatherText.toLowerCase(),
            emoji: getWeatherEmoji(weatherData.WeatherText)
          };

          // Cache the successful API response
          weatherCache.data = result;
          weatherCache.expiresAt = Date.now() + config.cache.WEATHER_CACHE_TTL_MS;
          console.info('Weather data fetched from API and cached.');
          
          return result;
        } else {
          throw new Error("AccuWeather API returned empty data.");
        }
      } catch (error) {
        console.error('Error fetching AccuWeather data in Node environment:', error.message);
        console.info('Using default weather data due to API error.');
        return {
          temperature: config.apiDefaults.TEMPERATURE,
          weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
          emoji: config.apiDefaults.WEATHER_EMOJI
        };
      }
    }
  } catch (error) {
    console.error('Error fetching AccuWeather data:', error.message);
    console.info('Using default weather data due to API error.');
    return {
      temperature: config.apiDefaults.TEMPERATURE,
      weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
      emoji: config.apiDefaults.WEATHER_EMOJI
    };
  }
}

export { getWeatherData };