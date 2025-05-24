// tests/unit/services/data_sources/githubDataSource.test.js - FIXED
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { config } from '../../../../src/config/config.js';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

describe('githubDataSource', () => {
  let mockFetch;
  let getGitHubData;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Clear module cache and re-import
    vi.resetModules();
    const module = await import('../../../../src/services/data_sources/githubDataSource.js');
    getGitHubData = module.getGitHubData;
    
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

  describe('Successful API Fetch & Caching', () => {
    it('should fetch GitHub data successfully', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          public_repos: 42,
          followers: 100
        })
      });

      const result = await getGitHubData();

      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/users/${config.profile.GITHUB_USERNAME}`,
        { headers: { 'Accept': 'application/vnd.github.v3+json' } }
      );
      expect(result).toEqual({
        githubPublicRepos: '42',
        githubFollowers: '100'
      });
    });

    it('should use cached data on second call', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          public_repos: 50,
          followers: 150
        })
      });

      const result1 = await getGitHubData();
      const result2 = await getGitHubData();

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result2).toEqual(result1);
    });

    it('should fetch new data after cache expires', async () => {
      global.fetch = mockFetch;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ public_repos: 10, followers: 20 })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ public_repos: 15, followers: 25 })
        });

      await getGitHubData();
      vi.advanceTimersByTime(config.cache.GITHUB_CACHE_TTL_MS + 1000);
      const result = await getGitHubData();

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        githubPublicRepos: '15',
        githubFollowers: '25'
      });
    });
  });

  describe('API Error Handling', () => {
    const errorTests = [
      { status: 401, description: 'Unauthorized' },
      { status: 403, description: 'Rate limit' },
      { status: 429, description: 'Too many requests' },
      { status: 404, description: 'User not found' },
      { status: 500, description: 'Server error' }
    ];

    errorTests.forEach(({ status, description }) => {
      it(`should handle ${status} ${description} error`, async () => {
        global.fetch = mockFetch;
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status,
          statusText: description
        });

        const result = await getGitHubData();

        expect(result).toEqual({
          githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
          githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS
        });
      });
    });

    it('should handle network errors', async () => {
      global.fetch = mockFetch;
      mockFetch.mockRejectedValueOnce(new Error('Network failure'));

      const result = await getGitHubData();

      expect(result).toEqual({
        githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
        githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS
      });
    });
  });

  describe('Node Environment', () => {
    it('should use node-fetch in Node environment', async () => {
      delete global.fetch;
      const nodeFetch = (await import('node-fetch')).default;
      nodeFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          public_repos: 30,
          followers: 60
        })
      });

      const result = await getGitHubData();

      expect(nodeFetch).toHaveBeenCalled();
      expect(result).toEqual({
        githubPublicRepos: '30',
        githubFollowers: '60'
      });
    });

    it('should handle errors in Node environment', async () => {
      delete global.fetch;
      const nodeFetch = (await import('node-fetch')).default;
      nodeFetch.mockRejectedValueOnce(new Error('Node fetch error'));

      const result = await getGitHubData();

      expect(result).toEqual({
        githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
        githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS
      });
    });
  });
});