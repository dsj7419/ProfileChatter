/**
 * githubOAuthDataSource.js
 * Responsible for fetching and caching GitHub user data using OAuth token
 * Single Responsibility: GitHub OAuth data acquisition
 */
import { config } from '../../config/config.js';
import githubOAuthService from '../auth/githubOAuthService.js';

// Initialize module-level cache store
let githubOAuthCache = { data: null, expiresAt: 0 };

/**
 * Fetch GitHub user data with OAuth authentication
 * Supports both interactive OAuth flow and CI mode with direct token
 * @returns {Promise<Object>} - Enhanced GitHub data (stars, commits, etc.)
 */
async function getGitHubOAuthData() {
  try {
    // Check if valid cached data exists
    if (githubOAuthCache.data && Date.now() < githubOAuthCache.expiresAt) {
      console.info('Using cached GitHub OAuth data.');
      return githubOAuthCache.data;
    }

    // Get OAuth access token - with CI mode support
    let accessToken;
    try {
      // First check for CI mode
      if (process.env.GITHUB_DATA_MODE === 'ci' && process.env.PAT_GITHUB_OAUTH) {
        console.info('Using CI mode for GitHub data with direct token');
        accessToken = process.env.PAT_GITHUB_OAUTH;
      } else {
        // Regular OAuth flow for local development
        accessToken = await githubOAuthService.getAccessToken();
      }
    } catch (tokenError) {
      console.warn('GitHub OAuth token not available:', tokenError.message);
      return {
        githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
        githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
        githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
        githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE,
      };
    }

    // Fetch user data
    let userData;
    let fetchFunction = typeof fetch === 'function' ? fetch : (await import('node-fetch')).default;

    const userResponse = await fetchFunction('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub API error (${userResponse.status}): ${userResponse.statusText}`);
    }

    userData = await userResponse.json();
    console.info(`GitHub user authenticated: ${userData.login}`);

    // Fetch user's repositories
    const reposResponse = await fetchFunction(
      `https://api.github.com/user/repos?per_page=100&sort=updated`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!reposResponse.ok) {
      throw new Error(`GitHub API error (${reposResponse.status}): ${reposResponse.statusText}`);
    }

    const repos = await reposResponse.json();
    console.info(`Fetched ${repos.length} repositories from GitHub`);

    // Only count repositories the user actually owns (not forks)
    const ownedRepos = repos.filter(repo => !repo.fork && repo.owner.login === userData.login);
    console.info(`Found ${ownedRepos.length} owned non-fork repositories`);

    // Calculate total stars - only count repositories the user owns
    const totalStars = ownedRepos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    console.info(`Total stars across owned repositories: ${totalStars}`);

    // Determine primary language based on most used language in repos
    const languageCounts = {};
    ownedRepos.forEach((repo) => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });

    let primaryLanguage = 'None';
    let maxCount = 0;

    for (const [language, count] of Object.entries(languageCounts)) {
      if (count > maxCount) {
        maxCount = count;
        primaryLanguage = language;
      }
    }
    console.info(`Primary language determined: ${primaryLanguage}`);

    // For contributed repos count, use owned repos count
    const contributedReposCount = ownedRepos.length;

    // For commits count, we'll use a cautious approach based on contribution activity
    let commitsLastYear = config.apiDefaults.GITHUB_COMMITS_LAST_YEAR; // Default fallback

    // Try to get contribution stats if possible
    try {
      const username = userData.login;
      
      // Only attempt to get commit data if we have owned repos
      if (ownedRepos.length > 0) {
        const statsResponse = await fetchFunction(
          `https://api.github.com/users/${username}/events?per_page=100`,
          {
            headers: {
              Authorization: `token ${accessToken}`,
              Accept: 'application/vnd.github.v3+json',
            },
          }
        );
        
        if (statsResponse.ok) {
          const events = await statsResponse.json();
          console.info(`Found ${events.length} recent GitHub events`);
          
          // Only count PushEvents as they contain commits
          const pushEvents = events.filter(event => event.type === 'PushEvent');
          console.info(`Found ${pushEvents.length} push events`);
          
          if (pushEvents.length > 0) {
            // Count actual commits from push events
            let totalCommits = 0;
            
            pushEvents.forEach(event => {
              // Ensure we have payload and size
              if (event.payload && typeof event.payload.size === 'number') {
                totalCommits += event.payload.size;
              }
            });
            
            // Scale up to estimate annual count - but be conservative
            // Events API typically covers ~90 days, but we'll use 30 days to be safe
            let estimatedAnnual = Math.round(totalCommits * (365 / 30));
            
            // Cap at a reasonable value to avoid ridiculous estimates
            const maxReasonableAnnualCommits = 3000; // ~8 commits per day max
            if (estimatedAnnual > maxReasonableAnnualCommits) {
              console.info(`Capping estimated commits from ${estimatedAnnual} to ${maxReasonableAnnualCommits}`);
              estimatedAnnual = maxReasonableAnnualCommits;
            }
            
            // Format with "+" to indicate it's an estimate
            commitsLastYear = estimatedAnnual <= 0 ? 
              config.apiDefaults.GITHUB_COMMITS_LAST_YEAR : 
              estimatedAnnual.toString() + "+";
              
            console.info(`Setting commits last year to ${commitsLastYear}`);
          } else {
            console.info('No push events found, using default commit count');
          }
        } else {
          console.warn(`GitHub API returned ${statsResponse.status} for events endpoint`);
        }
      } else {
        console.info('No owned repos found, using default commit count');
      }
    } catch (statsError) {
      console.warn('Error fetching GitHub commit stats:', statsError.message);
      // Fall back to the default estimate defined in config
    }

    // Create result object
    const result = {
      githubTotalStars: totalStars.toString(),
      githubCommitsLastYear: commitsLastYear,
      githubContributedRepos: contributedReposCount.toString(),
      githubPrimaryLanguage: primaryLanguage,
    };

    // Cache the successful API response
    githubOAuthCache.data = result;
    githubOAuthCache.expiresAt = Date.now() + config.cache.GITHUB_OAUTH_CACHE_TTL_MS;
    console.info('GitHub OAuth data fetched from API and cached.');

    return result;
  } catch (error) {
    console.error('Error fetching GitHub OAuth data:', error.message);
    console.info('Using default GitHub OAuth data due to API error.');
    return {
      githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
      githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
      githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
      githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE,
    };
  }
}

export { getGitHubOAuthData };