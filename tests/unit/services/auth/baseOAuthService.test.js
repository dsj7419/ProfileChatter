// tests/unit/services/auth/baseOAuthService.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import BaseOAuthService from '../../../../src/services/auth/baseOAuthService.js';

vi.mock('node:fs');

describe('BaseOAuthService', () => {
  let service;
  const testProvider = 'TestProvider';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    service = new BaseOAuthService(testProvider);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with provider name and token path', () => {
      expect(service.providerName).toBe(testProvider);
      expect(service.tokenPath).toContain('.tokens');
      expect(service.tokenPath).toContain('testprovider.json');
    });

    it('should set default tokens structure', () => {
      expect(service.defaultTokens).toEqual({
        access_token: null,
        refresh_token: null,
        expires_at: 0
      });
    });
  });

  describe('generateState', () => {
    it('should generate state with provider prefix', () => {
      const state = service.generateState();
      expect(state).toMatch(new RegExp(`^${testProvider}:[a-f0-9]{32}$`));
    });

    it('should generate different states each time', () => {
      const state1 = service.generateState();
      const state2 = service.generateState();
      expect(state1).not.toBe(state2);
    });
  });

  describe('getProviderFromState', () => {
    it('should extract provider from valid state', () => {
      const state = 'GitHub:abc123def456';
      expect(BaseOAuthService.getProviderFromState(state)).toBe('GitHub');
    });

    it('should handle state with multiple colons', () => {
      const state = 'Provider:abc:def:123';
      expect(BaseOAuthService.getProviderFromState(state)).toBe('Provider');
    });

    it('should return null for invalid state', () => {
      expect(BaseOAuthService.getProviderFromState(null)).toBe(null);
      expect(BaseOAuthService.getProviderFromState('')).toBe(null);
      expect(BaseOAuthService.getProviderFromState('invalid')).toBe(null);
      expect(BaseOAuthService.getProviderFromState(123)).toBe(null);
    });
  });

  describe('loadTokens', () => {
    it('should load tokens from existing file', () => {
      const mockTokens = {
        access_token: 'test-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(mockTokens));

      const tokens = service.loadTokens();

      expect(fs.existsSync).toHaveBeenCalledWith(service.tokenPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(service.tokenPath, 'utf8');
      expect(tokens).toEqual(mockTokens);
    });

    it('should return default tokens when file does not exist', () => {
      fs.existsSync.mockReturnValue(false);

      const tokens = service.loadTokens();

      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(tokens).toEqual(service.defaultTokens);
    });

    it('should handle file read errors', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation(() => {
        throw new Error('Read error');
      });

      const tokens = service.loadTokens();

      expect(console.error).toHaveBeenCalledWith(
        `Error reading ${testProvider} tokens:`,
        'Read error'
      );
      expect(tokens).toEqual(service.defaultTokens);
    });

    it('should handle JSON parse errors', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');

      const tokens = service.loadTokens();

      expect(console.error).toHaveBeenCalled();
      expect(tokens).toEqual(service.defaultTokens);
    });
  });

  describe('saveTokens', () => {
    it('should save tokens to file', () => {
      const tokens = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_at: Date.now() + 7200000
      };

      service.saveTokens(tokens);

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        service.tokenPath,
        JSON.stringify(tokens, null, 2)
      );
    });

    it('should handle save errors', () => {
      fs.writeFileSync.mockImplementation(() => {
        throw new Error('Write error');
      });

      const tokens = { access_token: 'test' };
      service.saveTokens(tokens);

      expect(console.error).toHaveBeenCalledWith(
        `Error saving ${testProvider} tokens:`,
        'Write error'
      );
    });
  });

  describe('abstract methods', () => {
    it('should throw error for getAuthorizationUrl', () => {
      expect(() => service.getAuthorizationUrl()).toThrow(
        'getAuthorizationUrl must be implemented by subclass'
      );
    });

    it('should throw error for exchangeCodeForTokens', async () => {
      await expect(service.exchangeCodeForTokens('code')).rejects.toThrow(
        'exchangeCodeForTokens must be implemented by subclass'
      );
    });

    it('should throw error for refreshAccessToken', async () => {
      await expect(service.refreshAccessToken()).rejects.toThrow(
        'refreshAccessToken must be implemented by subclass'
      );
    });
  });

  describe('getAccessToken', () => {
    it('should return valid access token', async () => {
      const validToken = {
        access_token: 'valid-token',
        expires_at: Date.now() + 3600000 // 1 hour from now
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(validToken));

      const token = await service.getAccessToken();

      expect(token).toBe('valid-token');
    });

    it('should refresh token when expired', async () => {
      const expiredToken = {
        access_token: 'expired-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() - 1000 // Expired
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(expiredToken));
      
      service.refreshAccessToken = vi.fn().mockResolvedValue('new-token');

      const token = await service.getAccessToken();

      expect(service.refreshAccessToken).toHaveBeenCalled();
      expect(token).toBe('new-token');
    });

    it('should account for 60-second buffer before expiry', async () => {
      const almostExpiredToken = {
        access_token: 'almost-expired',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 30000 // 30 seconds (less than 60s buffer)
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(almostExpiredToken));
      
      service.refreshAccessToken = vi.fn().mockResolvedValue('refreshed-token');

      const token = await service.getAccessToken();

      expect(service.refreshAccessToken).toHaveBeenCalled();
      expect(token).toBe('refreshed-token');
    });

    it('should throw error when no valid tokens available', async () => {
      const noTokens = {
        access_token: null,
        refresh_token: null,
        expires_at: 0
      };
      
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify(noTokens));

      await expect(service.getAccessToken()).rejects.toThrow(
        `No valid ${testProvider} tokens available. Please authenticate first.`
      );
    });
  });
});