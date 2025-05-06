/**
 * DataService.js
 * Responsible for providing dynamic data for the chat
 * Single Responsibility: Data acquisition and formatting
 */
import { PROFILE, DEFAULTS } from '../config/ProfileConstants.js';

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

  if (!weatherText) return DEFAULTS.WEATHER_EMOJI;
  
  const lowerWeatherText = weatherText.toLowerCase();
  
  for (const [condition, emoji] of Object.entries(weatherMap)) {
    if (lowerWeatherText.includes(condition)) {
      return emoji;
    }
  }
  
  return DEFAULTS.WEATHER_EMOJI;
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
 * Fetch GitHub user data
 */
async function fetchGitHubData() {
  try {
    const username = PROFILE.GITHUB_USERNAME;
    
    // For browser environments
    if (typeof fetch === 'function') {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        githubPublicRepos: data.public_repos.toString(),
        githubFollowers: data.followers.toString()
      };
    } 
    else {
      // Node.js environment - try with node-fetch
      try {
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(`https://api.github.com/users/${username}`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        
        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
          githubPublicRepos: data.public_repos.toString(),
          githubFollowers: data.followers.toString()
        };
      } catch (error) {
        console.warn('API fetch failed, using default GitHub data');
        return {
          githubPublicRepos: DEFAULTS.GITHUB_PUBLIC_REPOS,
          githubFollowers: DEFAULTS.GITHUB_FOLLOWERS
        };
      }
    }
  } catch (error) {
    console.error('Error fetching GitHub data:', error.message);
    return {
      githubPublicRepos: DEFAULTS.GITHUB_PUBLIC_REPOS,
      githubFollowers: DEFAULTS.GITHUB_FOLLOWERS
    };
  }
}

/**
 * Fetch weather data from AccuWeather API
 */
async function fetchWeatherData() {
  try {
    // Get API key and location key from environment variables
    const apiKey = process.env.WEATHER_API_KEY;
    const locationKey = process.env.LOCATION_KEY;
    
    if (!apiKey || !locationKey) {
      console.warn('Weather API key or location key not provided');
      return {
        temperature: DEFAULTS.TEMPERATURE,
        weatherDescription: DEFAULTS.WEATHER_DESCRIPTION,
        emoji: DEFAULTS.WEATHER_EMOJI
      };
    }
    
    // For browser environments
    if (typeof fetch === 'function') {
      const response = await fetch(
        `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`AccuWeather API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const weatherData = data[0];
        const tempF = weatherData.Temperature.Imperial.Value;
        const tempC = Math.round((tempF - 32) * 5 / 9);
        
        return {
          temperature: `${tempF}°F (${tempC}°C)`,
          weatherDescription: weatherData.WeatherText.toLowerCase(),
          emoji: getWeatherEmoji(weatherData.WeatherText)
        };
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
          throw new Error(`AccuWeather API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          const weatherData = data[0];
          const tempF = weatherData.Temperature.Imperial.Value;
          const tempC = Math.round((tempF - 32) * 5 / 9);
          
          return {
            temperature: `${tempF}°F (${tempC}°C)`,
            weatherDescription: weatherData.WeatherText.toLowerCase(),
            emoji: getWeatherEmoji(weatherData.WeatherText)
          };
        }
      } catch (error) {
        console.warn('API fetch failed, using default weather data');
      }
    }
    
    return {
      temperature: DEFAULTS.TEMPERATURE,
      weatherDescription: DEFAULTS.WEATHER_DESCRIPTION,
      emoji: DEFAULTS.WEATHER_EMOJI
    };
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return {
      temperature: DEFAULTS.TEMPERATURE,
      weatherDescription: DEFAULTS.WEATHER_DESCRIPTION,
      emoji: DEFAULTS.WEATHER_EMOJI
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
        workTenure: formatTimePeriod(PROFILE.WORK_START_DATE),
        temperature: DEFAULTS.TEMPERATURE,
        weatherDescription: DEFAULTS.WEATHER_DESCRIPTION,
        emoji: DEFAULTS.WEATHER_EMOJI,
        githubPublicRepos: DEFAULTS.GITHUB_PUBLIC_REPOS,
        githubFollowers: DEFAULTS.GITHUB_FOLLOWERS,
        name: PROFILE.NAME,
        profession: PROFILE.PROFESSION,
        location: PROFILE.LOCATION,
        company: PROFILE.COMPANY,
        currentProject: PROFILE.CURRENT_PROJECT
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
        temperature: DEFAULTS.TEMPERATURE,
        weatherDescription: DEFAULTS.WEATHER_DESCRIPTION,
        emoji: DEFAULTS.WEATHER_EMOJI,
        githubPublicRepos: DEFAULTS.GITHUB_PUBLIC_REPOS,
        githubFollowers: DEFAULTS.GITHUB_FOLLOWERS,
        name: PROFILE.NAME,
        profession: PROFILE.PROFESSION,
        location: PROFILE.LOCATION,
        company: PROFILE.COMPANY,
        currentProject: PROFILE.CURRENT_PROJECT,
        ...customData
      };
    }
  }
}

export default new DataService();