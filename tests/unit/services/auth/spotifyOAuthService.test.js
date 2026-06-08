// tests/unit/services/auth/spotifyOAuthService.test.js - FIXED
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'

vi.mock('node:fs')
vi.mock('node-fetch', () => ({
  default: vi.fn(),
}))

describe('SpotifyOAuthService', () => {
  let mockFetch
  let spotifyOAuthService
  const originalEnv = process.env

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})

    process.env = { ...originalEnv }
    process.env.SPOTIFY_CLIENT_ID = 'test-client-id'
    process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret'
    process.env.SPOTIFY_REDIRECT_URI = 'http://localhost:3000/callback'

    // Reset module
    vi.resetModules()
    const module = await import('../../../../src/services/auth/spotifyOAuthService.js')
    spotifyOAuthService = module.default

    mockFetch = vi.fn()
    if (typeof fetch === 'undefined') {
      global.fetch = undefined
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.env = originalEnv
    if (global.fetch === undefined) {
      delete global.fetch
    }
  })

  describe('getAuthorizationUrl', () => {
    it('should generate correct authorization URL', () => {
      const url = spotifyOAuthService.getAuthorizationUrl()
      const urlObj = new URL(url)

      expect(urlObj.hostname).toBe('accounts.spotify.com')
      expect(urlObj.pathname).toBe('/authorize')
      expect(urlObj.searchParams.get('client_id')).toBe('test-client-id')
      expect(urlObj.searchParams.get('response_type')).toBe('code')
      expect(urlObj.searchParams.get('redirect_uri')).toBe('http://localhost:3000/callback')
      expect(urlObj.searchParams.get('state')).toMatch(/^Spotify:/)
      expect(urlObj.searchParams.get('scope')).toBe(
        'user-read-currently-playing user-read-recently-played'
      )
    })

    it('should use default redirect URI when not specified', () => {
      delete process.env.SPOTIFY_REDIRECT_URI
      const url = spotifyOAuthService.getAuthorizationUrl()
      const urlObj = new URL(url)

      expect(urlObj.searchParams.get('redirect_uri')).toBe('http://127.0.0.1:3001/callback')
    })
  })

  describe('exchangeCodeForTokens', () => {
    it('should exchange code for tokens successfully', async () => {
      global.fetch = mockFetch
      const mockResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      fs.writeFileSync = vi.fn()

      const tokens = await spotifyOAuthService.exchangeCodeForTokens('test-code')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: expect.stringMatching(/^Basic /),
          }),
          body: expect.stringContaining('grant_type=authorization_code'),
        })
      )

      expect(tokens).toEqual({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_at: expect.any(Number),
      })

      expect(fs.writeFileSync).toHaveBeenCalled()
    })

    it('should handle API errors', async () => {
      global.fetch = mockFetch
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => 'Invalid code',
      })

      await expect(spotifyOAuthService.exchangeCodeForTokens('bad-code')).rejects.toThrow(
        'Spotify API error: 400 Bad Request - Invalid code'
      )
    })

    it('should work in Node environment', async () => {
      delete global.fetch
      const nodeFetch = (await import('node-fetch')).default

      nodeFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'node-token',
          refresh_token: 'node-refresh',
          expires_in: 3600,
        }),
      })

      fs.writeFileSync = vi.fn()

      const tokens = await spotifyOAuthService.exchangeCodeForTokens('test-code')

      expect(nodeFetch).toHaveBeenCalled()
      expect(tokens.access_token).toBe('node-token')
    })
  })

  describe('refreshAccessToken', () => {
    it('should refresh token using local refresh token', async () => {
      global.fetch = mockFetch
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(
        JSON.stringify({
          refresh_token: 'local-refresh-token',
        })
      )
      fs.writeFileSync = vi.fn()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'refreshed-token',
          expires_in: 3600,
        }),
      })

      const token = await spotifyOAuthService.refreshAccessToken()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          body: expect.stringContaining('refresh_token=local-refresh-token'),
        })
      )
      expect(token).toBe('refreshed-token')
    })

    it('should refresh using environment variable in CI mode', async () => {
      process.env.SPOTIFY_REFRESH_TOKEN = 'env-refresh-token'
      global.fetch = mockFetch
      fs.writeFileSync = vi.fn()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'ci-refreshed-token',
          expires_in: 3600,
        }),
      })

      const token = await spotifyOAuthService.refreshAccessToken(true)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          body: expect.stringContaining('refresh_token=env-refresh-token'),
        })
      )
      expect(token).toBe('ci-refreshed-token')
    })

    it('should preserve refresh token if not returned', async () => {
      global.fetch = mockFetch
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(
        JSON.stringify({
          refresh_token: 'original-refresh',
        })
      )
      fs.writeFileSync = vi.fn()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'new-access',
          expires_in: 3600,
          // No refresh_token in response
        }),
      })

      await spotifyOAuthService.refreshAccessToken()

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('original-refresh')
      )
    })

    it('should handle missing credentials', async () => {
      delete process.env.SPOTIFY_CLIENT_ID

      await expect(spotifyOAuthService.refreshAccessToken(true)).rejects.toThrow(
        'Missing required Spotify credentials'
      )
    })

    it('should handle refresh errors', async () => {
      global.fetch = mockFetch
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(
        JSON.stringify({
          refresh_token: 'bad-refresh',
        })
      )

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => 'Invalid refresh token',
      })

      await expect(spotifyOAuthService.refreshAccessToken()).rejects.toThrow(
        'Spotify API error: 401 Unauthorized - Invalid refresh token'
      )
    })
  })

  describe('getAccessToken', () => {
    it('should return valid local token', async () => {
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(
        JSON.stringify({
          access_token: 'valid-local-token',
          expires_at: Date.now() + 3600000,
        })
      )

      const token = await spotifyOAuthService.getAccessToken()

      expect(token).toBe('valid-local-token')
    })

    it('should refresh expired local token', async () => {
      global.fetch = mockFetch
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(
        JSON.stringify({
          access_token: 'expired-token',
          refresh_token: 'refresh-me',
          expires_at: Date.now() - 1000,
        })
      )
      fs.writeFileSync = vi.fn()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'fresh-token',
          expires_in: 3600,
        }),
      })

      const token = await spotifyOAuthService.getAccessToken()

      expect(token).toBe('fresh-token')
    })

    it('should use CI environment variables', async () => {
      global.fetch = mockFetch
      process.env.SPOTIFY_REFRESH_TOKEN = 'ci-refresh'

      // Simulate no local token file
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify({}))
      fs.writeFileSync = vi.fn()

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'ci-token',
          expires_in: 3600,
        }),
      })

      const token = await spotifyOAuthService.getAccessToken()

      expect(token).toBe('ci-token')
    })

    it('should throw when no tokens available', async () => {
      fs.existsSync.mockReturnValue(false)
      delete process.env.SPOTIFY_REFRESH_TOKEN

      await expect(spotifyOAuthService.getAccessToken()).rejects.toThrow(
        'No valid Spotify tokens available'
      )
    })
  })

  describe('isConfigured', () => {
    it('is true when a local token file has a refresh_token', () => {
      fs.existsSync.mockReturnValue(true)
      fs.readFileSync.mockReturnValue(JSON.stringify({ refresh_token: 'r' }))
      expect(spotifyOAuthService.isConfigured()).toBe(true)
    })

    it('is true when all CI env credentials are present (no local token)', () => {
      fs.existsSync.mockReturnValue(false)
      process.env.SPOTIFY_REFRESH_TOKEN = 'rt'
      expect(spotifyOAuthService.isConfigured()).toBe(true)
    })

    it('is false when there is no local token and creds are incomplete (unconfigured)', () => {
      fs.existsSync.mockReturnValue(false)
      delete process.env.SPOTIFY_REFRESH_TOKEN
      delete process.env.SPOTIFY_CLIENT_ID
      delete process.env.SPOTIFY_CLIENT_SECRET
      expect(spotifyOAuthService.isConfigured()).toBe(false)
    })
  })
})
