// tests/unit/services/data_sources/spotifyDataSource.test.js - FIXED
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { config } from '../../../../src/config/config.js';
import spotifyOAuthService from '../../../../src/services/auth/spotifyOAuthService.js';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

vi.mock('../../../../src/services/auth/spotifyOAuthService.js', () => ({
  default: {
    getAccessToken: vi.fn()
  }
}));

describe('spotifyDataSource', () => {
  let mockFetch;
  let getSpotifyData;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset module
    vi.resetModules();
    const module = await import('../../../../src/services/data_sources/spotifyDataSource.js');
    getSpotifyData = module.getSpotifyData;
    
    mockFetch = vi.fn();
    if (typeof fetch === 'undefined') {
      global.fetch = undefined;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (global.fetch === undefined) {
      delete global.fetch;
    }
  });

  describe('Authentication', () => {
    it('should handle authentication errors', async () => {
      spotifyOAuthService.getAccessToken.mockRejectedValueOnce(
        new Error('No valid token')
      );
      global.fetch = mockFetch;

      const result = await getSpotifyData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING
      });
    });
  });

  describe('Successful API Fetch & Caching', () => {
    it('should fetch currently playing track', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
      
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          item: {
            name: 'Test Song',
            artists: [{ name: 'Test Artist' }]
          }
        })
      });

      const result = await getSpotifyData();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/me/player/currently-playing',
        { headers: { 'Authorization': 'Bearer test-token' } }
      );
      expect(result).toEqual({
        spotifyTrack: 'Test Song by Test Artist'
      });
    });

    it('should fallback to recently played when not currently playing', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
      
      mockFetch
        .mockResolvedValueOnce({ status: 204 }) // No content
        .mockResolvedValueOnce({
          status: 200,
          json: async () => ({
            items: [{
              track: {
                name: 'Recent Song',
                artists: [{ name: 'Recent Artist' }]
              }
            }]
          })
        });

      const result = await getSpotifyData();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api.spotify.com/v1/me/player/recently-played?limit=1',
        { headers: { 'Authorization': 'Bearer test-token' } }
      );
      expect(result).toEqual({
        spotifyTrack: 'Recent Song by Recent Artist'
      });
    });

    it('should handle no tracks available', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
      
      mockFetch
        .mockResolvedValueOnce({ status: 204 })
        .mockResolvedValueOnce({
          status: 200,
          json: async () => ({ items: [] })
        });

      const result = await getSpotifyData();

      expect(result).toEqual({
        spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING
      });
    });

    it('should use cached data', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
      
      mockFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          item: {
            name: 'Cached Song',
            artists: [{ name: 'Cached Artist' }]
          }
        })
      });

      await getSpotifyData();
      // Reset mock counts for clarity
      spotifyOAuthService.getAccessToken.mockClear();
      mockFetch.mockClear();
      
      const result = await getSpotifyData();

      expect(spotifyOAuthService.getAccessToken).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        spotifyTrack: 'Cached Song by Cached Artist'
      });
    });

    it('should refresh after cache expires', async () => {
      spotifyOAuthService.getAccessToken
        .mockResolvedValueOnce('token1')
        .mockResolvedValueOnce('token2');
      global.fetch = mockFetch;
      
      mockFetch
        .mockResolvedValueOnce({
          status: 200,
          json: async () => ({
            item: {
              name: 'Song 1',
              artists: [{ name: 'Artist 1' }]
            }
          })
        })
        .mockResolvedValueOnce({
          status: 200,
          json: async () => ({
            item: {
              name: 'Song 2',
              artists: [{ name: 'Artist 2' }]
            }
          })
        });

      await getSpotifyData();
      vi.advanceTimersByTime(config.cache.SPOTIFY_CACHE_TTL_MS + 1000);
      const result = await getSpotifyData();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        spotifyTrack: 'Song 2 by Artist 2'
      });
    });
  });

  describe('API Error Handling', () => {
    it('should handle 401 Unauthorized', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
      
      mockFetch.mockResolvedValueOnce({
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = await getSpotifyData();

      expect(result).toEqual({
        spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING
      });
    });

    it('should handle 429 Rate Limit', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
      
      mockFetch.mockResolvedValueOnce({
        status: 429,
        statusText: 'Too Many Requests'
      });

      const result = await getSpotifyData();

      expect(result).toEqual({
        spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING
      });
    });

    it('should handle generic API errors', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
      
      mockFetch.mockResolvedValueOnce({
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await getSpotifyData();

      expect(result).toEqual({
        spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING
      });
    });

    it('should handle network errors', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
      
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getSpotifyData();

      expect(result).toEqual({
        spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING
      });
    });
  });

  describe('Node Environment', () => {
    it('should use node-fetch in Node', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      delete global.fetch;
      
      const nodeFetch = (await import('node-fetch')).default;
      nodeFetch.mockResolvedValueOnce({
        status: 200,
        json: async () => ({
          item: {
            name: 'Node Song',
            artists: [{ name: 'Node Artist' }]
          }
        })
      });

      const result = await getSpotifyData();

      expect(nodeFetch).toHaveBeenCalled();
      expect(result).toEqual({
        spotifyTrack: 'Node Song by Node Artist'
      });
    });

    it('should handle Node import errors', async () => {
      spotifyOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      delete global.fetch;
      
      // Mock the dynamic import to throw
      vi.doMock('node-fetch', () => {
        throw new Error('Import failed');
      });

      const result = await getSpotifyData();

      expect(result).toEqual({
        spotifyTrack: config.apiDefaults.SPOTIFY_NOW_PLAYING
      });
      
      // Clean up the mock
      vi.doUnmock('node-fetch');
    });
  });
});