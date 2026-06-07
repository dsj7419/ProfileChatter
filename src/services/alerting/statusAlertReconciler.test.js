import { describe, it, expect } from 'vitest'
import { reconcileStatusAlert, ALERT_MARKER } from './statusAlertReconciler.js'
import { buildStatusManifest } from '../utils/statusManifest.js'

const entry = (over) => ({
  source: 'github',
  status: 'ok',
  classification: 'live',
  error: null,
  fetchedAt: 1,
  ...over,
})

// Alerting because a CONFIGURED source failed; weather skip must NOT count.
const alerting401 = () =>
  buildStatusManifest(
    [
      entry({ source: 'github', classification: 'live' }),
      entry({ source: 'weather', classification: 'skip' }),
      entry({
        source: 'githubOAuth',
        status: 'fallback',
        classification: 'fallback',
        error: { message: 'Unauthorized', status: 401 },
      }),
    ],
    { generatedAt: 1700000000000 }
  )

// Alerting, but a non-auth outage (503) — not high-signal.
const alerting503 = () =>
  buildStatusManifest(
    [
      entry({ source: 'github', classification: 'live' }),
      entry({
        source: 'wakatime',
        status: 'error',
        classification: 'error',
        error: { message: 'Service Unavailable', status: 503 },
      }),
    ],
    { generatedAt: 1700000200000 }
  )

const healthy = () =>
  buildStatusManifest(
    [
      entry({ source: 'github', classification: 'live' }),
      entry({ source: 'weather', classification: 'skip' }),
    ],
    { generatedAt: 1700000100000 }
  )

// Fake issues port: records calls and models a single open alert issue.
function fakeIssues(initial = null) {
  const calls = []
  let open = initial
  let next = 101
  return {
    calls,
    async findOpenAlert(marker) {
      calls.push({ fn: 'findOpenAlert', marker })
      return open
    },
    async create({ title, body }) {
      calls.push({ fn: 'create', title, body })
      open = { number: next, body }
      return { number: next++ }
    },
    async comment(number, body) {
      calls.push({ fn: 'comment', number, body })
    },
    async close(number) {
      calls.push({ fn: 'close', number })
      open = null
    },
  }
}

describe('reconcileStatusAlert', () => {
  it('creates ONE issue carrying the hidden marker when alerting and none is open', async () => {
    const issues = fakeIssues(null)
    const res = await reconcileStatusAlert(alerting401(), issues)

    expect(res).toMatchObject({ action: 'created' })
    expect(issues.calls.filter((c) => c.fn === 'create')).toHaveLength(1)
    const created = issues.calls.find((c) => c.fn === 'create')
    expect(created.body).toContain(ALERT_MARKER)
    expect(created.body).toContain('githubOAuth')
    expect(created.body).toContain('HTTP 401')
    expect(created.body).toMatch(/high.?signal/i)
    // never leaks tokens/secrets/headers — only normalized error fields appear
    expect(created.body).not.toMatch(/token|secret|authorization|bearer/i)
  })

  it('updates (comments on) the existing issue instead of creating a duplicate', async () => {
    const issues = fakeIssues({ number: 7, body: `existing\n${ALERT_MARKER}` })
    const res = await reconcileStatusAlert(alerting401(), issues)

    expect(res).toMatchObject({ action: 'updated', issue: 7 })
    expect(issues.calls.some((c) => c.fn === 'create')).toBe(false)
    const comment = issues.calls.find((c) => c.fn === 'comment')
    expect(comment.number).toBe(7)
    expect(comment.body).toMatch(/still failing/i)
    expect(comment.body).toMatch(/high.?signal/i)
  })

  it('comments without a high-signal note when the continuing failure is not auth/rate-limit', async () => {
    const issues = fakeIssues({ number: 7, body: ALERT_MARKER })
    await reconcileStatusAlert(alerting503(), issues)
    const comment = issues.calls.find((c) => c.fn === 'comment')
    expect(comment.body).not.toMatch(/high.?signal/i)
  })

  it('omits the high-signal callout in a new issue when the failure is not auth/rate-limit', async () => {
    const issues = fakeIssues(null)
    await reconcileStatusAlert(alerting503(), issues)
    const created = issues.calls.find((c) => c.fn === 'create')
    expect(created.body).not.toMatch(/high.?signal/i)
  })

  it('on recovery comments THEN closes the same issue (audit trail before close)', async () => {
    const issues = fakeIssues({ number: 7, body: ALERT_MARKER })
    const res = await reconcileStatusAlert(healthy(), issues)

    expect(res).toMatchObject({ action: 'resolved', issue: 7 })
    const seq = issues.calls.filter((c) => c.fn === 'comment' || c.fn === 'close').map((c) => c.fn)
    expect(seq).toEqual(['comment', 'close'])
    const comment = issues.calls.find((c) => c.fn === 'comment')
    expect(comment.body).toMatch(/recovered/i)
  })

  it('does nothing when healthy and no alert issue is open', async () => {
    const issues = fakeIssues(null)
    const res = await reconcileStatusAlert(healthy(), issues)

    expect(res).toEqual({ action: 'none' })
    expect(issues.calls.filter((c) => c.fn !== 'findOpenAlert')).toHaveLength(0)
  })
})
