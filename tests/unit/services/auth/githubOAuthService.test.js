// tests/unit/services/auth/githubOAuthService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import githubOAuthService from '../../../../src/services/auth/githubOAuthService.js';

vi.mock('node:fs');
vi.mock('node-fetch', () => ({
  default: vi.fn()
}));

describe('GitHubOAuthService', () => {
  let mockFetch;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    process.env = { ...originalEnv };
    process.env.GITHUB_CLIENT_ID = 'gh-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'gh-client-secret';
    process.env.GITHUB_REDIRECT_URI = 'http://localhost:3000/callback';
    
    mockFetch = vi.fn();
    if (typeof fetch === 'undefined') {
      global.fetch = undefined;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
    if (global.fetch === undefined) {
      delete global.fetch;
    }
  });

  describe('getAuthorizationUrl', () => {
    it('should generate correct authorization URL', () => {
      const url = githubOAuthService.getAuthorizationUrl();
      const urlObj = new URL(url);

      expect(urlObj.hostname).toBe('github.com');
      expect(urlObj.pathname).toBe('/login/oauth/authorize');
      expect(urlObj.searchParams.get('client_id')).toBe('gh-client-id');
      expect(urlObj.searchParams.get('redirect_uri')).toBe('http://localhost:3000/callback');
      expect(urlObj.searchParams.get('scope')).toBe('repo user:email read:user');
      expect(urlObj.searchParams.get('state')).toMatch(/^GitHub:/);
    });

    it('should use default redirect URI', () => {
      delete process.env.GITHUB_REDIRECT_URI;
      const url = githubOAuthService.getAuthorizationUrl();
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get('redirect_uri')).toBe('http://127.0.0.1:3001/callback');
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should exchange code for access token', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'ghs_testtoken123'
        })
      });
      
      fs.writeFileSync = vi.fn();

      const tokens = await githubOAuthService.exchangeCodeForTokens('test-code');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://github.com/login/oauth/access_token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }),
          body: JSON.stringify({
            client_id: 'gh-client-id',
            client_secret: 'gh-client-secret',
            code: 'test-code'
          })
        })
      );

      expect(tokens).toEqual({
        access_token: 'ghs_testtoken123',
        refresh_token: null,
        expires_at: expect.any(Number)
      });

      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      global.fetch = mockFetch;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Bad credentials'
      });

      await expect(
        githubOAuthService.exchangeCodeForTokens('bad-code')
      ).rejects.toThrow('GitHub API error: 401 Unauthorized - Bad credentials');
    });

    it('should work in Node environment', async () => {
      delete global.fetch;
      const nodeFetch = (await import('node-fetch')).default;
      
      nodeFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'node-github-token'
        })
      });
      
      fs.writeFileSync = vi.fn();

      const tokens = await githubOAuthService.exchangeCodeForTokens('test-code');

      expect(nodeFetch).toHaveBeenCalled();
      expect(tokens.access_token).toBe('node-github-token');
    });
  });

  describe('refreshAccessToken', () => {
    it('should throw error as GitHub does not support refresh', async () => {
      await expect(
        githubOAuthService.refreshAccessToken()
      ).rejects.toThrow('GitHub does not support refresh tokens');
    });
  });

  describe('getAccessToken', () => {
    it('should return stored access token', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        access_token: 'stored-github-token'
      }));

      const token = await githubOAuthService.getAccessToken();

      expect(token).toBe('stored-github-token');
    });

    it('should throw when no token available', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify({
        access_token: null
      }));

      await expect(
        githubOAuthService.getAccessToken()
      ).rejects.toThrow('No valid GitHub token available');
    });
  });
});
