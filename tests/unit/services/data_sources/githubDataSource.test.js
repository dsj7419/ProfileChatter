// tests/unit/services/data_sources/githubDataSource.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { config } from '../../../../src/config/config.js'

let getGitHubData

beforeEach(async () => {
  vi.resetModules() // reset module-level cache between tests
  ;({ getGitHubData } = await import('../../../../src/services/data_sources/githubDataSource.js'))
})
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const noSleep = () => Promise.resolve()
const okFetch = (body) =>
  vi.fn().mockResolvedValue({ ok: true, status: 200, statusText: 'OK', json: async () => body })

describe('githubDataSource — discriminated results', () => {
  it('returns an ok result with live values', async () => {
    const fetchImpl = okFetch({ public_repos: 42, followers: 100 })
    const r = await getGitHubData({ fetchImpl, sleep: noSleep })
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({ githubPublicRepos: '42', githubFollowers: '100' })
    expect(typeof r.fetchedAt).toBe('number')
  })

  it('caches an ok result (second call does not refetch)', async () => {
    const fetchImpl = okFetch({ public_repos: 50, followers: 150 })
    await getGitHubData({ fetchImpl, sleep: noSleep })
    const r2 = await getGitHubData({ fetchImpl, sleep: noSleep })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(r2.status).toBe('ok')
  })

  it('refetches after the cache TTL expires', async () => {
    vi.useFakeTimers()
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ public_repos: 10, followers: 20 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ public_repos: 15, followers: 25 }),
      })
    await getGitHubData({ fetchImpl, sleep: noSleep })
    vi.advanceTimersByTime(config.cache.GITHUB_CACHE_TTL_MS + 1000)
    const r = await getGitHubData({ fetchImpl, sleep: noSleep })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
    expect(r.value.githubPublicRepos).toBe('15')
  })

  it('returns a FALLBACK (defaults + error) on an auth error — distinguishable from ok', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({}),
      })
    const r = await getGitHubData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('fallback')
    expect(r.value).toEqual({
      githubPublicRepos: config.apiDefaults.GITHUB_PUBLIC_REPOS,
      githubFollowers: config.apiDefaults.GITHUB_FOLLOWERS,
    })
    expect(r.error.status).toBe(401)
  })

  it('returns a FALLBACK on a network error', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('Network failure'))
    const r = await getGitHubData({ fetchImpl, sleep: noSleep, retries: 0 })
    expect(r.status).toBe('fallback')
    expect(r.value.githubPublicRepos).toBe(config.apiDefaults.GITHUB_PUBLIC_REPOS)
  })

  it('does not cache a fallback (recovers on the next call)', async () => {
    const failing = vi.fn().mockRejectedValue(new Error('down'))
    const first = await getGitHubData({ fetchImpl: failing, sleep: noSleep, retries: 0 })
    expect(first.status).toBe('fallback')

    const recovered = okFetch({ public_repos: 1, followers: 2 })
    const second = await getGitHubData({ fetchImpl: recovered, sleep: noSleep })
    expect(second.status).toBe('ok')
  })
})
