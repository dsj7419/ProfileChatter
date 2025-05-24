/**
 * twitterDataSource.test.js
 * Unit tests for Twitter data source with manual input support
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock the config module with inline object to avoid hoisting issues
vi.mock('../../../../src/config/config.js', () => ({
  config: {
    twitter: {
      enabled_api_fetch: false
    },
    profile: {
      TWITTER_USERNAME: 'testuser'
    },
    cache: {
      TWITTER_CACHE_TTL_MS: 3600000
    },
    apiDefaults: {
      TWITTER_FOLLOWERS: '100'
    }
  }
}));

describe('twitterDataSource', () => {
  let mockFetch;
  let originalEnv;
  let consoleSpy;
  let mockConfig;
  let getTwitterData;

  beforeEach(async () => {
    // Clear module cache to ensure fresh imports
    vi.resetModules();
    
    // Get the mocked config
    const configModule = await import('../../../../src/config/config.js');
    mockConfig = configModule.config;
    
    // Import the function fresh for each test
    const twitterModule = await import('../../../../src/services/data_sources/twitterDataSource.js');
    getTwitterData = twitterModule.getTwitterData;
    
    // Store original environment
    originalEnv = process.env.TWITTER_BEARER_TOKEN;
    
    // Setup console spy
    consoleSpy = {
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {})
    };

    // Setup fetch mock
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Reset mock config to default state
    mockConfig.twitter.enabled_api_fetch = false;
    mockConfig.profile.TWITTER_USERNAME = 'testuser';
  });

  afterEach(() => {
    // Restore environment
    if (originalEnv !== undefined) {
      process.env.TWITTER_BEARER_TOKEN = originalEnv;
    } else {
      delete process.env.TWITTER_BEARER_TOKEN;
    }
    
    // Restore all mocks
    vi.restoreAllMocks();
  });

  describe('when API fetch is disabled', () => {
    beforeEach(() => {
      // Set config to disabled state
      mockConfig.twitter.enabled_api_fetch = false;
    });

    it('should return empty object and log info message', async () => {
      const result = await getTwitterData();
      
      expect(result).toEqual({});
      expect(consoleSpy.info).toHaveBeenCalledWith('Twitter API fetch is disabled. Manual follower count will be used.');
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('when API fetch is enabled', () => {
    beforeEach(() => {
      // Set config to enabled state
      mockConfig.twitter.enabled_api_fetch = true;
      mockConfig.profile.TWITTER_USERNAME = 'testuser';
    });

    describe('but no username is configured', () => {
      beforeEach(() => {
        mockConfig.profile.TWITTER_USERNAME = '';
      });

      it('should return empty object and log info message', async () => {
        const result = await getTwitterData();
        
        expect(result).toEqual({});
        expect(consoleSpy.info).toHaveBeenCalledWith('Twitter username not configured – skipping Twitter call.');
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    describe('but no bearer token is provided', () => {
      beforeEach(() => {
        delete process.env.TWITTER_BEARER_TOKEN;
      });

      it('should return empty object and log info message', async () => {
        const result = await getTwitterData();
        
        expect(result).toEqual({});
        expect(consoleSpy.info).toHaveBeenCalledWith('Twitter API fetch enabled but TWITTER_BEARER_TOKEN is missing. Manual follower count will be used.');
        expect(mockFetch).not.toHaveBeenCalled();
      });
    });

    describe('with valid configuration', () => {
      beforeEach(() => {
        process.env.TWITTER_BEARER_TOKEN = 'test_token';
      });

      it('should successfully fetch and return follower count', async () => {
        const mockResponse = {
          data: {
            public_metrics: {
              followers_count: 1250
            }
          }
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

        const result = await getTwitterData();

        expect(result).toEqual({ twitterFollowers: '1250' });
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.twitter.com/2/users/by/username/testuser?user.fields=public_metrics',
          {
            headers: { Authorization: 'Bearer test_token' }
          }
        );
        expect(consoleSpy.info).toHaveBeenCalledWith('Twitter data fetched & cached.');
      });

      it('should handle 401 unauthorized error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized'
        });

        const result = await getTwitterData();

        expect(result).toEqual({ twitterFollowers: '100' });
        expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching Twitter data:', 'Unauthorized – invalid bearer token.');
        expect(consoleSpy.info).toHaveBeenCalledWith('Using default follower count.');
      });

      it('should handle 403 forbidden error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
          statusText: 'Forbidden'
        });

        const result = await getTwitterData();

        expect(result).toEqual({ twitterFollowers: '100' });
        expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching Twitter data:', 'Forbidden – check app permissions.');
      });

      it('should handle 404 user not found error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        });

        const result = await getTwitterData();

        expect(result).toEqual({ twitterFollowers: '100' });
        expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching Twitter data:', 'User "testuser" not found.');
      });

      it('should handle 429 rate limit error', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests'
        });

        const result = await getTwitterData();

        expect(result).toEqual({ twitterFollowers: '100' });
        expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching Twitter data:', 'Rate‑limit exceeded.');
      });

      it('should handle other HTTP errors', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        });

        const result = await getTwitterData();

        expect(result).toEqual({ twitterFollowers: '100' });
        expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching Twitter data:', 'Twitter API 500: Internal Server Error');
      });

      it('should handle invalid response data', async () => {
        const mockResponse = {
          data: {
            public_metrics: {
              followers_count: 'invalid'
            }
          }
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

        const result = await getTwitterData();

        expect(result).toEqual({ twitterFollowers: '100' });
        expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching Twitter data:', 'Twitter API returned invalid follower count.');
      });

      it('should handle network errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Network error'));

        const result = await getTwitterData();

        expect(result).toEqual({ twitterFollowers: '100' });
        expect(consoleSpy.error).toHaveBeenCalledWith('Error fetching Twitter data:', 'Network error');
      });

      it('should return cached data when cache is fresh', async () => {
        const mockResponse = {
          data: {
            public_metrics: {
              followers_count: 1250
            }
          }
        };

        // Mock Date.now for consistent caching behavior
        const mockDate = vi.spyOn(Date, 'now');
        const baseTime = 1000000;
        mockDate.mockReturnValue(baseTime);

        // First call - should fetch from API
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse)
        });

        const firstResult = await getTwitterData();
        expect(firstResult).toEqual({ twitterFollowers: '1250' });
        expect(mockFetch).toHaveBeenCalledTimes(1);

        // Second call - should use cache (advance time but stay within cache TTL)
        const cacheTime = baseTime + 1800000; // 30 minutes later (within 1 hour TTL)
        mockDate.mockReturnValue(cacheTime);

        const secondResult = await getTwitterData();
        expect(secondResult).toEqual({ twitterFollowers: '1250' });
        expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call - used cache
        expect(consoleSpy.info).toHaveBeenCalledWith('Using cached Twitter data.');

        mockDate.mockRestore();
      });
    });
  });
});