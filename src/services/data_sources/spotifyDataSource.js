/**
 * spotifyDataSource.js
 * Responsible for fetching and caching Spotify track data
 * Single Responsibility: Spotify data acquisition
 */
import { config } from '../../config/config.js';
import spotifyOAuthService from '../auth/spotifyOAuthService.js';

// Initialize module-level cache store
let spotifyCache = { data: null, expiresAt: 0 };

/**
 * Fetch Spotify track data with robust error handling and caching
 * @returns {Promise<Object>} - Currently playing or recently played track info
 */
async function getSpotifyData() {
  try {
    // Check if valid cached data exists
    if (spotifyCache.data && Date.now() < spotifyCache.expiresAt) {
      console.info('Using cached Spotify data.');
      return spotifyCache.data;
    }

    // Get access token from OAuth service
    let token;
    try {
      token = await spotifyOAuthService.getAccessToken();
    } catch (authError) {
      console.info('Spotify authentication error:', authError.message);
      return { spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING };
    }

    // Try to get currently playing track first
    let trackData = null;
    
    if (typeof fetch === 'function') {
      // Browser environment
      trackData = await fetchSpotifyData(fetch, token);
    } else {
      // Node.js environment
      try {
        const { default: nodeFetch } = await import('node-fetch');
        trackData = await fetchSpotifyData(nodeFetch, token);
      } catch (error) {
        console.error('Error importing node-fetch:', error.message);
        return { spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING };
      }
    }

    // Cache the successful API response
    spotifyCache.data = trackData;
    spotifyCache.expiresAt = Date.now() + config.cache.SPOTIFY_CACHE_TTL_MS;
    console.info('Spotify data fetched from API and cached.');
    
    return trackData;
  } catch (error) {
    console.error('Error fetching Spotify data:', error.message);
    console.info('Using default Spotify data due to API error.');
    return { spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING };
  }
}

/**
 * Helper function to fetch Spotify data using provided fetch implementation
 * @param {Function} fetchFn - Fetch function to use
 * @param {string} token - Spotify Bearer token
 * @returns {Promise<Object>} - Processed Spotify data
 */
async function fetchSpotifyData(fetchFn, token) {
  // Try currently playing endpoint
  try {
    const response = await fetchFn('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.status === 200) {
      const data = await response.json();
      if (data && data.item) {
        const trackName = data.item.name;
        const artistName = data.item.artists[0].name;
        return { spotifyTrack: `${trackName} by ${artistName}` };
      }
    } else if (response.status === 204) {
      // 204 means no content (not currently playing) - try recently played instead
      console.info('Not currently playing any tracks. Checking recently played...');
    } else if (response.status === 401) {
      console.error('Spotify API error (401): Unauthorized. Your token may be invalid or expired.');
      return { spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING };
    } else if (response.status === 429) {
      console.error('Spotify API error (429): Rate limit exceeded.');
      return { spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING };
    } else {
      console.error(`Spotify API error (${response.status}): ${response.statusText}`);
      return { spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING };
    }
    
    // Fallback to recently played if not currently playing
    const recentResponse = await fetchFn('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (recentResponse.status === 200) {
      const recentData = await recentResponse.json();
      if (recentData && recentData.items && recentData.items.length > 0) {
        const track = recentData.items[0].track;
        const trackName = track.name;
        const artistName = track.artists[0].name;
        return { spotifyTrack: `${trackName} by ${artistName}` };
      }
    }
    
    // If we get here, no current or recent tracks were found
    return { spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING };
  } catch (error) {
    console.error('Error in Spotify API request:', error.message);
    return { spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING };
  }
}

export { getSpotifyData };