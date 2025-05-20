/**
 * githubOAuthDataSource.js
 * Responsible for fetching and caching GitHub user data using OAuth token
 * Single Responsibility: GitHub OAuth data acquisition
 */
import { config } from '../../config/config.js'
import githubOAuthService from '../auth/githubOAuthService.js'

// Initialize module-level cache store
let githubOAuthCache = { data: null, expiresAt: 0 }

/**
 * Fetch GitHub user data with OAuth authentication
 * Supports both interactive OAuth flow and CI mode with direct token
 * @returns {Promise<Object>} - Enhanced GitHub data (stars, commits, etc.)
 */
async function getGitHubOAuthData() {
  try {
    // Check if valid cached data exists
    if (githubOAuthCache.data && Date.now() < githubOAuthCache.expiresAt) {
      console.info('Using cached GitHub OAuth data.')
      return githubOAuthCache.data
    }

    // Get OAuth access token - with CI mode support
    let accessToken
    try {
      // First check for CI mode
      if (process.env.GITHUB_DATA_MODE === 'ci' && process.env.GITHUB_TOKEN) {
        console.info('Using CI mode for GitHub data with direct token')
        accessToken = process.env.GITHUB_TOKEN
      } else {
        // Regular OAuth flow for local development
        accessToken = await githubOAuthService.getAccessToken()
      }
    } catch (tokenError) {
      console.warn('GitHub OAuth token not available:', tokenError.message)
      return {
        githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
        githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
        githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
        githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE,
      }
    }

    // Fetch user data
    let userData
    let fetchFunction = typeof fetch === 'function' ? fetch : (await import('node-fetch')).default

    const userResponse = await fetchFunction('https://api.github.com/user', {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!userResponse.ok) {
      throw new Error(`GitHub API error (${userResponse.status}): ${userResponse.statusText}`)
    }

    userData = await userResponse.json()

    // Fetch user's repositories
    const reposResponse = await fetchFunction(
      `https://api.github.com/user/repos?per_page=100&sort=updated`,
      {
        headers: {
          Authorization: `token ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    )

    if (!reposResponse.ok) {
      throw new Error(`GitHub API error (${reposResponse.status}): ${reposResponse.statusText}`)
    }

    const repos = await reposResponse.json()

    // Calculate total stars
    const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0)

    // Determine primary language based on most used language in repos
    const languageCounts = {}
    repos.forEach((repo) => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
      }
    })

    let primaryLanguage = 'None'
    let maxCount = 0

    for (const [language, count] of Object.entries(languageCounts)) {
      if (count > maxCount) {
        maxCount = count
        primaryLanguage = language
      }
    }

    // Get repositories contributed to by making a separate API call
    // This is a simplified approach - in production, you might want to use the GraphQL API
    const contributedReposCount = repos.length

    // For commits count, we'll use a rough estimate based on contribution activity
    // In a real implementation, you would use the GitHub GraphQL API for more accurate data
    // But that would require additional API calls and increase complexity
    let commitsLastYear = '50+' // Default estimate

    // Try to get contribution stats if possible
    try {
      const username = userData.login
      const statsResponse = await fetchFunction(
        `https://api.github.com/users/${username}/events?per_page=100`,
        {
          headers: {
            Authorization: `token ${accessToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      )

      if (statsResponse.ok) {
        const events = await statsResponse.json()
        const pushEvents = events.filter((event) => event.type === 'PushEvent')

        if (pushEvents.length > 0) {
          // Estimate based on recent activity
          const commitCount = pushEvents.reduce((acc, event) => {
            return acc + (event.payload.size || 0)
          }, 0)

          // Scale up to estimate annual count (rough estimate)
          const estimatedAnnual = Math.round(commitCount * (365 / 30)) // Assuming events cover ~30 days
          commitsLastYear = estimatedAnnual.toString() + '+'
        }
      }
    } catch (statsError) {
      console.warn('Error fetching GitHub commit stats:', statsError.message)
      // Fall back to the default estimate
    }

    // Create result object
    const result = {
      githubTotalStars: totalStars.toString(),
      githubCommitsLastYear: commitsLastYear,
      githubContributedRepos: contributedReposCount.toString(),
      githubPrimaryLanguage: primaryLanguage,
    }

    // Cache the successful API response
    githubOAuthCache.data = result
    githubOAuthCache.expiresAt = Date.now() + config.cache.GITHUB_OAUTH_CACHE_TTL_MS
    console.info('GitHub OAuth data fetched from API and cached.')

    return result
  } catch (error) {
    console.error('Error fetching GitHub OAuth data:', error.message)
    console.info('Using default GitHub OAuth data due to API error.')
    return {
      githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
      githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
      githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
      githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE,
    }
  }
}

export { getGitHubOAuthData }
