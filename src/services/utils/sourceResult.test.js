import { describe, it, expect } from 'vitest'
import { ok, fallback, errored, isOk, normalizeError } from './sourceResult.js'
import { HttpError } from './httpClient.js'

describe('sourceResult constructors', () => {
  it('ok() carries the live value and a fetchedAt timestamp', () => {
    const r = ok({ a: 1 })
    expect(r.status).toBe('ok')
    expect(r.value).toEqual({ a: 1 })
    expect(typeof r.fetchedAt).toBe('number')
  })

  it('fallback() carries default value AND the normalized error (distinguishable from ok)', () => {
    const r = fallback({ a: 0 }, new HttpError(503, 'down', { retryable: true }))
    expect(r.status).toBe('fallback')
    expect(r.value).toEqual({ a: 0 })
    expect(r.error).toEqual({ message: 'down', status: 503, retryable: true })
  })

  it('errored() carries no value, only the normalized error', () => {
    const r = errored(new Error('boom'))
    expect(r.status).toBe('error')
    expect(r.value).toBeUndefined()
    expect(r.error.message).toBe('boom')
  })
})

describe('isOk', () => {
  it('is true only for ok results', () => {
    expect(isOk(ok({}))).toBe(true)
    expect(isOk(fallback({}, new Error('x')))).toBe(false)
    expect(isOk(errored(new Error('x')))).toBe(false)
    expect(isOk(null)).toBe(false)
  })
})

describe('normalizeError (log/status-safe)', () => {
  it('extracts message/status/retryable from an HttpError', () => {
    expect(normalizeError(new HttpError(401, 'Unauthorized', { retryable: false }))).toEqual({
      message: 'Unauthorized',
      status: 401,
      retryable: false,
    })
  })
  it('handles strings and null', () => {
    expect(normalizeError('oops')).toEqual({ message: 'oops' })
    expect(normalizeError(null)).toEqual({ message: 'Unknown error' })
  })
  it('does not leak a stack trace', () => {
    expect(normalizeError(new Error('x')).stack).toBeUndefined()
  })
})
