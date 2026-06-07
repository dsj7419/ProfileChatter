import { describe, it, expect, vi } from 'vitest'
import { createGitHubIssues } from './githubIssues.js'

const res = (body, { ok = true, status = 200 } = {}) => ({ ok, status, json: async () => body })
const make = (fetchImpl) => createGitHubIssues({ repo: 'me/repo', token: 'T', fetchImpl })

describe('createGitHubIssues adapter', () => {
  it('findOpenAlert returns the open issue whose body holds the marker (PRs and body-less issues ignored)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      res([
        { number: 1, body: 'unrelated' },
        { number: 2, body: `x MARKER y`, pull_request: {} }, // a PR — ignore
        { number: 4, body: null }, // body-less — ignore
        { number: 3, body: 'has MARKER here' },
      ])
    )
    const found = await make(fetchImpl).findOpenAlert('MARKER')
    expect(found).toEqual({ number: 3, body: 'has MARKER here' })
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toContain('/repos/me/repo/issues')
    expect(url).toContain('state=open')
    expect(opts.headers.Authorization).toBe('Bearer T')
  })

  it('findOpenAlert returns null when no open issue carries the marker', async () => {
    expect(
      await make(vi.fn().mockResolvedValue(res([{ number: 1, body: 'nope' }]))).findOpenAlert(
        'MARKER'
      )
    ).toBeNull()
  })

  it('create POSTs title/body and returns the new number', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res({ number: 42 }, { status: 201 }))
    const out = await make(fetchImpl).create({ title: 'T', body: 'B' })
    expect(out).toEqual({ number: 42 })
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.github.com/repos/me/repo/issues')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ title: 'T', body: 'B' })
  })

  it('comment POSTs to the issue comments endpoint', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res({}, { status: 201 }))
    await make(fetchImpl).comment(7, 'hi')
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.github.com/repos/me/repo/issues/7/comments')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toEqual({ body: 'hi' })
  })

  it('close PATCHes the issue state to closed', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(res({}, { status: 200 }))
    await make(fetchImpl).close(7)
    const [url, opts] = fetchImpl.mock.calls[0]
    expect(url).toBe('https://api.github.com/repos/me/repo/issues/7')
    expect(opts.method).toBe('PATCH')
    expect(JSON.parse(opts.body)).toEqual({ state: 'closed' })
  })

  it('throws with the HTTP status on a failed call (so the workflow step fails loudly)', async () => {
    await expect(
      make(vi.fn().mockResolvedValue(res({}, { ok: false, status: 403 }))).create({
        title: 'T',
        body: 'B',
      })
    ).rejects.toThrow(/403/)
  })
})
