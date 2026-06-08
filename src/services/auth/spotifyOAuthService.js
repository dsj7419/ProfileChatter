/**
 * spotifyOAuthService.js
 * Handles Spotify OAuth authentication for both local and CI/CD environments
 */
import BaseOAuthService from './baseOAuthService.js'

class SpotifyOAuthService extends BaseOAuthService {
  constructor() {
    super('Spotify')
  }

  /**
   * Get the Spotify authorization URL
   * @returns {string} The authorization URL
   */
  getAuthorizationUrl() {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const redirectUri = encodeURIComponent(
      process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3001/callback'
    )
    const scopes = encodeURIComponent('user-read-currently-playing user-read-recently-played')
    const state = this.generateState()

    return `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&state=${state}&scope=${scopes}`
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code - The authorization code
   * @returns {Promise<Object>} The tokens object
   */
  async exchangeCodeForTokens(code) {
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://127.0.0.1:3001/callback'

    const tokenEndpoint = 'https://accounts.spotify.com/api/token'
    const authHeader = 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')

    let response
    if (typeof fetch === 'function') {
      response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authHeader,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }).toString(),
      })
    } else {
      // For Node.js environments without global fetch
      const { default: nodeFetch } = await import('node-fetch')
      response = await nodeFetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authHeader,
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }).toString(),
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Spotify API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()

    // Calculate expiry time and store
    const tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + data.expires_in * 1000, // Convert seconds to ms
    }

    this.saveTokens(tokens)
    return tokens
  }

  /**
   * Get a valid access token, handling both local and CI/CD environments
   * @returns {Promise<string>} A valid access token
   */
  async getAccessToken() {
    // Check local tokens first (for dev environment)
    try {
      const tokens = this.loadTokens()

      // If we have a valid token, return it
      if (tokens.access_token && Date.now() < tokens.expires_at - 60000) {
        return tokens.access_token
      }

      // If we have a local refresh token, try to use it
      if (tokens.refresh_token) {
        return this.refreshAccessToken()
      }
    } catch (error) {
      // Continue to CI path if local token handling fails
    }

    // Check for CI environment variables
    if (
      process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET &&
      process.env.SPOTIFY_REFRESH_TOKEN
    ) {
      // We're in CI environment or have all required env vars
      return this.refreshAccessToken(true)
    }

    // If we can't refresh using either method, throw an error
    throw new Error(`No valid ${this.providerName} tokens available. Please authenticate first.`)
  }

  /**
   * Whether Spotify is configured: a local token (access/refresh) exists, or all
   * three CI credentials are present. Lets callers treat "never set up" as an
   * intentional skip rather than a failure. No network.
   * @returns {boolean}
   */
  isConfigured() {
    const tokens = this.loadTokens()
    if (tokens.refresh_token || tokens.access_token) return true
    return !!(
      process.env.SPOTIFY_CLIENT_ID &&
      process.env.SPOTIFY_CLIENT_SECRET &&
      process.env.SPOTIFY_REFRESH_TOKEN
    )
  }

  /**
   * Refresh the access token using the refresh token
   * @param {boolean} useEnvVarRefreshToken - Whether to use environment variables instead of local token file
   * @returns {Promise<string>} The new access token
   */
  async refreshAccessToken(useEnvVarRefreshToken = false) {
    let refreshToken, clientId, clientSecret

    if (useEnvVarRefreshToken) {
      // Get credentials from environment variables (CI environment)
      refreshToken = process.env.SPOTIFY_REFRESH_TOKEN
      clientId = process.env.SPOTIFY_CLIENT_ID
      clientSecret = process.env.SPOTIFY_CLIENT_SECRET

      if (!refreshToken || !clientId || !clientSecret) {
        throw new Error('Missing required Spotify credentials in environment variables')
      }
    } else {
      // Get refresh token from local file (dev environment)
      const tokens = this.loadTokens()

      if (!tokens.refresh_token) {
        throw new Error('No refresh token available')
      }

      refreshToken = tokens.refresh_token
      clientId = process.env.SPOTIFY_CLIENT_ID
      clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    }

    const tokenEndpoint = 'https://accounts.spotify.com/api/token'
    const authHeader = 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')

    let response
    if (typeof fetch === 'function') {
      response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authHeader,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      })
    } else {
      // For Node.js environments without global fetch
      const { default: nodeFetch } = await import('node-fetch')
      response = await nodeFetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authHeader,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Spotify API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()

    // Update tokens
    const tokens = useEnvVarRefreshToken ? this.defaultTokens : this.loadTokens()
    tokens.access_token = data.access_token
    if (data.refresh_token) {
      tokens.refresh_token = data.refresh_token
    } else if (useEnvVarRefreshToken) {
      // In CI, we need to keep the original refresh token if Spotify didn't send a new one
      tokens.refresh_token = refreshToken
    }
    tokens.expires_at = Date.now() + data.expires_in * 1000

    // Even in CI, attempt to save tokens to maintain consistent behavior
    // It won't persist across runs but keeps method behavior consistent
    this.saveTokens(tokens)
    return tokens.access_token
  }
}

// Create a singleton instance
const spotifyOAuthService = new SpotifyOAuthService()

export default spotifyOAuthService
