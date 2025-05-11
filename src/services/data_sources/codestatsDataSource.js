/**
 * codestatsDataSource.js
 * Responsible for fetching and caching Code::Stats user XP data
 * Single Responsibility: Code::Stats data acquisition
 */
import { config } from '../../config/config.js';

// Initialize module-level cache store
let codestatsCache = { data: null, expiresAt: 0 };

/**
 * Fetch Code::Stats total XP with robust error handling and caching
 * @returns {Promise<Object>} - Code::Stats data (total XP)
 */
async function getCodeStatsData() {
  try {
    // Check if Code::Stats username is configured
    const username = config.profile.CODESTATS_USERNAME;
    if (!username) {
      console.info('Code::Stats username not configured - skipping Code::Stats call.');
      return {};
    }

    // Check if valid cached data exists
    if (codestatsCache.data && Date.now() < codestatsCache.expiresAt) {
      console.info('Using cached Code::Stats data.');
      return codestatsCache.data;
    }

    // For browser environments
    if (typeof fetch === 'function') {
      const response = await fetch(`https://codestats.net/api/users/${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        // Handle specific HTTP error status codes
        switch (response.status) {
          case 404:
            throw new Error(`Code::Stats API error (${response.status}): User '${username}' not found. Check your CODESTATS_USERNAME in config.`);
          default:
            throw new Error(`Code::Stats API server error (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      if (data && typeof data.total_xp === 'number') {
        const result = {
          codestatsXP: data.total_xp.toString()
        };

        // Cache the successful API response
        codestatsCache.data = result;
        codestatsCache.expiresAt = Date.now() + config.cache.CODESTATS_CACHE_TTL_MS;
        console.info('Code::Stats data fetched from API and cached.');
        
        return result;
      } else {
        throw new Error("Code::Stats API returned invalid or missing total_xp data.");
      }
    } 
    else {
      // Node.js environment - try with node-fetch
      try {
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(`https://codestats.net/api/users/${encodeURIComponent(username)}`);
        
        if (!response.ok) {
          // Handle specific HTTP error status codes
          switch (response.status) {
            case 404:
              throw new Error(`Code::Stats API error (${response.status}): User '${username}' not found. Check your CODESTATS_USERNAME in config.`);
            default:
              throw new Error(`Code::Stats API server error (${response.status}): ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        
        if (data && typeof data.total_xp === 'number') {
          const result = {
            codestatsXP: data.total_xp.toString()
          };

          // Cache the successful API response
          codestatsCache.data = result;
          codestatsCache.expiresAt = Date.now() + config.cache.CODESTATS_CACHE_TTL_MS;
          console.info('Code::Stats data fetched from API and cached.');
          
          return result;
        } else {
          throw new Error("Code::Stats API returned invalid or missing total_xp data.");
        }
      } catch (error) {
        console.error('Error fetching Code::Stats data in Node environment:', error.message);
        console.info('Using default Code::Stats data due to API error.');
        return {
          codestatsXP: config.apiDefaults.CODESTATS_XP
        };
      }
    }
  } catch (error) {
    console.error('Error fetching Code::Stats data:', error.message);
    console.info('Using default Code::Stats data due to API error.');
    return {
      codestatsXP: config.apiDefaults.CODESTATS_XP
    };
  }
}

export { getCodeStatsData };