// tests/unit/services/data_sources/githubOAuthDataSource.test.js - FIXED
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { config } from '../../../../src/config/config.js';
import githubOAuthService from '../../../../src/services/auth/githubOAuthService.js';

vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

vi.mock('../../../../src/services/auth/githubOAuthService.js', () => ({
  default: {
    getAccessToken: vi.fn()
  }
}));

describe('githubOAuthDataSource', () => {
  let mockFetch;
  let getGitHubOAuthData;
  const originalEnv = process.env;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Reset module
    vi.resetModules();
    const module = await import('../../../../src/services/data_sources/githubOAuthDataSource.js');
    getGitHubOAuthData = module.getGitHubOAuthData;
    
    process.env = { ...originalEnv };
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

  describe('CI Mode', () => {
    it('should use direct token in CI mode', async () => {
      process.env.GITHUB_DATA_MODE = 'ci';
      process.env.PAT_GITHUB_OAUTH = 'ci-token';
      global.fetch = mockFetch;
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'ciuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      await getGitHubOAuthData();

      expect(githubOAuthService.getAccessToken).not.toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token ci-token'
          })
        })
      );
    });
  });

  describe('OAuth Flow', () => {
    it('should use OAuth token in regular mode', async () => {
      githubOAuthService.getAccessToken.mockResolvedValueOnce('oauth-token');
      global.fetch = mockFetch;
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'oauthuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      await getGitHubOAuthData();

      expect(githubOAuthService.getAccessToken).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'token oauth-token'
          })
        })
      );
    });

    it('should handle OAuth token errors', async () => {
      githubOAuthService.getAccessToken.mockRejectedValueOnce(
        new Error('No token')
      );
      global.fetch = mockFetch;

      const result = await getGitHubOAuthData();

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toEqual({
        githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
        githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
        githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
        githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE
      });
    });
  });

  describe('Data Processing', () => {
    beforeEach(() => {
      githubOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
    });

    it('should calculate total stars from owned repos', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              fork: false,
              owner: { login: 'testuser' },
              stargazers_count: 10,
              language: 'JavaScript'
            },
            {
              fork: false,
              owner: { login: 'testuser' },
              stargazers_count: 20,
              language: 'Python'
            },
            {
              fork: true, // Should be excluded
              owner: { login: 'testuser' },
              stargazers_count: 100,
              language: 'Go'
            }
          ]
        });

      const result = await getGitHubOAuthData();

      expect(result.githubTotalStars).toBe('30'); // 10 + 20, excluding fork
      expect(result.githubContributedRepos).toBe('2');
      expect(result.githubPrimaryLanguage).toBe('JavaScript'); // Most common
    });

    it('should determine primary language correctly', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { fork: false, owner: { login: 'testuser' }, language: 'Python' },
            { fork: false, owner: { login: 'testuser' }, language: 'Python' },
            { fork: false, owner: { login: 'testuser' }, language: 'Python' },
            { fork: false, owner: { login: 'testuser' }, language: 'JavaScript' },
            { fork: false, owner: { login: 'testuser' }, language: 'JavaScript' },
            { fork: false, owner: { login: 'testuser' }, language: null }
          ]
        });

      const result = await getGitHubOAuthData();

      expect(result.githubPrimaryLanguage).toBe('Python'); // 3 > 2
    });

    it('should handle no owned repos', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { fork: true, owner: { login: 'testuser' } },
            { fork: false, owner: { login: 'otheruser' } }
          ]
        });

      const result = await getGitHubOAuthData();

      expect(result.githubTotalStars).toBe('0');
      expect(result.githubContributedRepos).toBe('0');
      expect(result.githubPrimaryLanguage).toBe('None');
    });

    it('should estimate commits from events', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { fork: false, owner: { login: 'testuser' }, language: 'Go' }
          ]
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { type: 'PushEvent', payload: { size: 3 } },
            { type: 'PushEvent', payload: { size: 2 } },
            { type: 'IssueEvent', payload: {} }, // Should be ignored
            { type: 'PushEvent', payload: { size: 1 } }
          ]
        });

      const result = await getGitHubOAuthData();

      // 6 commits total, scaled to annual (6 * 365/30 = 73)
      expect(result.githubCommitsLastYear).toBe('73+');
    });

    it('should cap unreasonable commit estimates', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { fork: false, owner: { login: 'testuser' } }
          ]
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { type: 'PushEvent', payload: { size: 1000 } }
          ]
        });

      const result = await getGitHubOAuthData();

      expect(result.githubCommitsLastYear).toBe('3000+'); // Capped at max
    });

    it('should handle events API errors gracefully', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            { fork: false, owner: { login: 'testuser' } }
          ]
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404
        });

      const result = await getGitHubOAuthData();

      expect(result.githubCommitsLastYear).toBe(
        config.apiDefaults.GITHUB_COMMITS_LAST_YEAR
      );
    });
  });

  describe('Caching', () => {
    beforeEach(() => {
      githubOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
    });

    it('should use cached data', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      await getGitHubOAuthData();
      
      // Clear mocks to check second call
      githubOAuthService.getAccessToken.mockClear();
      mockFetch.mockClear();
      
      const result = await getGitHubOAuthData();

      expect(githubOAuthService.getAccessToken).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should refresh after cache expires', async () => {
      githubOAuthService.getAccessToken
        .mockResolvedValueOnce('token1')
        .mockResolvedValueOnce('token2');
      
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'user1' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'user2' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      await getGitHubOAuthData();
      vi.advanceTimersByTime(config.cache.GITHUB_OAUTH_CACHE_TTL_MS + 1000);
      await getGitHubOAuthData();

      expect(mockFetch).toHaveBeenCalledTimes(4);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      githubOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      global.fetch = mockFetch;
    });

    it('should handle user API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      });

      const result = await getGitHubOAuthData();

      expect(result).toEqual({
        githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
        githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
        githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
        githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE
      });
    });

    it('should handle repos API errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error'
        });

      const result = await getGitHubOAuthData();

      expect(result).toEqual({
        githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
        githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
        githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
        githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE
      });
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getGitHubOAuthData();

      expect(result).toEqual({
        githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
        githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
        githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
        githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE
      });
    });
  });

  describe('Node Environment', () => {
    it('should use node-fetch in Node', async () => {
      githubOAuthService.getAccessToken.mockResolvedValueOnce('test-token');
      delete global.fetch;
      
      const nodeFetch = (await import('node-fetch')).default;
      nodeFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'nodeuser' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      await getGitHubOAuthData();

      expect(nodeFetch).toHaveBeenCalled();
    });
  });
});