/**
 * previewToken.js
 *
 * Fetches and caches the preview server's per-process session token so the
 * configurator can attach it (as `X-Preview-Token`) to state-changing requests.
 * The server only issues the token to loopback callers, so it never leaves the
 * developer's machine.
 */

/** @type {Map<string, Promise<string>>} */
const tokenCache = new Map()

/**
 * Get the preview-server session token (cached per server URL). Resolves to ''
 * if the token can't be obtained; a failed attempt is not cached, so a later
 * call retries.
 * @param {string} previewServer - e.g. "http://localhost:3001"
 * @returns {Promise<string>}
 */
export function getPreviewToken(previewServer) {
  if (!tokenCache.has(previewServer)) {
    const pending = fetch(`${previewServer}/preview-token`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (data && data.token ? data.token : ''))
      .catch(() => '')
      .then((token) => {
        if (!token) tokenCache.delete(previewServer)
        return token
      })
    tokenCache.set(previewServer, pending)
  }
  return tokenCache.get(previewServer)
}

/** Test-only: clear the cached tokens. */
export function __resetPreviewTokenCache() {
  tokenCache.clear()
}
