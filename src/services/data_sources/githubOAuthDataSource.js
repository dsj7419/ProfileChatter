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

  const isCI = process.env.GITHUB_DATA_MODE === 'ci'

  // Unconfigured → intentional skip (a forker who never set up GitHub OAuth), NOT
  // a failure. In CI that means no PAT_GITHUB_OAUTH; locally, no OAuth token set up.
  // A CONFIGURED source that then fails still returns a fallback (visible/alerting).
  const configured = isCI ? !!process.env.PAT_GITHUB_OAUTH : githubOAuthService.isConfigured()
  if (!configured) return ok({})

  // Acquire access token: CI direct token, otherwise the OAuth service.
  let accessToken
  try {
    accessToken = isCI ? process.env.PAT_GITHUB_OAUTH : await githubOAuthService.getAccessToken()
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

    // Live REST stats. Commits is filled by the real GraphQL count below; if that
    // one call fails we still serve these live values (surgical fallback).
    const liveStats = {
      githubTotalStars: totalStars.toString(),
      githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
      githubContributedRepos: contributedReposCount.toString(),
      githubPrimaryLanguage: primaryLanguage,
    }

    // Real "commits last year" via GraphQL contributionsCollection — replaces the
    // fabricated events heuristic (×365/30, capped, "+"). A GraphQL failure is
    // surfaced as a fallback so the status manifest / alerting layer sees it, but
    // the live REST stats above are preserved and only commits falls back.
    try {
      const githubCommitsLastYear = await fetchCommitContributions(
        userData.login,
        accessToken,
        deps
      )
      const result = ok({ ...liveStats, githubCommitsLastYear })
      githubOAuthCache = { result, expiresAt: Date.now() + config.cache.GITHUB_OAUTH_CACHE_TTL_MS }
      return result
    } catch (commitsError) {
      console.warn(
        `GitHub commit contributions unavailable, surfacing fallback: ${commitsError.message}`
      )
      return fallback(liveStats, commitsError)
    }
  } catch (error) {
    console.warn(`GitHub OAuth data unavailable, using defaults: ${error.message}`)
    return fallback(oauthDefaults(), error)
  }
}

/**
 * Fetch the authenticated user's real commit-contribution count for the last
 * year via the GitHub GraphQL API. Returns the count as a string. Throws on HTTP
 * failure (via fetchJson), on a GraphQL `errors` payload, or on a missing count —
 * the caller turns any throw into a surgical fallback.
 * @param {string} login
 * @param {string} accessToken
 * @param {object} deps - injectables forwarded to fetchJson (fetchImpl/sleep/retries)
 * @returns {Promise<string>}
 */
async function fetchCommitContributions(login, accessToken, deps) {
  const body = JSON.stringify({
    query:
      'query($login: String!) { user(login: $login) { contributionsCollection { totalCommitContributions } } }',
    variables: { login },
  })
  const data = await fetchJson('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body,
    ...deps,
  })
  const count = data?.data?.user?.contributionsCollection?.totalCommitContributions
  if (typeof count !== 'number') {
    const reason = data?.errors?.[0]?.message || 'no commit contribution count returned'
    throw new Error(`GitHub GraphQL: ${reason}`)
  }
  return count.toString()
}

export { getGitHubOAuthData }
