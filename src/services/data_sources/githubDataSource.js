/**
 * githubDataSource.js
 * Single Responsibility: GitHub public data acquisition (repos, followers)
 *
 * Returns a discriminated source result (see sourceResult.js): `ok` with live
 * values, or `fallback` carrying config defaults AND the error — so the
 * orchestrator can tell live data from a quiet fallback.
 */
import { config } from '../../config/config.js'
import { fetchJson } from '../utils/httpClient.js'
import { ok, fallback } from '../utils/sourceResult.js'

// Module-level cache of the last successful (ok) result.
let githubCache = { result: null, expiresAt: 0 }

/**
 * @param {object} [deps] - optional injectables forwarded to fetchJson
 *   (fetchImpl, sleep, timeoutMs, retries) — used by tests; production calls
 *   getGitHubData() with no args and uses the defaults.
 * @returns {Promise<import('../utils/sourceResult.js').SourceResult>}
 */
async function getGitHubData(deps = {}) {
  if (githubCache.result && Date.now() < githubCache.expiresAt) {
    return githubCache.result
  }

  const username = config.profile.GITHUB_USERNAME
  const defaults = {
    githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
    githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS,
  }

  try {
    const data = await fetchJson(`https://api.github.com/users/${username}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      ...deps,
    })
    const result = ok({
      githubPublicRepos: data.public_repos.toString(),
      githubFollowers: data.followers.toString(),
    })
    githubCache = { result, expiresAt: Date.now() + config.cache.GITHUB_CACHE_TTL_MS }
    return result
  } catch (error) {
    console.warn(`GitHub data unavailable, using defaults: ${error.message}`)
    return fallback(defaults, error)
  }
}

export { getGitHubData }
