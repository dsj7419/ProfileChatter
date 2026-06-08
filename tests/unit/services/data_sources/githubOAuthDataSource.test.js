// tests/unit/services/data_sources/githubOAuthDataSource.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { config } from '../../../../src/config/config.js'
import githubOAuthService from '../../../../src/services/auth/githubOAuthService.js'

vi.mock('../../../../src/services/auth/githubOAuthService.js', () => ({
  default: { getAccessToken: vi.fn(), isConfigured: vi.fn() },
}))

let getGitHubOAuthData
const originalEnv = process.env
const noSleep = () => Promise.resolve()

const json = (body) => ({ ok: true, status: 200, statusText: 'OK', json: async () => body })
const httpErr = (status, statusText = '') => ({
  ok: false,
  status,
  statusText,
  json: async () => ({}),
})
const graphqlCommits = (n) =>
  json({ data: { user: { contributionsCollection: { totalCommitContributions: n } } } })
const graphqlErrors = (message) => json({ errors: [{ message }] })

// Wire the three calls a successful run makes, in order: /user, /user/repos, GraphQL.
const wire = (userBody, reposBody, thirdResponse) =>
  vi
    .fn()
    .mockResolvedValueOnce(json(userBody))
    .mockResolvedValueOnce(json(reposBody))
    .mockResolvedValueOnce(thirdResponse)

beforeEach(async () => {
  vi.clearAllMocks()
  vi.resetModules()
  ;({ getGitHubOAuthData } = await import(
    '../../../../src/services/data_sources/githubOAuthDataSource.js'
  ))
  process.env = { ...originalEnv, GITHUB_DATA_MODE: 'ci', PAT_GITHUB_OAUTH: 'ci-token' }
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  process.env = originalEnv
})

