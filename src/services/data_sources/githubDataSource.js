/**
 * githubDataSource.js
 * Responsible for fetching and caching GitHub user data
 * Single Responsibility: GitHub data acquisition
 */
import { config } from '../../config/config.js';

// Initialize module-level cache store
let githubCache = { data: null, expiresAt: 0 };

/**
 * Fetch GitHub user data with robust error handling and caching
 * @returns {Promise<Object>} - GitHub data (repos, followers)
 */
async function getGitHubData() {
  try {
    // Check if valid cached data exists
    if (githubCache.data && Date.now() < githubCache.expiresAt) {
      console.info('Using cached GitHub data.');
      return githubCache.data;
    }

    const username = config.profile.GITHUB_USERNAME;
    
    // For browser environments
    if (typeof fetch === 'function') {
      const response = await fetch(`https://api.github.com/users/${username}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      
      if (!response.ok) {
        // Handle specific HTTP error status codes
        switch (response.status) {
          case 401:
            throw new Error(`GitHub API error (${response.status}): Unauthorized. If you're using a GitHub token, it may be invalid.`);
          case 403:
          case 429:
            throw new Error(`GitHub API error (${response.status}): Rate limit exceeded. Consider adding a GITHUB_TOKEN to your environment variables to increase your rate limit.`);
          case 404:
            throw new Error(`GitHub API error (${response.status}): User '${username}' not found. Check the GITHUB_USERNAME in your config.`);
          default:
            throw new Error(`GitHub API server error (${response.status}): ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      
      const result = {
        githubPublicRepos: data.public_repos.toString(),
        githubFollowers: data.followers.toString()
      };

      // Cache the successful API response
      githubCache.data = result;
      githubCache.expiresAt = Date.now() + config.cache.GITHUB_CACHE_TTL_MS;
      console.info('GitHub data fetched from API and cached.');
      
      return result;
    } 
    else {
      // Node.js environment - try with node-fetch
      try {
        const { default: fetch } = await import('node-fetch');
        const response = await fetch(`https://api.github.com/users/${username}`, {
          headers: { 'Accept': 'application/vnd.github.v3+json' }
        });
        
        if (!response.ok) {
          // Handle specific HTTP error status codes
          switch (response.status) {
            case 401:
              throw new Error(`GitHub API error (${response.status}): Unauthorized. If you're using a GitHub token, it may be invalid.`);
            case 403:
            case 429:
              throw new Error(`GitHub API error (${response.status}): Rate limit exceeded. Consider adding a GITHUB_TOKEN to your environment variables to increase your rate limit.`);
            case 404:
              throw new Error(`GitHub API error (${response.status}): User '${username}' not found. Check the GITHUB_USERNAME in your config.`);
            default:
              throw new Error(`GitHub API server error (${response.status}): ${response.statusText}`);
          }
        }
        
        const data = await response.json();
        
        const result = {
          githubPublicRepos: data.public_repos.toString(),
          githubFollowers: data.followers.toString()
        };

        // Cache the successful API response
        githubCache.data = result;
        githubCache.expiresAt = Date.now() + config.cache.GITHUB_CACHE_TTL_MS;
        console.info('GitHub data fetched from API and cached.');
        
        return result;
      } catch (error) {
        console.error('Error fetching GitHub data in Node environment:', error.message);
        console.info('Using default GitHub data due to API error.');
        return {
          githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
          githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS
        };
      }
    }
  } catch (error) {
    console.error('Error fetching GitHub data:', error.message);
    console.info('Using default GitHub data due to API error.');
    return {
      githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
      githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS
    };
  }
}

export { getGitHubData };