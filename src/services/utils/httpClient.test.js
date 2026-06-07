import { describe, it, expect, vi } from 'vitest'
import { fetchJson, isRetryableStatus } from './httpClient.js'

const okResponse = (body) => ({ ok: true, status: 200, statusText: 'OK', json: async () => body })
const errResponse = (status) => ({ ok: false, status, statusText: '', json: async () => ({}) })
const noSleep = vi.fn().mockResolvedValue(undefined)

describe('isRetryableStatus', () => {
  it('treats 5xx, 429, 408, 425 as retryable', () => {
    for (const s of [408, 425, 429, 500, 502, 503, 504]) expect(isRetryableStatus(s)).toBe(true)
  })
  it('treats auth/config 4xx as NOT retryable', () => {
    for (const s of [400, 401, 403, 404]) expect(isRetryableStatus(s)).toBe(false)
  })
})

describe('fetchJson', () => {
  it('returns parsed JSON on success (single call)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse({ a: 1 }))
    const data = await fetchJson('https://x', { fetchImpl, sleep: noSleep })
    expect(data).toEqual({ a: 1 })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('retries retryable failures with growing backoff, then succeeds', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(errResponse(503))
      .mockResolvedValueOnce(errResponse(503))
      .mockResolvedValueOnce(okResponse({ ok: true }))
    const sleep = vi.fn().mockResolvedValue(undefined)
    const data = await fetchJson('https://x', { fetchImpl, sleep, retries: 2, backoffMs: 10 })
    expect(data).toEqual({ ok: true })
    expect(fetchImpl).toHaveBeenCalledTimes(3)
    expect(sleep).toHaveBeenCalledTimes(2)
    expect(sleep.mock.calls[0][0]).toBe(10) // backoff grows
    expect(sleep.mock.calls[1][0]).toBe(20)
  })

  it('exhausts retries on persistent retryable failure and throws HttpError', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(errResponse(503))
    await expect(
      fetchJson('https://x', { fetchImpl, sleep: noSleep, retries: 2 })
    ).rejects.toMatchObject({ name: 'HttpError', status: 503, retryable: true })
    expect(fetchImpl).toHaveBeenCalledTimes(3) // 1 + 2 retries
  })

  it('does NOT retry an auth error (401) — fails fast', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(errResponse(401))
    const sleep = vi.fn().mockResolvedValue(undefined)
    await expect(fetchJson('https://x', { fetchImpl, sleep, retries: 3 })).rejects.toMatchObject({
      name: 'HttpError',
      status: 401,
      retryable: false,
    })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(sleep).not.toHaveBeenCalled()
  })

  it('does NOT retry a config error (404)', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(errResponse(404))
    await expect(
      fetchJson('https://x', { fetchImpl, sleep: noSleep, retries: 3 })
    ).rejects.toMatchObject({ status: 404, retryable: false })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('retries network/timeout errors then gives up as a retryable HttpError', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network down'))
    await expect(
      fetchJson('https://x', { fetchImpl, sleep: noSleep, retries: 1 })
    ).rejects.toMatchObject({ name: 'HttpError', retryable: true })
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('aborts via AbortSignal timeout when the request hangs', async () => {
    // fetchImpl resolves only when the abort signal fires (simulates a hung request)
    const fetchImpl = (url, { signal }) =>
      new Promise((_, reject) => {
        if (signal.aborted) reject(signal.reason)
        signal.addEventListener('abort', () => reject(signal.reason))
      })
    await expect(
      fetchJson('https://x', { fetchImpl, sleep: noSleep, timeoutMs: 20, retries: 0 })
    ).rejects.toMatchObject({ name: 'HttpError', retryable: true })
  })
})
