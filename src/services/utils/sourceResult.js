/**
 * sourceResult.js
 *
 * Discriminated result type for data sources, so the orchestrator (and PR-5b's
 * status manifest / staleness guard) can tell live data from a quiet fallback —
 * eliminating the "green build with invisible fallback values" failure mode.
 *
 *   { status: 'ok',       value, fetchedAt }
 *   { status: 'fallback', value, error, fetchedAt }   // default value served, but a failure occurred
 *   { status: 'error',    error, fetchedAt }           // no usable value
 */

/**
 * Reduce any thrown value to a small, log/status-safe shape (no stack, no
 * sensitive internals).
 * @param {unknown} err
 * @returns {{ message: string, status?: number, retryable?: boolean }}
 */
export function normalizeError(err) {
  if (err == null) return { message: 'Unknown error' }
  if (typeof err === 'string') return { message: err }
  const out = {
    message: typeof err.message === 'string' && err.message ? err.message : String(err),
  }
  if (typeof err.status === 'number') out.status = err.status
  if (typeof err.retryable === 'boolean') out.retryable = err.retryable
  return out
}

export function ok(value, fetchedAt = Date.now()) {
  return { status: 'ok', value, fetchedAt }
}

export function fallback(value, error, fetchedAt = Date.now()) {
  return { status: 'fallback', value, error: normalizeError(error), fetchedAt }
}

export function errored(error, fetchedAt = Date.now()) {
  return { status: 'error', error: normalizeError(error), fetchedAt }
}

export function isOk(result) {
  return !!result && result.status === 'ok'
}
