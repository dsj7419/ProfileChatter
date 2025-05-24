// tests/unit/services/data_sources/codestatsDataSource.test.js - COMPLETELY FIXED
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

// Mock the config module to control the username
vi.mock('../../../../src/config/config.js', () => ({
  config: {
    profile: {
      CODESTATS_USERNAME: 'testuser' // Default test value
    },
    cache: {
      CODESTATS_CACHE_TTL_MS: 7200000
    },
    apiDefaults: {
      CODESTATS_XP: '0'
    }
  }
}));

describe('codestatsDataSource', () => {
  let mockFetch;
  let getCodeStatsData;
  let config;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset module to clear cache
    vi.resetModules();
    
    // Import fresh modules
    const configModule = await import('../../../../src/config/config.js');
    config = configModule.config;
    
    // Set default test username
    config.profile.CODESTATS_USERNAME = 'testuser';
    
    const module = await import('../../../../src/services/data_sources/codestatsDataSource.js');
    getCodeStatsData = module.getCodeStatsData;
    
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

  describe('Configuration Checks', () => {
    it('should skip API call when username not configured', async () => {
      // Set empty username BEFORE calling the function
      config.profile.CODESTATS_USERNAME = '';
      global.fetch = mockFetch;

      const result = await getCodeStatsData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('Successful API Fetch & Caching', () => {
    it('should fetch CodeStats data successfully', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total_xp: 123456 })
      });

      const result = await getCodeStatsData();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://codestats.net/api/users/testuser'
      );
      expect(result).toEqual({ codestatsXP: '123456' });
    });

    it('should handle non-numeric XP gracefully', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total_xp: null })
      });

      const result = await getCodeStatsData();

      expect(result).toEqual({
        codestatsXP: config.apiDefaults.CODESTATS_XP
      });
    });

    it('should use cached data', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total_xp: 99999 })
      });

      await getCodeStatsData();
      const result = await getCodeStatsData();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ codestatsXP: '99999' });
    });

    it('should refresh after cache expires', async () => {
      global.fetch = mockFetch;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ total_xp: 1000 })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ total_xp: 2000 })
        });

      await getCodeStatsData();
      vi.advanceTimersByTime(config.cache.CODESTATS_CACHE_TTL_MS + 1000);
      const result = await getCodeStatsData();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ codestatsXP: '2000' });
    });
  });

  describe('API Error Handling', () => {
    it('should handle 404 user not found', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      const result = await getCodeStatsData();

      expect(result).toEqual({
        codestatsXP: config.apiDefaults.CODESTATS_XP
      });
    });

    it('should handle server errors', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await getCodeStatsData();

      expect(result).toEqual({
        codestatsXP: config.apiDefaults.CODESTATS_XP
      });
    });

    it('should handle network errors', async () => {
      global.fetch = mockFetch;
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getCodeStatsData();

      expect(result).toEqual({
        codestatsXP: config.apiDefaults.CODESTATS_XP
      });
    });
  });

  describe('Node Environment', () => {
    it('should work in Node environment', async () => {
      delete global.fetch;
      const nodeFetch = (await import('node-fetch')).default;
      nodeFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total_xp: 777777 })
      });

      const result = await getCodeStatsData();

      expect(nodeFetch).toHaveBeenCalled();
      expect(result).toEqual({ codestatsXP: '777777' });
    });

    it('should handle Node environment errors', async () => {
      delete global.fetch;
      const nodeFetch = (await import('node-fetch')).default;
      nodeFetch.mockRejectedValueOnce(new Error('Node error'));

      const result = await getCodeStatsData();

      expect(result).toEqual({
        codestatsXP: config.apiDefaults.CODESTATS_XP
      });
    });
  });
});