describe('githubOAuthDataSource — discriminated results', () => {
  it('uses the CI token and returns ok with computed stats + the REAL commit contribution count', async () => {
    const fetchImpl = wire(
      { login: 'testuser' },
      [
        { fork: false, owner: { login: 'testuser' }, stargazers_count: 10, language: 'JavaScript' },
        { fork: false, owner: { login: 'testuser' }, stargazers_count: 20, language: 'Python' },
        { fork: true, owner: { login: 'testuser' }, stargazers_count: 100, language: 'Go' },
      ],
      graphqlCommits(181)
    )

    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })

    expect(githubOAuthService.getAccessToken).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value.githubTotalStars).toBe('30') // fork excluded
    expect(r.value.githubContributedRepos).toBe('2')
    expect(r.value.githubPrimaryLanguage).toBe('JavaScript')
    expect(r.value.githubCommitsLastYear).toBe('181') // real count — no fabricated "+"
    expect(r.value.githubCommitsLastYear).toMatch(/^\d+$/)

    // REST /user first, token scheme
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.github.com/user')
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('token ci-token')
    // GraphQL POST for commits, Bearer scheme
    const gql = fetchImpl.mock.calls.find((c) => c[0] === 'https://api.github.com/graphql')
    expect(gql).toBeTruthy()
    expect(gql[1].method).toBe('POST')
    expect(gql[1].headers.Authorization).toBe('Bearer ci-token')
  })

  it('no longer calls the legacy /events endpoint and never emits a "+" estimate', async () => {
    const fetchImpl = wire(
      { login: 'u' },
      [{ fork: false, owner: { login: 'u' } }],
      graphqlCommits(42)
    )
    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(fetchImpl.mock.calls.some((c) => String(c[0]).includes('/events'))).toBe(false)
    expect(r.value.githubCommitsLastYear).toBe('42')
    expect(r.value.githubCommitsLastYear).not.toContain('+')
  })

  it('fetches commit contributions even with zero owned repos (contributions are independent of owned repos)', async () => {
    const fetchImpl = wire({ login: 'u' }, [], graphqlCommits(57))
    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('ok')
    expect(r.value.githubContributedRepos).toBe('0')
    expect(r.value.githubCommitsLastYear).toBe('57')
  })

  it('uses the OAuth service token when not in CI mode', async () => {
    process.env = { ...originalEnv }
    delete process.env.GITHUB_DATA_MODE
    delete process.env.PAT_GITHUB_OAUTH
    githubOAuthService.isConfigured.mockReturnValue(true)
    githubOAuthService.getAccessToken.mockResolvedValueOnce('oauth-token')
    const fetchImpl = wire({ login: 'u' }, [], graphqlCommits(5))

    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })

    expect(githubOAuthService.getAccessToken).toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe('token oauth-token')
  })

  it('returns ok({}) (skip) when CI mode has no PAT_GITHUB_OAUTH — an unconfigured forker, not a failure', async () => {
    process.env = { ...originalEnv, GITHUB_DATA_MODE: 'ci' }
    delete process.env.PAT_GITHUB_OAUTH
    const fetchImpl = vi.fn()

    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep })

    expect(fetchImpl).not.toHaveBeenCalled()
    expect(githubOAuthService.getAccessToken).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({})
  })

  it('returns ok({}) (skip) when GitHub OAuth is unconfigured (non-CI, no local setup)', async () => {
    process.env = { ...originalEnv }
    delete process.env.GITHUB_DATA_MODE
    delete process.env.PAT_GITHUB_OAUTH
    githubOAuthService.isConfigured.mockReturnValue(false)
    const fetchImpl = vi.fn()

    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep })

    expect(githubOAuthService.getAccessToken).not.toHaveBeenCalled()
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({})
  })

  it('returns a FALLBACK when CONFIGURED (non-CI) but the token cannot be retrieved', async () => {
    process.env = { ...originalEnv }
    delete process.env.GITHUB_DATA_MODE
    delete process.env.PAT_GITHUB_OAUTH
    githubOAuthService.isConfigured.mockReturnValue(true)
    githubOAuthService.getAccessToken.mockRejectedValueOnce(new Error('token retrieval failed'))
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

  it('returns a FALLBACK on a user/repos API error (whole source, carries status)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(httpErr(401, 'Unauthorized'))
    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('fallback')
    expect(r.error.status).toBe(401)
  })

  it('surgical fallback: a GraphQL auth failure keeps live stars/repos/language, defaults only commits, and surfaces the error', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ login: 'testuser' }))
      .mockResolvedValueOnce(
        json([{ fork: false, owner: { login: 'testuser' }, stargazers_count: 7, language: 'Rust' }])
      )
      .mockResolvedValueOnce(httpErr(401, 'Unauthorized')) // GraphQL commits call fails auth

    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })

    expect(r.status).toBe('fallback')
    expect(r.error.status).toBe(401)
    // live REST values preserved:
    expect(r.value.githubTotalStars).toBe('7')
    expect(r.value.githubContributedRepos).toBe('1')
    expect(r.value.githubPrimaryLanguage).toBe('Rust')
    // only the failed field defaults:
    expect(r.value.githubCommitsLastYear).toBe(config.apiDefaults.GITHUB_COMMITS_LAST_YEAR)
  })

  it('surgical fallback: a GraphQL errors payload (HTTP 200) surfaces as fallback carrying the message', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ login: 'testuser' }))
      .mockResolvedValueOnce(
        json([{ fork: false, owner: { login: 'testuser' }, stargazers_count: 3, language: 'Go' }])
      )
      .mockResolvedValueOnce(graphqlErrors('Resource not accessible by personal access token'))

    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })

    expect(r.status).toBe('fallback')
    expect(r.error.message).toMatch(/Resource not accessible/)
    expect(r.value.githubTotalStars).toBe('3')
    expect(r.value.githubCommitsLastYear).toBe(config.apiDefaults.GITHUB_COMMITS_LAST_YEAR)
  })

  it('surgical fallback when GraphQL returns a 200 but no commit count', async () => {
    const fetchImpl = wire(
      { login: 'u' },
      [{ fork: false, owner: { login: 'u' }, stargazers_count: 2 }],
      json({ data: { user: null } })
    )
    const r = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('fallback')
    expect(r.value.githubTotalStars).toBe('2')
    expect(r.value.githubCommitsLastYear).toBe(config.apiDefaults.GITHUB_COMMITS_LAST_YEAR)
  })

  it('does not cache a surgical fallback (recovers on the next call)', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(json({ login: 'u' }))
      .mockResolvedValueOnce(json([]))
      .mockResolvedValueOnce(httpErr(503)) // run 1: GraphQL fails → fallback
      .mockResolvedValueOnce(json({ login: 'u' }))
      .mockResolvedValueOnce(json([]))
      .mockResolvedValueOnce(graphqlCommits(9)) // run 2: GraphQL ok → ok

    const r1 = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r1.status).toBe('fallback')

    const r2 = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r2.status).toBe('ok')
    expect(r2.value.githubCommitsLastYear).toBe('9')
  })

  it('caches an ok result (second call does not refetch)', async () => {
    const fetchImpl = wire({ login: 'u' }, [], graphqlCommits(1))
    await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    const callsAfterFirst = fetchImpl.mock.calls.length
    const r2 = await getGitHubOAuthData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(fetchImpl).toHaveBeenCalledTimes(callsAfterFirst)
    expect(r2.status).toBe('ok')
  })
})
