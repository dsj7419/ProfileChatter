// tests/unit/services/data_sources/twitterDataSource.test.js - COMPLETELY FIXED
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

// Mock the config module
vi.mock('../../../../src/config/config.js', () => ({
  config: {
    profile: {
      TWITTER_USERNAME: 'testuser' // Default test value
    },
    cache: {
      TWITTER_CACHE_TTL_MS: 3600000
    },
    apiDefaults: {
      TWITTER_FOLLOWERS: '120'
    }
  }
}));

describe('twitterDataSource', () => {
  let mockFetch;
  let getTwitterData;
  let config;
  const originalEnv = process.env;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset module
    vi.resetModules();
    
    process.env = { ...originalEnv };
    process.env.TWITTER_BEARER_TOKEN = 'test-bearer-token';
    
    // Import fresh modules
    const configModule = await import('../../../../src/config/config.js');
    config = configModule.config;
    
    // Set default test username
    config.profile.TWITTER_USERNAME = 'testuser';
    
    const module = await import('../../../../src/services/data_sources/twitterDataSource.js');
    getTwitterData = module.getTwitterData;
    
    mockFetch = vi.fn();
    if (typeof fetch === 'undefined') {
      global.fetch = undefined;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    process.env = originalEnv;
    if (global.fetch === undefined) {
      delete global.fetch;
    }
  });

  describe('Configuration Checks', () => {
    it('should skip when username not configured', async () => {
      config.profile.TWITTER_USERNAME = '';
      global.fetch = mockFetch;

      const result = await getTwitterData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({}); // Should return empty object, not default
    });

    it('should handle missing bearer token', async () => {
      delete process.env.TWITTER_BEARER_TOKEN;
      global.fetch = mockFetch;

      const result = await getTwitterData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        twitterFollowers: config.apiDefaults.TWITTER_FOLLOWERS
      });
    });
  });

  describe('Successful API Fetch & Caching', () => {
    it('should fetch Twitter data successfully', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            public_metrics: {
              followers_count: 5000
            }
          }
        })
      });

      const result = await getTwitterData();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.twitter.com/2/users/by/username/testuser?user.fields=public_metrics',
        {
          headers: { Authorization: 'Bearer test-bearer-token' }
        }
      );
      expect(result).toEqual({ twitterFollowers: '5000' });
    });

    it('should handle missing bearer token', async () => {
      delete process.env.TWITTER_BEARER_TOKEN;
      global.fetch = mockFetch;

      const result = await getTwitterData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        twitterFollowers: config.apiDefaults.TWITTER_FOLLOWERS
      });
    });

    it('should fetch Twitter data successfully', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            public_metrics: {
              followers_count: 5000
            }
          }
        })
      });

      const result = await getTwitterData();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.twitter.com/2/users/by/username/testuser?user.fields=public_metrics',
        {
          headers: { Authorization: 'Bearer test-bearer-token' }
        }
      );
      expect(result).toEqual({ twitterFollowers: '5000' });
    });

    it('should handle invalid response data', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} })
      });

      const result = await getTwitterData();

      expect(result).toEqual({
        twitterFollowers: config.apiDefaults.TWITTER_FOLLOWERS
      });
    });

    it('should use cached data', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { public_metrics: { followers_count: 1234 } }
        })
      });

      await getTwitterData();
      const result = await getTwitterData();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ twitterFollowers: '1234' });
    });

    it('should refresh after cache expires', async () => {
      global.fetch = mockFetch;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { public_metrics: { followers_count: 100 } }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { public_metrics: { followers_count: 200 } }
          })
        });

      await getTwitterData();
      vi.advanceTimersByTime(config.cache.TWITTER_CACHE_TTL_MS + 1000);
      const result = await getTwitterData();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ twitterFollowers: '200' });
    });
  });

  describe('API Error Handling', () => {
    const errorTests = [
      { status: 401, message: 'Unauthorized – invalid bearer token.' },
      { status: 403, message: 'Forbidden – check app permissions.' },
      { status: 404, message: 'User "testuser" not found.' },
      { status: 429, message: 'Rate‑limit exceeded.' }
    ];

    errorTests.forEach(({ status }) => {
      it(`should handle ${status} error`, async () => {
        global.fetch = mockFetch;
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status,
          statusText: 'Error'
        });

        const result = await getTwitterData();

        expect(result).toEqual({
          twitterFollowers: config.apiDefaults.TWITTER_FOLLOWERS
        });
      });
    });

    it('should handle generic errors', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      });

      const result = await getTwitterData();

      expect(result).toEqual({
        twitterFollowers: config.apiDefaults.TWITTER_FOLLOWERS
      });
    });

    it('should handle network errors', async () => {
      global.fetch = mockFetch;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getTwitterData();

      expect(result).toEqual({
        twitterFollowers: config.apiDefaults.TWITTER_FOLLOWERS
      });
    });
  });

  describe('Node Environment', () => {
    it('should use node-fetch in Node', async () => {
      delete global.fetch;
      const nodeFetch = (await import('node-fetch')).default;
      nodeFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { public_metrics: { followers_count: 999 } }
        })
      });

      const result = await getTwitterData();

      expect(nodeFetch).toHaveBeenCalled();
      expect(result).toEqual({ twitterFollowers: '999' });
    });
  });
});