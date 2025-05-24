// tests/unit/services/auth/oauthRegistry.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import oauthRegistry from '../../../../src/services/auth/oauthRegistry.js';
import spotifyOAuthService from '../../../../src/services/auth/spotifyOAuthService.js';
import githubOAuthService from '../../../../src/services/auth/githubOAuthService.js';

vi.mock('../../../../src/services/auth/spotifyOAuthService.js', () => ({
  default: {
    loadTokens: vi.fn()
  }
}));

vi.mock('../../../../src/services/auth/githubOAuthService.js', () => ({
  default: {
    loadTokens: vi.fn()
  }
}));

describe('OAuthRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProvider', () => {
    it('should return spotify provider', () => {
      const provider = oauthRegistry.getProvider('spotify');
      expect(provider).toBe(spotifyOAuthService);
    });

    it('should return github provider', () => {
      const provider = oauthRegistry.getProvider('github');
      expect(provider).toBe(githubOAuthService);
    });

    it('should be case insensitive', () => {
      const provider = oauthRegistry.getProvider('SPOTIFY');
      expect(provider).toBe(spotifyOAuthService);
    });

    it('should throw error for missing provider name', () => {
      expect(() => oauthRegistry.getProvider()).toThrow(
        'Provider name is required'
      );
    });

    it('should throw error for unknown provider', () => {
      expect(() => oauthRegistry.getProvider('unknown')).toThrow(
        "OAuth provider 'unknown' not found"
      );
    });
  });

  describe('getProviderFromState', () => {
    it('should return provider from valid state', () => {
      const provider = oauthRegistry.getProviderFromState('spotify:abc123');
      expect(provider).toBe(spotifyOAuthService);
    });

    it('should throw error for invalid state', () => {
      expect(() => oauthRegistry.getProviderFromState('invalid')).toThrow(
        'Invalid state parameter'
      );
    });

    it('should throw error for unknown provider in state', () => {
      expect(() => oauthRegistry.getProviderFromState('unknown:123')).toThrow(
        "OAuth provider 'unknown' not found"
      );
    });
  });

  describe('getProviderNames', () => {
    it('should return all provider names', () => {
      const names = oauthRegistry.getProviderNames();
      expect(names).toEqual(['spotify', 'github']);
    });
  });

  describe('getAuthenticationStatus', () => {
    it('should return status for all providers', () => {
      const now = Date.now();
      
      spotifyOAuthService.loadTokens.mockReturnValue({
        access_token: 'spotify-token',
        expires_at: now + 3600000
      });
      
      githubOAuthService.loadTokens.mockReturnValue({
        access_token: 'github-token',
        expires_at: now + 86400000
      });

      const status = oauthRegistry.getAuthenticationStatus();

      expect(status).toEqual({
        spotify: {
          authenticated: true,
          valid: true,
          expiresIn: expect.any(Number)
        },
        github: {
          authenticated: true,
          valid: true,
          expiresIn: expect.any(Number)
        }
      });
      
      expect(status.spotify.expiresIn).toBeGreaterThan(3500);
      expect(status.github.expiresIn).toBeGreaterThan(86000);
    });

    it('should handle missing tokens', () => {
      spotifyOAuthService.loadTokens.mockReturnValue({
        access_token: null,
        expires_at: 0
      });
      
      githubOAuthService.loadTokens.mockReturnValue({
        access_token: 'github-token',
        expires_at: Date.now() - 1000 // Expired
      });

      const status = oauthRegistry.getAuthenticationStatus();

      expect(status).toEqual({
        spotify: {
          authenticated: false,
          valid: false,
          expiresIn: null
        },
        github: {
          authenticated: true,
          valid: false,
          expiresIn: expect.any(Number)
        }
      });
    });

    it('should handle provider errors', () => {
      spotifyOAuthService.loadTokens.mockImplementation(() => {
        throw new Error('Load error');
      });
      
      githubOAuthService.loadTokens.mockReturnValue({
        access_token: 'token',
        expires_at: Date.now() + 1000
      });

      const status = oauthRegistry.getAuthenticationStatus();

      expect(status.spotify).toEqual({
        authenticated: false,
        valid: false,
        error: 'Load error'
      });
      expect(status.github.authenticated).toBe(true);
    });
  });
});