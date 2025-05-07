/**
 * DataService.js
 * Responsible for providing dynamic data for the chat
 * Single Responsibility: Data acquisition and formatting
 */
import { config } from '../config/config.js';

// Initialize in-memory cache stores
let weatherCache = { data: null, expiresAt: 0 };
let githubCache = { data: null, expiresAt: 0 };

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
 * Format a date to day of week (e.g., "Monday")
 */
function formatDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Format a date to month, day, year (e.g., "May 5, 2025")
 */
function formatDate(date) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

/**
 * Calculate time period from a start date until now
 */
function formatTimePeriod(startDate) {
  const now = new Date();
  const diffYears = now.getFullYear() - startDate.getFullYear();
  const diffMonths = now.getMonth() - startDate.getMonth();
  
  let years = diffYears;
  let months = diffMonths;
  
  if (diffMonths < 0) {
    years--;
    months = 12 + diffMonths;
  }
  
  if (years > 0) {
    return months > 0 ? `${years} years and ${months} months` : `${years} years`;
  } else {
    return `${months} months`;
  }
}

/**
 * Fetch GitHub user data with robust error handling and caching
 */
async function fetchGitHubData() {
  try {
    // Check if valid cached data exists
    if (githubCache.data && Date.now() < githubCache.expiresAt) {
      console.info('Using cached GitHub data.');
      return githubCache.data;
    }

    const username = config.profile.GITHUB_USERNAME;
    
    // For browser environments
    if (typeof fetch === 'function') {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      
      if (!response.ok) {
        // Handle specific HTTP error status codes
        switch (response.status) {
          case 401:
            throw new Error(`GitHub API error (${response.status}): Unauthorized. If you're using a GitHub token, it may be invalid.`);
          case 403:
          case 429:
            throw new Error(`GitHub API error (${response.status}): Rate limit exceeded. Consider adding a GITHUB_TOKEN to your environment variables to increase your rate limit.`);
          case 404:
            throw new Error(`GitHub API error (${response.status}): User '${username}' not found. Check the GITHUB_USERNAME in your config.`);
          default:
            throw new Error(`GitHub API server error (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      const result = {
        githubPublicRepos: data.public_repos.toString(),
        githubFollowers: data.followers.toString()
      };

      // Cache the successful API response
      githubCache.data = result;
      githubCache.expiresAt = Date.now() + config.cache.GITHUB_CACHE_TTL_MS;
      console.info('GitHub data fetched from API and cached.');
      
      return result;
    } 
    else {
      // Node.js environment - try with node-fetch
      try {
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(`https://api.github.com/users/${username}`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        
        if (!response.ok) {
          // Handle specific HTTP error status codes
          switch (response.status) {
            case 401:
              throw new Error(`GitHub API error (${response.status}): Unauthorized. If you're using a GitHub token, it may be invalid.`);
            case 403:
            case 429:
              throw new Error(`GitHub API error (${response.status}): Rate limit exceeded. Consider adding a GITHUB_TOKEN to your environment variables to increase your rate limit.`);
            case 404:
              throw new Error(`GitHub API error (${response.status}): User '${username}' not found. Check the GITHUB_USERNAME in your config.`);
            default:
              throw new Error(`GitHub API server error (${response.status}): ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        
        const result = {
          githubPublicRepos: data.public_repos.toString(),
          githubFollowers: data.followers.toString()
        };

        // Cache the successful API response
        githubCache.data = result;
        githubCache.expiresAt = Date.now() + config.cache.GITHUB_CACHE_TTL_MS;
        console.info('GitHub data fetched from API and cached.');
        
        return result;
      } catch (error) {
        console.error('Error fetching GitHub data in Node environment:', error.message);
        console.info('Using default GitHub data due to API error.');
        return {
          githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
          githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS
        };
      }
    }
  } catch (error) {
    console.error('Error fetching GitHub data:', error.message);
    console.info('Using default GitHub data due to API error.');
    return {
      githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
      githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS
    };
  }
}

/**
 * Fetch weather data from AccuWeather API with robust error handling and caching
 */
async function fetchWeatherData() {
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

/**
 * DataService class - Provides dynamic data for chat messages
 */
class DataService {
  /**
   * Get all dynamic data needed for chat messages
   * @param {Object} customData - Optional override values
   * @returns {Promise<Object>} - Complete data for message placeholders
   */
  async getDynamicData(customData = {}) {
    try {
      const now = new Date();
      
      // First, get basic date information and profile data synchronously
      const baseData = {
        currentDayOfWeek: formatDayOfWeek(now),
        currentDate: formatDate(now),
        workTenure: formatTimePeriod(config.profile.WORK_START_DATE),
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI,
        githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
        githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS,
        name: config.profile.NAME,
        profession: config.profile.PROFESSION,
        location: config.profile.LOCATION,
        company: config.profile.COMPANY,
        currentProject: config.profile.CURRENT_PROJECT
      };
      
      // Then, fetch API data in parallel
      try {
        const [weatherData, githubData] = await Promise.all([
          fetchWeatherData(),
          fetchGitHubData()
        ]);
        
        // Merge API data with base data
        Object.assign(baseData, weatherData, githubData);
      } catch (error) {
        console.error('Error fetching API data:', error.message);
        console.info('Using default data for some values due to API errors.');
      }
      
      // Finally, merge with any custom override data
      return { ...baseData, ...customData };
    } catch (error) {
      console.error('Error in getDynamicData:', error.message);
      
      // Provide fallback data if anything goes wrong
      return {
        currentDayOfWeek: 'Monday',
        currentDate: 'May 5, 2025',
        workTenure: '3 years and 4 months',
        temperature: config.apiDefaults.TEMPERATURE,
        weatherDescription: config.apiDefaults.WEATHER_DESCRIPTION,
        emoji: config.apiDefaults.WEATHER_EMOJI,
        githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
        githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS,
        name: config.profile.NAME,
        profession: config.profile.PROFESSION,
        location: config.profile.LOCATION,
        company: config.profile.COMPANY,
        currentProject: config.profile.CURRENT_PROJECT,
        ...customData
      };
    }
  }
}

export default new DataService();