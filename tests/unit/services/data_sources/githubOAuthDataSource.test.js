// tests/unit/services/data_sources/githubOAuthDataSource.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { config } from '../../../../src/config/config.js'
import githubOAuthService from '../../../../src/services/auth/githubOAuthService.js'

vi.mock('../../../../src/services/auth/githubOAuthService.js', () => ({
  default: { getAccessToken: vi.fn() },
}))

let getGitHubOAuthData
const originalEnv = process.env
const noSleep = () => Promise.resolve()
const json = (body) => ({ ok: true, status: 200, statusText: 'OK', json: async () => body })

beforeEach(async () => {
  vi.clearAllMocks()
  vi.resetModules()
  ;({ getGitHubOAuthData } = await import(
    '../../../../src/services/data_sources/githubOAuthDataSource.js'
  ))
  // Default to CI mode with a direct token for most tests.
  process.env = { ...originalEnv, GITHUB_DATA_MODE: 'ci', PAT_GITHUB_OAUTH: 'ci-token' }
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  process.env = originalEnv
})

describe('githubOAuthDataSource — discriminated results', () => {
  it('uses the CI token and returns ok with computed stats', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ login: 'testuser' }))
      .mockResolvedValueOnce(
        json([
          {
            fork: false,
            owner: { login: 'testuser' },
            stargazers_count: 10,
            language: 'JavaScript',
          },
          { fork: false, owner: { login: 'testuser' }, stargazers_count: 20, language: 'Python' },
          { fork: true, owner: { login: 'testuser' }, stargazers_count: 100, language: 'Go' },
        ])
      )
      .mockResolvedValueOnce(json([{ type: 'PushEvent', payload: { size: 3 } }]))

    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })

    expect(githubOAuthService.getAccessToken).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value.githubTotalStars).toBe('30') // fork excluded
    expect(r.value.githubContributedRepos).toBe('2')
    expect(r.value.githubPrimaryLanguage).toBe('JavaScript')
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.github.com/user')
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('token ci-token')
  })

  it('uses the OAuth service token when not in CI mode', async () => {
    process.env = { ...originalEnv }
    delete process.env.GITHUB_DATA_MODE
    delete process.env.PAT_GITHUB_OAUTH
    githubOAuthService.getAccessToken.mockResolvedValueOnce('oauth-token')
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ login: 'u' }))
      .mockResolvedValueOnce(json([]))

    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })

    expect(githubOAuthService.getAccessToken).toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('token oauth-token')
  })

  it('returns a FALLBACK when no token is available', async () => {
    process.env = { ...originalEnv }
    delete process.env.GITHUB_DATA_MODE
    delete process.env.PAT_GITHUB_OAUTH
    githubOAuthService.getAccessToken.mockRejectedValueOnce(new Error('No token'))
    const fetchImpl = vi.fn()

    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep })

    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('fallback')
    expect(r.value).toEqual({
      githubTotalStars: config.apiDefaults.GITHUB_TOTAL_STARS,
      githubCommitsLastYear: config.apiDefaults.GITHUB_COMMITS_LAST_YEAR,
      githubContributedRepos: config.apiDefaults.GITHUB_CONTRIBUTED_REPOS,
      githubPrimaryLanguage: config.apiDefaults.GITHUB_PRIMARY_LANGUAGE,
    })
  })

  it('returns a FALLBACK on a user API error (distinguishable, carries status)', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      })
    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('fallback')
    expect(r.error.status).toBe(401)
  })

  it('estimates commits from push events', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ login: 'testuser' }))
      .mockResolvedValueOnce(json([{ fork: false, owner: { login: 'testuser' }, language: 'Go' }]))
      .mockResolvedValueOnce(
        json([
          { type: 'PushEvent', payload: { size: 3 } },
          { type: 'PushEvent', payload: { size: 2 } },
          { type: 'IssuesEvent', payload: {} },
          { type: 'PushEvent', payload: { size: 1 } },
        ])
      )
    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.value.githubCommitsLastYear).toBe('73+') // 6 * 365/30 = 73
  })

  it('caps unreasonable commit estimates', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ login: 'testuser' }))
      .mockResolvedValueOnce(json([{ fork: false, owner: { login: 'testuser' } }]))
      .mockResolvedValueOnce(json([{ type: 'PushEvent', payload: { size: 1000 } }]))
    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.value.githubCommitsLastYear).toBe('3000+')
  })

  it('stays ok with default commits when the events API fails (partial degradation)', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ login: 'testuser' }))
      .mockResolvedValueOnce(json([{ fork: false, owner: { login: 'testuser' } }]))
      .mockResolvedValueOnce({ ok: false, status: 404, statusText: '', json: async () => ({}) })
    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('ok')
    expect(r.value.githubCommitsLastYear).toBe(config.apiDefaults.GITHUB_COMMITS_LAST_YEAR)
  })

  it('caches an ok result (second call does not refetch)', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ login: 'u' }))
      .mockResolvedValueOnce(json([]))
    await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    const callsAfterFirst = fetchImpl.mock.calls.length
    const r2 = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(fetchImpl).toHaveBeenCalledTimes(callsAfterFirst)
    expect(r2.status).toBe('ok')
  })
})
