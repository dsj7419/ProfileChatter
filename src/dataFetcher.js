import { format, formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import Qty from 'js-quantities'

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
  }
  
  // Convert weatherText to lowercase for case-insensitive matching
  const lowerWeatherText = weatherText.toLowerCase()
  
  // Find matching weather condition or default to cloud emoji
  for (const [condition, emoji] of Object.entries(weatherMap)) {
    if (lowerWeatherText.includes(condition)) {
      return emoji
    }
  }
  
  return '🌤️' // Default emoji if no match found
}

/**
 * Fetches dynamic data to replace placeholders in chat messages
 * @returns {Object} Object containing dynamic data values
 */
export async function getDynamicData() {
  // Get current date information
  const now = new Date()
  const currentDayOfWeek = format(now, 'EEEE') // e.g., "Monday"
  const currentDate = format(now, 'MMMM d, yyyy') // e.g., "December 25, 2023"
  
  // Calculate work tenure (using a placeholder start date)
  const workStartDate = new Date(2022, 0, 1) // January 1, 2022
  const workTenure = formatDistanceToNow(workStartDate, { addSuffix: false })
  
  // Default weather data in case API call fails
  let temperature = '--'
  let weatherDescription = 'unavailable'
  let emoji = '👋'
  
  // Default GitHub data in case API call fails
  let githubPublicRepos = 'N/A'
  let githubFollowers = 'N/A'
  
  try {
    // Attempt to fetch weather data if API key and location key are available
    const apiKey = process.env.WEATHER_API_KEY
    const locationKey = process.env.LOCATION_KEY
    
    if (apiKey && locationKey) {
      try {
        // Construct the AccuWeather API URL for current conditions
        const url = `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`
        
        // Make API request
        const response = await axios.get(url)
        
        // Extract weather data from response (AccuWeather returns an array)
        if (response.data && response.data.length > 0) {
          const weatherData = response.data[0]
          
          // Get temperature in Fahrenheit from API
          const tempF = weatherData.Temperature.Imperial.Value
          
          // Convert to Celsius
          const tempC = Math.round(Qty(`${tempF} tempF`).to('tempC').scalar)
          
          // Format temperature string with both units
          temperature = `${tempF}°F (${tempC}°C)`
          
          // Get weather description
          weatherDescription = weatherData.WeatherText
          
          // Get appropriate emoji based on weather condition
          emoji = getWeatherEmoji(weatherDescription)
        }
      } catch (error) {
        console.error('Error fetching weather data:', error.message)
        // Use default values set earlier if API call fails
      }
    } else {
      console.warn('Weather API key or location key not provided. Using placeholder weather data.')
    }
    
    // Fetch GitHub user data
    const githubUsername = 'github-user' // Placeholder username
    try {
      // Construct GitHub API URL for user data
      const githubUrl = `https://api.github.com/users/${githubUsername}`
      
      // Make API request with appropriate headers
      const githubResponse = await axios.get(githubUrl, {
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      // Extract GitHub statistics
      if (githubResponse.data) {
        githubPublicRepos = githubResponse.data.public_repos.toString()
        githubFollowers = githubResponse.data.followers.toString()
      }
    } catch (error) {
      console.error('Error fetching GitHub data:', error.message)
      // Use default values set earlier if API call fails
    }
  } catch (error) {
    console.error('Error in getDynamicData:', error.message)
  }
  
  // Return object with all dynamic data
  return {
    // Implemented dynamic data
    currentDayOfWeek,
    currentDate,
    workTenure,
    temperature,
    weatherDescription,
    emoji,
    githubPublicRepos,
    githubFollowers,
    
    // Placeholder data for future implementation
    name: "Your Name",
    profession: "Software Developer",
    location: "San Francisco",
    company: "Tech Company",
    currentProject: "ProfileChatter SVG Generator"
  }
}