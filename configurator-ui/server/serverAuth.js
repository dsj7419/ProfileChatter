/**
 * serverAuth.js
 *
 * Per-process session-token primitives for the preview server. The token gates
 * state-changing endpoints; it is handed to the local configurator SPA via a
 * loopback-only /preview-token endpoint (see previewServer.js) so that, even on
 * the opt-in external-bind path, a LAN caller cannot obtain or forge it.
 *
 * Pure/deterministic helpers are unit-tested; token generation uses the CSPRNG.
 */

import { randomBytes, timingSafeEqual } from 'node:crypto'

const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost'])

/**
 * Mint a fresh, unguessable session token (CSPRNG, 32 bytes → 64 hex chars).
 * @returns {string}
 */
export function generateSessionToken() {
  return randomBytes(32).toString('hex')
}

/**
 * Whether an HTTP `Host` header refers to a loopback interface. Used to gate
 * /preview-token: the SPA reaches the server via 127.0.0.1, a LAN attacker via
 * the machine's routable IP (rejected).
 * @param {string | undefined | null} hostHeader - e.g. "127.0.0.1:3001"
 * @returns {boolean}
 */
export function isLoopbackHost(hostHeader) {
  if (typeof hostHeader !== 'string' || hostHeader === '') {
    return false
  }
  try {
    let { hostname } = new URL(`http://${hostHeader}`)
    if (hostname.startsWith('[') && hostname.endsWith(']')) {
      hostname = hostname.slice(1, -1) // unwrap IPv6 literal, e.g. [::1] -> ::1
    }
    return LOOPBACK_HOSTS.has(hostname)
  } catch {
    return false
  }
}

/**
 * Constant-time comparison of a provided token against the expected one.
 * @param {string | undefined | null} provided
 * @param {string | undefined | null} expected
 * @returns {boolean}
 */
export function isValidPreviewToken(provided, expected) {
  if (typeof provided !== 'string' || provided === '') return false
  if (typeof expected !== 'string' || expected === '') return false

  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
