/**
 * baseOAuthService.js
 * Base class for OAuth service implementations
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_DIR = path.join(__dirname, '../../../.tokens');

// Ensure tokens directory exists
if (!fs.existsSync(TOKENS_DIR)) {
  fs.mkdirSync(TOKENS_DIR, { recursive: true });
}

class BaseOAuthService {
  constructor(providerName) {
    this.providerName = providerName;
    this.tokenPath = path.join(TOKENS_DIR, `${providerName.toLowerCase()}.json`);
    this.defaultTokens = {
      access_token: null,
      refresh_token: null,
      expires_at: 0
    };
  }

  /**
   * Generate a secure random state for OAuth flow
   * @returns {string} Random state string
   */
  generateState() {
    return this.providerName + ':' + crypto.randomBytes(16).toString('hex');
  }

  /**
   * Extract provider name from state parameter
   * @param {string} state - OAuth state parameter
   * @returns {string|null} Provider name or null if invalid
   */
  static getProviderFromState(state) {
    if (!state || typeof state !== 'string') return null;
    const parts = state.split(':');
    return parts.length >= 2 ? parts[0] : null;
  }

  /**
   * Load tokens from storage file
   * @returns {Object} The tokens object or default if not found
   */
  loadTokens() {
    try {
      if (fs.existsSync(this.tokenPath)) {
        const data = fs.readFileSync(this.tokenPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(`Error reading ${this.providerName} tokens:`, error.message);
    }
    return { ...this.defaultTokens };
  }

  /**
   * Save tokens to storage file
   * @param {Object} tokens - The tokens to save
   */
  saveTokens(tokens) {
    try {
      fs.writeFileSync(this.tokenPath, JSON.stringify(tokens, null, 2));
    } catch (error) {
      console.error(`Error saving ${this.providerName} tokens:`, error.message);
    }
  }

  /**
   * Get the authorization URL - must be implemented by subclasses
   * @returns {string} The authorization URL
   * @abstract
   */
  getAuthorizationUrl() {
    throw new Error('getAuthorizationUrl must be implemented by subclass');
  }

  /**
   * Exchange authorization code for tokens - must be implemented by subclasses
   * @param {string} code - Authorization code from OAuth provider
   * @returns {Promise<Object>} Tokens object
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  async exchangeCodeForTokens(code) {
    throw new Error('exchangeCodeForTokens must be implemented by subclass');
  }

  /**
   * Refresh the access token - must be implemented by subclasses
   * @returns {Promise<string>} New access token
   * @abstract
   */
  async refreshAccessToken() {
    throw new Error('refreshAccessToken must be implemented by subclass');
  }

  /**
   * Get a valid access token, refreshing if necessary
   * @returns {Promise<string>} A valid access token
   */
  async getAccessToken() {
    const tokens = this.loadTokens();
    
    // If we have a valid token, return it
    if (tokens.access_token && Date.now() < tokens.expires_at - 60000) {
      return tokens.access_token;
    }
    
    // Otherwise refresh if possible
    if (tokens.refresh_token) {
      return this.refreshAccessToken();
    }
    
    // If we can't refresh, throw an error
    throw new Error(`No valid ${this.providerName} tokens available. Please authenticate first.`);
  }
}

export default BaseOAuthService;