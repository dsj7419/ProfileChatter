/**
 * wakatimeDataSource.js
 * Responsible for fetching and caching WakaTime coding activity data
 * Single Responsibility: WakaTime data acquisition
 */
import { config } from '../../config/config.js';

// Initialize module-level cache store
let wakatimeCache = { data: null, expiresAt: 0 };

/**
 * Fetch WakaTime coding activity data with robust error handling and caching
 * @returns {Promise<Object>} - Coding activity data
 */
async function getWakaTimeData() {
  try {
    // Check if WakaTime integration is enabled
    if (!config.wakatime.enabled) {
      console.info('WakaTime integration is disabled.');
      return {};
    }
    
    // Check if valid cached data exists
    if (wakatimeCache.data && Date.now() < wakatimeCache.expiresAt) {
      console.info('Using cached WakaTime data.');
      return wakatimeCache.data;
    }

    // Get API key from environment variables
    const apiKey = process.env.WAKATIME_API_KEY;
    if (!apiKey) {
      throw new Error("WakaTime API key not provided in environment variables.");
    }

    // Get username from config
    const username = config.profile.WAKATIME_USERNAME;
    if (!username) {
      throw new Error("WakaTime username not configured.");
    }

    // For browser environments
    if (typeof fetch === 'function') {
      // Use browser's btoa() for base64 encoding in browser environments
      const authHeader = 'Basic ' + btoa(apiKey);
      
      // Fetch data from WakaTime API for the last 7 days
      const response = await fetch(
        `https://wakatime.com/api/v1/users/${username}/stats/last_7_days`,
        {
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        // Handle specific HTTP error status codes
        switch (response.status) {
          case 401:
            throw new Error(`WakaTime API error (${response.status}): Unauthorized. Your WAKATIME_API_KEY may be invalid.`);
          case 403:
            throw new Error(`WakaTime API error (${response.status}): Forbidden. Check your API key permissions.`);
          case 404:
            throw new Error(`WakaTime API error (${response.status}): User '${username}' not found. Check your WAKATIME_USERNAME in config.`);
          case 429:
            throw new Error(`WakaTime API error (${response.status}): Rate limit exceeded.`);
          default:
            throw new Error(`WakaTime API server error (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      if (data && data.data) {
        const stats = data.data;
        
        // Extract important data from the response
        let result = {
          wakatime_summary: `Coded for ${stats.human_readable_total_including_other_language || "0 hrs"} in the last week`,
          wakatime_top_language: "None",
          wakatime_top_language_percent: "0",
          wakatime_chart_data: []
        };
        
        // Extract top language data if available
        if (stats.languages && stats.languages.length > 0) {
          const topLang = stats.languages[0];
          result.wakatime_top_language = topLang.name;
          result.wakatime_top_language_percent = Math.round(topLang.percent).toString();
          
          // Format data for chart rendering (top 5 languages)
          result.wakatime_chart_data = stats.languages.slice(0, 5).map(lang => ({
            label: lang.name,
            value: Math.round(lang.percent),
            color: getLanguageColor(lang.name) // Helper to assign consistent colors
          }));
        }

        // Cache the successful API response
        wakatimeCache.data = result;
        wakatimeCache.expiresAt = Date.now() + config.wakatime.cacheTtlMs;
        console.info('WakaTime data fetched from API and cached.');
        
        return result;
      } else {
        throw new Error("WakaTime API returned empty or invalid data.");
      }
    } 
    else {
      // Node.js environment - try with node-fetch
      try {
        const { default: fetch } = await import('node-fetch');
        
        // Use Node.js Buffer for base64 encoding in Node environments
        const authHeader = 'Basic ' + Buffer.from(apiKey).toString('base64');
        
        // Fetch data from WakaTime API for the last 7 days
        const response = await fetch(
          `https://wakatime.com/api/v1/users/${username}/stats/last_7_days`,
          {
            headers: {
              'Authorization': authHeader,
              'Accept': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          // Handle specific HTTP error status codes
          switch (response.status) {
            case 401:
              throw new Error(`WakaTime API error (${response.status}): Unauthorized. Your WAKATIME_API_KEY may be invalid.`);
            case 403:
              throw new Error(`WakaTime API error (${response.status}): Forbidden. Check your API key permissions.`);
            case 404:
              throw new Error(`WakaTime API error (${response.status}): User '${username}' not found. Check your WAKATIME_USERNAME in config.`);
            case 429:
              throw new Error(`WakaTime API error (${response.status}): Rate limit exceeded.`);
            default:
              throw new Error(`WakaTime API server error (${response.status}): ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        
        if (data && data.data) {
          const stats = data.data;
          
          // Extract important data from the response
          let result = {
            wakatime_summary: `Coded for ${stats.human_readable_total_including_other_language || "0 hrs"} in the last week`,
            wakatime_top_language: "None",
            wakatime_top_language_percent: "0",
            wakatime_chart_data: []
          };
          
          // Extract top language data if available
          if (stats.languages && stats.languages.length > 0) {
            const topLang = stats.languages[0];
            result.wakatime_top_language = topLang.name;
            result.wakatime_top_language_percent = Math.round(topLang.percent).toString();
            
            // Format data for chart rendering (top 5 languages)
            result.wakatime_chart_data = stats.languages.slice(0, 5).map(lang => ({
              label: lang.name,
              value: Math.round(lang.percent),
              color: getLanguageColor(lang.name) // Helper to assign consistent colors
            }));
          }

          // Cache the successful API response
          wakatimeCache.data = result;
          wakatimeCache.expiresAt = Date.now() + config.wakatime.cacheTtlMs;
          console.info('WakaTime data fetched from API and cached.');
          
          return result;
        } else {
          throw new Error("WakaTime API returned empty or invalid data.");
        }
      } catch (error) {
        console.error('Error fetching WakaTime data in Node environment:', error.message);
        console.info('Using default WakaTime data due to API error.');
        return config.wakatime.defaults;
      }
    }
  } catch (error) {
    console.error('Error fetching WakaTime data:', error.message);
    console.info('Using default WakaTime data due to API error.');
    return config.wakatime.defaults;
  }
}

/**
 * Gets a consistent color for programming languages
 * @param {string} language - Programming language name
 * @returns {string} - Hex color code
 */
function getLanguageColor(language) {
  // Common language colors (loosely based on GitHub's language colors)
  const colorMap = {
    'JavaScript': '#F7DF1E',
    'TypeScript': '#3178C6',
    'Python': '#3776AB',
    'Java': '#B07219',
    'C#': '#178600',
    'PHP': '#4F5D95',
    'C++': '#F34B7D',
    'C': '#555555',
    'HTML': '#E34C26',
    'CSS': '#563D7C',
    'Ruby': '#CC342D',
    'Go': '#00ADD8',
    'Swift': '#F05138',
    'Kotlin': '#A97BFF',
    'Rust': '#DEA584',
    'Dart': '#00B4AB',
    'Shell': '#89E051',
    'PowerShell': '#012456'
  };
  
  // Return the mapped color or a default
  return colorMap[language] || '#607D8B'; // Default to a neutral blue-gray
}

export { getWakaTimeData };