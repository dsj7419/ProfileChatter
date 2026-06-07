/**
 * githubOAuthDataSource.js
 * Single Responsibility: GitHub OAuth data acquisition (stars, commits, repos, language)
 *
 * Returns a discriminated source result (see sourceResult.js): `ok` with live
 * values, or `fallback` carrying config defaults AND the error.
 *
 * Note: the "commits last year" value is a best-effort estimate from recent
 * public events; it is replaced by the GraphQL contributionsCollection in PR-5c.
 */
import { config } from '../../config/config.js'
import githubOAuthService from '../auth/githubOAuthService.js'
import { fetchJson } from '../utils/httpClient.js'
import { ok, fallback } from '../utils/sourceResult.js'

let githubOAuthCache = { result: null, expiresAt: 0 }

const oauthDefaults = () => ({
  githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
  githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
  githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
  githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE,
})

/**
 * @param {object} [deps] - optional injectables forwarded to fetchJson
 *   (fetchImpl, sleep, timeoutMs, retries); production calls with no args.
 * @returns {Promise<import('../utils/sourceResult.js').SourceResult>}
 */
async function getGitHubOAuthData(deps = {}) {
  if (githubOAuthCache.result && Date.now() < githubOAuthCache.expiresAt) {
    return githubOAuthCache.result
  }

  // Acquire access token: CI direct token, otherwise the OAuth service.
  let accessToken
  try {
    if (process.env.GITHUB_DATA_MODE === 'ci' && process.env.PAT_GITHUB_OAUTH) {
      accessToken = process.env.PAT_GITHUB_OAUTH
    } else {
      accessToken = await githubOAuthService.getAccessToken()
    }
  } catch (tokenError) {
    console.warn(`GitHub OAuth token unavailable, using defaults: ${tokenError.message}`)
    return fallback(oauthDefaults(), tokenError)
  }

  const headers = {
    Authorization: `token ${accessToken}`,
    Accept: 'application/vnd.github.v3+json',
  }

  try {
    const userData = await fetchJson('https://api.github.com/user', { headers, ...deps })
    const repos = await fetchJson('https://api.github.com/user/repos?per_page=100&sort=updated', {
      headers,
      ...deps,
    })

    // Count only repositories the user actually owns (not forks).
    const ownedRepos = repos.filter((repo) => !repo.fork && repo.owner.login === userData.login)
    const totalStars = ownedRepos.reduce((acc, repo) => acc + repo.stargazers_count, 0)

    const languageCounts = {}
    ownedRepos.forEach((repo) => {
      if (repo.language) languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1
    })
    let primaryLanguage = 'None'
    let maxCount = 0
    for (const [language, count] of Object.entries(languageCounts)) {
      if (count > maxCount) {
        maxCount = count
        primaryLanguage = language
      }
    }

    const contributedReposCount = ownedRepos.length

    // Best-effort commit estimate from recent public events (replaced in PR-5c).
    // A failure here degrades only this one value — it does not fail the source.
    let commitsLastYear = config.apiDefaults.GITHUB_COMMITS_LAST_YEAR
    if (ownedRepos.length > 0) {
      try {
        const events = await fetchJson(
          `https://api.github.com/users/${userData.login}/events?per_page=100`,
          { headers, ...deps }
        )
        const pushEvents = events.filter((event) => event.type === 'PushEvent')
        if (pushEvents.length > 0) {
          let totalCommits = 0
          pushEvents.forEach((event) => {
            if (event.payload && typeof event.payload.size === 'number') {
              totalCommits += event.payload.size
            }
          })
          let estimatedAnnual = Math.round(totalCommits * (365 / 30))
          const maxReasonableAnnualCommits = 3000
          if (estimatedAnnual > maxReasonableAnnualCommits) {
            estimatedAnnual = maxReasonableAnnualCommits
          }
          commitsLastYear =
            estimatedAnnual <= 0
              ? config.apiDefaults.GITHUB_COMMITS_LAST_YEAR
              : estimatedAnnual.toString() + '+'
        }
      } catch (statsError) {
        console.warn(
          `GitHub events stats unavailable, using default commit estimate: ${statsError.message}`
        )
      }
    }

    const result = ok({
      githubTotalStars: totalStars.toString(),
      githubCommitsLastYear: commitsLastYear,
      githubContributedRepos: contributedReposCount.toString(),
      githubPrimaryLanguage: primaryLanguage,
    })
    githubOAuthCache = { result, expiresAt: Date.now() + config.cache.GITHUB_OAUTH_CACHE_TTL_MS }
    return result
  } catch (error) {
    console.warn(`GitHub OAuth data unavailable, using defaults: ${error.message}`)
    return fallback(oauthDefaults(), error)
  }
}

export { getGitHubOAuthData }
