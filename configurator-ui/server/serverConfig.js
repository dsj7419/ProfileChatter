/**
 * serverConfig.js
 *
 * Pure, side-effect-free helpers for the preview server's network-exposure
 * policy. Kept separate from previewServer.js so the bind/security decisions
 * can be unit-tested without starting an HTTP server.
 *
 * Security note: the preview server exposes unauthenticated, state-changing
 * endpoints (including GitHub writes using the developer's stored token), so it
 * must bind to loopback by default and only reach the LAN on explicit opt-in.
 */

const TRUTHY = new Set(['1', 'true', 'yes', 'on'])
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', 'localhost'])

function isTruthy(value) {
  return typeof value === 'string' && TRUTHY.has(value.trim().toLowerCase())
}

/**
 * Decide which host the preview server binds to.
 * Defaults to loopback (127.0.0.1) so the server is NOT reachable from the LAN.
 * External binding must be explicitly opted into.
 *
 * @param {Record<string, string | undefined>} [env] - environment variables
 * @returns {string} the host to pass to server.listen()
 */
export function resolveBindHost(env = {}) {
  const explicitHost = env.PREVIEW_SERVER_HOST
  if (typeof explicitHost === 'string' && explicitHost.trim() !== '') {
    return explicitHost.trim()
  }
  if (isTruthy(env.PREVIEW_ALLOW_EXTERNAL)) {
    return '0.0.0.0'
  }
  return '127.0.0.1'
}

/**
 * Whether a host represents a LAN-reachable (non-loopback) bind. Used to emit a
 * loud security warning when the server is intentionally exposed.
 *
 * @param {string | undefined | null} host
 * @returns {boolean}
 */
export function isExternalBind(host) {
  if (host == null || host === '') {
    return true // empty host binds every interface
  }
  return !LOOPBACK_HOSTS.has(host)
}

/**
 * Whether debug endpoints (e.g. /debug-cookies) are enabled. Disabled by
 * default; opt-in only.
 *
 * @param {Record<string, string | undefined>} [env]
 * @returns {boolean}
 */
export function isDebugEndpointEnabled(env = {}) {
  return isTruthy(env.PREVIEW_ENABLE_DEBUG)
}
