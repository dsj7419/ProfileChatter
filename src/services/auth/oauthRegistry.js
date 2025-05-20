/**
 * oauthRegistry.js
 * Registry for all OAuth service providers
 */
import spotifyOAuthService from './spotifyOAuthService.js';
import githubOAuthService from './githubOAuthService.js';
import BaseOAuthService from './baseOAuthService.js';

class OAuthRegistry {
  constructor() {
    this.providers = {
      spotify: spotifyOAuthService,
      github: githubOAuthService
    };
  }

  /**
   * Get a provider by name
   * @param {string} providerName - Name of the provider
   * @returns {BaseOAuthService} The provider instance
   * @throws {Error} If provider not found
   */
  getProvider(providerName) {
    if (!providerName) {
      throw new Error('Provider name is required');
    }
    
    const provider = this.providers[providerName.toLowerCase()];
    if (!provider) {
      throw new Error(`OAuth provider '${providerName}' not found`);
    }
    return provider;
  }

  /**
   * Get a provider from the state parameter
   * @param {string} state - OAuth state parameter
   * @returns {BaseOAuthService} The provider instance
   * @throws {Error} If provider not found or state is invalid
   */
  getProviderFromState(state) {
    const providerName = BaseOAuthService.getProviderFromState(state);
    if (!providerName) {
      throw new Error('Invalid state parameter');
    }
    return this.getProvider(providerName);
  }

  /**
   * Get all available provider names
   * @returns {string[]} Array of provider names
   */
  getProviderNames() {
    return Object.keys(this.providers);
  }

  /**
   * Get authentication status for all providers
   * @returns {Object} Status for each provider
   */
  getAuthenticationStatus() {
    const status = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        const tokens = provider.loadTokens();
        status[name] = {
          authenticated: !!tokens.access_token,
          valid: tokens.expires_at > Date.now(),
          expiresIn: tokens.expires_at ? Math.floor((tokens.expires_at - Date.now()) / 1000) : null
        };
      } catch (error) {
        status[name] = { authenticated: false, valid: false, error: error.message };
      }
    }
    
    return status;
  }
}

const oauthRegistry = new OAuthRegistry();
export default oauthRegistry;