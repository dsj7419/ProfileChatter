import { describe, it, expect } from 'vitest'
import { classifySource, buildStatusManifest, renderStepSummary } from './statusManifest.js'
import { ok, fallback, errored } from './sourceResult.js'
import { HttpError } from './httpClient.js'

describe('classifySource', () => {
  it("labels an ok result carrying data as 'live'", () => {
    expect(classifySource(ok({ githubFollowers: '48' }))).toBe('live')
  })

  it("labels an ok result with an empty value (intentional skip) as 'skip'", () => {
    expect(classifySource(ok({}))).toBe('skip')
  })

  it("labels an ok result with no value at all as 'skip'", () => {
    expect(classifySource(ok())).toBe('skip')
  })

  it("labels a fallback result as 'fallback'", () => {
    expect(classifySource(fallback({ x: 1 }, new HttpError(401, 'Unauthorized')))).toBe('fallback')
  })

  it("labels an errored result as 'error'", () => {
    expect(classifySource(errored(new Error('boom')))).toBe('error')
  })

  it("treats a missing or malformed result defensively as 'error'", () => {
    expect(classifySource(null)).toBe('error')
    expect(classifySource({ status: 'weird' })).toBe('error')
  })
})

// Statuses as DataService records them after enrichment: classification is derived
// once (at capture, where the value exists) and the raw value is never carried here.
const statusEntry = (over) => ({
  source: 'github',
  status: 'ok',
  classification: 'live',
  error: null,
  fetchedAt: 10,
  ...over,
})

const MIXED = [
  statusEntry({ source: 'github', status: 'ok', classification: 'live', error: null }),
  statusEntry({ source: 'weather', status: 'ok', classification: 'skip', error: null }),
  statusEntry({
    source: 'githubOAuth',
    status: 'fallback',
    classification: 'fallback',
    error: { message: 'Unauthorized', status: 401 },
  }),
  statusEntry({
    source: 'wakatime',
    status: 'error',
    classification: 'error',
    error: { message: 'Service Unavailable', status: 503 },
  }),
  statusEntry({
    source: 'codestats',
    status: 'fallback',
    classification: 'fallback',
    error: { message: 'network down' }, // transient, no HTTP status
  }),
]

describe('buildStatusManifest', () => {
  it('stamps generatedAt and summarizes classification counts', () => {
    const m = buildStatusManifest(MIXED, { generatedAt: 123 })
    expect(m.generatedAt).toBe(123)
    expect(m.summary).toMatchObject({ total: 5, live: 1, skip: 1, fallback: 2, error: 1 })
  })

  it('flags 401/403/429 failures as high-signal auth/rate-limit', () => {
    const m = buildStatusManifest(MIXED, { generatedAt: 123 })
    expect(m.sources.find((s) => s.source === 'githubOAuth').highSignal).toBe(true)
    expect(m.summary.highSignal).toBe(1)
  })

  it('does not flag a non-auth failure (503) or a status-less failure as high-signal', () => {
    const m = buildStatusManifest(MIXED, { generatedAt: 123 })
    expect(m.sources.find((s) => s.source === 'wakatime').highSignal).toBe(false)
    expect(m.sources.find((s) => s.source === 'codestats').highSignal).toBe(false)
  })

  it('alerts when any configured source failed (fallback/error)', () => {
    const m = buildStatusManifest(MIXED, { generatedAt: 123 })
    expect(m.summary.alerting).toBe(true)
  })

  it('does not alert when only live and skip sources are present', () => {
    const clean = [
      statusEntry({ source: 'github', classification: 'live' }),
      statusEntry({ source: 'weather', classification: 'skip', error: null }),
    ]
    const m = buildStatusManifest(clean, { generatedAt: 123 })
    expect(m.summary.alerting).toBe(false)
    expect(m.summary).toMatchObject({ total: 2, live: 1, skip: 1, fallback: 0, error: 0 })
  })

  it('publishes only normalized errors per source — no raw values, safe to commit/upload', () => {
    const m = buildStatusManifest(MIXED, { generatedAt: 123 })
    expect(m.sources.find((s) => s.source === 'githubOAuth')).toEqual({
      source: 'githubOAuth',
      classification: 'fallback',
      status: 'fallback',
      highSignal: true,
      error: { message: 'Unauthorized', status: 401 },
    })
    expect(m.sources.find((s) => s.source === 'github')).toEqual({
      source: 'github',
      classification: 'live',
      status: 'ok',
      highSignal: false,
      error: null,
    })
  })
})

describe('renderStepSummary (GitHub Actions markdown)', () => {
  it('lists every source with its classification', () => {
    const md = renderStepSummary(buildStatusManifest(MIXED, { generatedAt: 123 }))
    for (const name of ['github', 'weather', 'githubOAuth', 'wakatime', 'codestats']) {
      expect(md).toContain(name)
    }
    expect(md).toMatch(/skip/i)
    expect(md).toMatch(/fallback/i)
  })

  it('surfaces high-signal auth/rate-limit failures with their HTTP status', () => {
    const md = renderStepSummary(buildStatusManifest(MIXED, { generatedAt: 123 }))
    expect(md).toContain('HTTP 401')
    expect(md).toMatch(/high.?signal/i)
  })

  it('shows the status-less failure by its message, not a phantom HTTP code', () => {
    const md = renderStepSummary(buildStatusManifest(MIXED, { generatedAt: 123 }))
    expect(md).toContain('network down')
  })

  it('reports a configured failure but omits the high-signal note when none are auth/rate-limit', () => {
    const only503 = [
      statusEntry({ source: 'github', classification: 'live' }),
      statusEntry({
        source: 'wakatime',
        status: 'error',
        classification: 'error',
        error: { message: 'Service Unavailable', status: 503 },
      }),
    ]
    const md = renderStepSummary(buildStatusManifest(only503, { generatedAt: 1 }))
    expect(md).toMatch(/configured source\(s\) failing/i)
    expect(md).not.toMatch(/high.?signal/i)
  })

  it('states clearly when all configured sources are healthy', () => {
    const clean = [statusEntry({ source: 'github', classification: 'live' })]
    const md = renderStepSummary(buildStatusManifest(clean, { generatedAt: 1 }))
    expect(md).toMatch(/no .*alert|healthy/i)
  })
})
