/**
 * serverSecurity.js
 *
 * Pure, side-effect-free request-security helpers for the preview server:
 * CORS origin policy, cross-origin (CSRF) enforcement for state-changing
 * endpoints, request-body validation, and a GitHub write target allow-list.
 *
 * Kept separate from previewServer.js so the security decisions can be
 * unit-tested without an HTTP server.
 */

import { isValidPreviewToken } from './serverAuth.js'

const DEFAULT_ALLOWED_ORIGINS = ['http://127.0.0.1:5173', 'http://localhost:5173']

/**
 * The origins permitted to call the preview server (the local configurator).
 * Overridable via PREVIEW_ALLOWED_ORIGINS (comma-separated).
 * @param {Record<string, string | undefined>} [env]
 * @returns {string[]}
 */
export function getAllowedOrigins(env = {}) {
  const override = env.PREVIEW_ALLOWED_ORIGINS
  if (typeof override === 'string' && override.trim() !== '') {
    return override
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  }
  return [...DEFAULT_ALLOWED_ORIGINS]
}

/**
 * @param {string | undefined | null} origin
 * @param {string[]} allowedOrigins
 * @returns {boolean}
 */
export function isOriginAllowed(origin, allowedOrigins) {
  return typeof origin === 'string' && allowedOrigins.includes(origin)
}

/**
 * The value to send in Access-Control-Allow-Origin. Echoes the request origin
 * when allowed; otherwise falls back to the primary allowed origin so a foreign
 * origin can never read responses. Never returns '*'.
 * @param {string | undefined | null} requestOrigin
 * @param {string[]} allowedOrigins
 * @returns {string}
 */
export function resolveCorsOrigin(requestOrigin, allowedOrigins) {
  return isOriginAllowed(requestOrigin, allowedOrigins) ? requestOrigin : allowedOrigins[0]
}

function originOf(url) {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

/**
 * CSRF guard for state-changing endpoints. Verifies Origin (or Referer) when
 * present; a request with neither (non-browser/local tooling on loopback) is
 * allowed. A browser always attaches Origin to cross-origin writes, so a
 * foreign page is always rejected.
 * @param {{ origin?: string, referer?: string }} headers
 * @param {string[]} allowedOrigins
 * @returns {{ allowed: boolean, reason: string }}
 */
export function isStateChangingRequestAllowed(headers = {}, allowedOrigins) {
  const origin = headers.origin
  if (typeof origin === 'string' && origin !== '') {
    return isOriginAllowed(origin, allowedOrigins)
      ? { allowed: true, reason: 'origin allowed' }
      : { allowed: false, reason: `origin not allowed: ${origin}` }
  }

  const referer = headers.referer
  if (typeof referer === 'string' && referer !== '') {
    const refOrigin = originOf(referer)
    return isOriginAllowed(refOrigin, allowedOrigins)
      ? { allowed: true, reason: 'referer allowed' }
      : { allowed: false, reason: `referer not allowed: ${referer}` }
  }

  return { allowed: true, reason: 'no origin/referer (non-browser)' }
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Validate a ProfileChatter config payload (used by /generate-preview and
 * /api/save-local-config) before any side effect.
 * @param {unknown} body
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateConfigPayload(body) {
  if (!isPlainObject(body)) {
    return { valid: false, error: 'Body must be a JSON object' }
  }
  if (!body.profile || !body.activeTheme || !Array.isArray(body.chatMessages)) {
    return {
      valid: false,
      error: 'Config must include profile, activeTheme, and a chatMessages array',
    }
  }
  return { valid: true }
}

const REPO_FULL_NAME = /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/
const SAFE_BRANCH = /^[A-Za-z0-9._/-]+$/

/**
 * Allow-list for GitHub write targets. Constrains writes to a JSON config file
 * (not under .github/) in a well-formed owner/repo on a sane branch — blocking
 * path traversal, absolute paths, and CI-workflow injection.
 * @param {{ repoFullName?: string, filePath?: string, branch?: string }} target
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateGithubSaveTarget(target = {}) {
  const { repoFullName, filePath, branch = 'main' } = target

  if (typeof repoFullName !== 'string' || !REPO_FULL_NAME.test(repoFullName)) {
    return { valid: false, error: 'repoFullName must be of the form "owner/repo"' }
  }

  if (typeof branch !== 'string' || branch.includes('..') || !SAFE_BRANCH.test(branch)) {
    return { valid: false, error: 'Invalid branch ref' }
  }

  if (typeof filePath !== 'string' || filePath === '') {
    return { valid: false, error: 'filePath is required' }
  }
  if (
    filePath.includes('..') ||
    filePath.includes('\\') ||
    filePath.includes('\0') ||
    filePath.startsWith('/') ||
    /^[A-Za-z]:/.test(filePath)
  ) {
    return { valid: false, error: 'filePath must be a safe relative path' }
  }
  const segments = filePath.split('/')
  if (segments.includes('.github')) {
    return { valid: false, error: 'Writes under .github/ are not allowed' }
  }
  if (!filePath.toLowerCase().endsWith('.json')) {
    return { valid: false, error: 'Only .json config files may be written' }
  }

  return { valid: true }
}

/**
 * Authorize a state-changing request: cross-origin check first (403), then a
 * valid session token (401). Both must pass.
 * @param {Record<string, string | undefined>} headers
 * @param {{ expectedToken: string, allowedOrigins: string[] }} ctx
 * @returns {{ allowed: boolean, status: number, error?: string }}
 */
export function authorizeStateChange(headers = {}, { expectedToken, allowedOrigins }) {
  const origin = isStateChangingRequestAllowed(headers, allowedOrigins)
  if (!origin.allowed) {
    return { allowed: false, status: 403, error: 'Forbidden: cross-origin request rejected' }
  }
  if (!isValidPreviewToken(headers['x-preview-token'], expectedToken)) {
    return { allowed: false, status: 401, error: 'Unauthorized: missing or invalid preview token' }
  }
  return { allowed: true, status: 200 }
}
