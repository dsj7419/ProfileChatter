/**
 * httpClient.js
 *
 * Shared outbound HTTP helper for data sources. Provides the reliability
 * primitives the per-source code previously lacked:
 *   - per-attempt timeout via AbortSignal.timeout
 *   - bounded retry with exponential backoff for transient failures
 *   - explicit fail-fast for auth/config errors (4xx) — never retried
 *   - normalized errors (HttpError) safe to surface in logs/status
 *
 * `fetchImpl` and `sleep` are injectable so the behavior is unit-testable
 * without real network or real timers.
 */

export class HttpError extends Error {
  constructor(status, message, { retryable = false, cause } = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.retryable = retryable
    if (cause !== undefined) this.cause = cause
  }
}

/** Transient statuses worth retrying. Auth/config 4xx are deliberately excluded. */
export function isRetryableStatus(status) {
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599)
}

function normalizeMessage(err) {
  if (err && typeof err.message === 'string' && err.message) return err.message
  return String(err)
}

/**
 * Fetch a URL and parse JSON, with timeout + bounded retry/backoff.
 * Throws HttpError on failure (after exhausting retries, or immediately for
 * non-retryable statuses).
 *
 * @param {string} url
 * @param {object} [opts]
 * @param {Record<string,string>} [opts.headers]
 * @param {number} [opts.timeoutMs=10000]
 * @param {number} [opts.retries=2]      number of retries AFTER the first attempt
 * @param {number} [opts.backoffMs=300]  base backoff; grows 1x, 2x, 4x…
 * @param {typeof fetch} [opts.fetchImpl]
 * @param {(ms:number)=>Promise<void>} [opts.sleep]
 * @returns {Promise<any>}
 */
export async function fetchJson(url, opts = {}) {
  const {
    headers = {},
    timeoutMs = 10000,
    retries = 2,
    backoffMs = 300,
    fetchImpl = typeof fetch === 'function' ? fetch : undefined,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = opts

  if (typeof fetchImpl !== 'function') {
    throw new HttpError(0, 'No fetch implementation available', { retryable: false })
  }

  let attempt = 0
  for (;;) {
    try {
      const res = await fetchImpl(url, { headers, signal: AbortSignal.timeout(timeoutMs) })

      if (res.ok) {
        return await res.json()
      }

      const retryable = isRetryableStatus(res.status)
      if (retryable && attempt < retries) {
        attempt += 1
        await sleep(backoffMs * 2 ** (attempt - 1))
        continue
      }
      throw new HttpError(
        res.status,
        `HTTP ${res.status}${res.statusText ? ` ${res.statusText}` : ''}`.trim(),
        { retryable }
      )
    } catch (err) {
      // Non-retryable or exhausted status errors are final.
      if (err instanceof HttpError) throw err

      // Network/timeout (incl. AbortSignal.timeout → TimeoutError) — retryable.
      if (attempt < retries) {
        attempt += 1
        await sleep(backoffMs * 2 ** (attempt - 1))
        continue
      }
      throw new HttpError(0, normalizeMessage(err), { retryable: true, cause: err })
    }
  }
}
