import { describe, it, expect, vi } from 'vitest'
import { runStatusAlert } from './runStatusAlert.js'
import { buildStatusManifest } from '../utils/statusManifest.js'

const alertingManifest = () =>
  buildStatusManifest(
    [
      {
        source: 'githubOAuth',
        status: 'fallback',
        classification: 'fallback',
        error: { message: 'Unauthorized', status: 401 },
        fetchedAt: 1,
      },
    ],
    { generatedAt: 1700000000000 }
  )

const healthyManifest = () =>
  buildStatusManifest(
    [{ source: 'github', status: 'ok', classification: 'live', error: null, fetchedAt: 1 }],
    { generatedAt: 1 }
  )

const port = (over = {}) => ({
  findOpenAlert: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue({ number: 99 }),
  comment: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  ...over,
})

const baseDeps = (over = {}) => ({
  readManifest: () => healthyManifest(),
  env: { GITHUB_TOKEN: 'T', GITHUB_REPOSITORY: 'me/repo' },
  fetchImpl: vi.fn(),
  logger: { log: vi.fn(), error: vi.fn() },
  appendSummary: vi.fn(),
  makeIssues: vi.fn().mockReturnValue(port()),
  ...over,
})

describe('runStatusAlert', () => {
  it('no-ops when the manifest file is missing (never touches GitHub)', async () => {
    const makeIssues = vi.fn()
    const res = await runStatusAlert(baseDeps({ readManifest: () => null, makeIssues }))
    expect(res).toMatchObject({ ok: true, action: 'none', reason: 'no-manifest' })
    expect(makeIssues).not.toHaveBeenCalled()
  })

  it('no-ops when no GitHub token/repo is available (local runs)', async () => {
    const makeIssues = vi.fn()
    const res = await runStatusAlert(baseDeps({ env: {}, makeIssues }))
    expect(res).toMatchObject({ ok: true, action: 'none', reason: 'no-credentials' })
    expect(makeIssues).not.toHaveBeenCalled()
  })

  it('creates the issue for an alerting manifest and reports the action', async () => {
    const issues = port()
    const makeIssues = vi.fn().mockReturnValue(issues)
    const logger = { log: vi.fn(), error: vi.fn() }
    const res = await runStatusAlert(
      baseDeps({ readManifest: () => alertingManifest(), makeIssues, logger })
    )
    expect(res).toMatchObject({ ok: true, action: 'created', issue: 99 })
    expect(makeIssues).toHaveBeenCalledWith({
      repo: 'me/repo',
      token: 'T',
      fetchImpl: expect.any(Function),
    })
    expect(issues.create).toHaveBeenCalledTimes(1)
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining('created'))
  })

  it('reconciles a healthy manifest to a no-op when nothing is open', async () => {
    const issues = port()
    const res = await runStatusAlert(
      baseDeps({
        readManifest: () => healthyManifest(),
        makeIssues: vi.fn().mockReturnValue(issues),
      })
    )
    expect(res).toMatchObject({ ok: true, action: 'none' })
    expect(issues.create).not.toHaveBeenCalled()
  })

  it('on a GitHub API failure: returns not-ok, logs an ::error::, and notes it in the step summary (never throws)', async () => {
    const issues = port({ findOpenAlert: vi.fn().mockRejectedValue(new Error('HTTP 403')) })
    const logger = { log: vi.fn(), error: vi.fn() }
    const appendSummary = vi.fn()
    const res = await runStatusAlert(
      baseDeps({
        readManifest: () => alertingManifest(),
        makeIssues: vi.fn().mockReturnValue(issues),
        logger,
        appendSummary,
      })
    )
    expect(res.ok).toBe(false)
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('::error::'))
    expect(appendSummary).toHaveBeenCalledWith(expect.stringMatching(/reconciliation failed/i))
  })
})
