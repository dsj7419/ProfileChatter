// src/services/auth/githubOAuthService.js
import BaseOAuthService from './baseOAuthService.js'

class GitHubOAuthService extends BaseOAuthService {
  constructor() {
    super('GitHub')
  }

  /**
   * Returns the GitHub OAuth authorization URL with appropriate scopes
   * The repo scope provides full repository access (read/write)
   * @returns {string} The complete authorization URL
   */
  getAuthorizationUrl() {
    const clientId = process.env.GITHUB_CLIENT_ID
    const redirectUri = encodeURIComponent(
      process.env.GITHUB_REDIRECT_URI || 'http://127.0.0.1:3001/callback'
    )
    const scopes = encodeURIComponent('repo user:email read:user')

    const state = this.generateState()

    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${state}`
  }

  async exchangeCodeForTokens(code) {
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    const tokenEndpoint = 'https://github.com/login/oauth/access_token'

    let response
    if (typeof fetch === 'function') {
      response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      })
    } else {
      // For Node.js environments without global fetch
      const { default: nodeFetch } = await import('node-fetch')
      response = await nodeFetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      })
    }

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GitHub API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()

    // GitHub tokens don't expire by default, but we'll set a 1-year expiry just in case
    const tokens = {
      access_token: data.access_token,
      refresh_token: null, // GitHub doesn't use refresh tokens
      expires_at: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    }

    this.saveTokens(tokens)
    return tokens
  }

  async refreshAccessToken() {
    // GitHub doesn't use refresh tokens, so we need to re-authenticate
    throw new Error('GitHub does not support refresh tokens. Please re-authenticate.')
  }

  // Override the base method since GitHub doesn't use refresh tokens
  async getAccessToken() {
    const tokens = this.loadTokens()

    if (tokens.access_token) {
      return tokens.access_token
    }

    throw new Error('No valid GitHub token available. Please authenticate first.')
  }

  /**
   * Whether GitHub OAuth is configured (a local token exists). Lets callers
   * treat "never set up" as an intentional skip rather than a failure. No network.
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.loadTokens().access_token
  }
}

// Create a singleton instance
const githubOAuthService = new GitHubOAuthService()

export default githubOAuthService
