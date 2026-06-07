import { describe, it, expect } from 'vitest'
import {
  getAllowedOrigins,
  isOriginAllowed,
  resolveCorsOrigin,
  isStateChangingRequestAllowed,
  validateConfigPayload,
  validateGithubSaveTarget,
  authorizeStateChange,
} from './serverSecurity.js'

describe('getAllowedOrigins', () => {
  it('defaults to the loopback configurator origins', () => {
    const origins = getAllowedOrigins({})
    expect(origins).toContain('http://127.0.0.1:5173')
    expect(origins).toContain('http://localhost:5173')
  })

  it('accepts a comma-separated override via env', () => {
    expect(getAllowedOrigins({ PREVIEW_ALLOWED_ORIGINS: 'http://localhost:4321' })).toEqual([
      'http://localhost:4321',
    ])
  })
})

describe('isOriginAllowed', () => {
  const allowed = ['http://127.0.0.1:5173']
  it('accepts an exact allowed origin', () => {
    expect(isOriginAllowed('http://127.0.0.1:5173', allowed)).toBe(true)
  })
  it('rejects a foreign origin', () => {
    expect(isOriginAllowed('http://evil.example', allowed)).toBe(false)
  })
})

describe('resolveCorsOrigin echoes only allowed origins (never *)', () => {
  const allowed = ['http://127.0.0.1:5173']
  it('echoes the request origin when allowed', () => {
    expect(resolveCorsOrigin('http://127.0.0.1:5173', allowed)).toBe('http://127.0.0.1:5173')
  })
  it('falls back to the primary allowed origin for foreign or absent origins', () => {
    expect(resolveCorsOrigin('http://evil.example', allowed)).toBe('http://127.0.0.1:5173')
    expect(resolveCorsOrigin(undefined, allowed)).toBe('http://127.0.0.1:5173')
  })
})

describe('isStateChangingRequestAllowed (CSRF guard)', () => {
  const allowed = ['http://127.0.0.1:5173']
  it('allows requests from the configurator origin', () => {
    expect(
      isStateChangingRequestAllowed({ origin: 'http://127.0.0.1:5173' }, allowed).allowed
    ).toBe(true)
  })
  it('blocks a foreign Origin', () => {
    expect(isStateChangingRequestAllowed({ origin: 'http://evil.example' }, allowed).allowed).toBe(
      false
    )
  })
  it('blocks a foreign Referer when no Origin is present', () => {
    expect(
      isStateChangingRequestAllowed({ referer: 'http://evil.example/page' }, allowed).allowed
    ).toBe(false)
  })
  it('allows a non-browser request with neither Origin nor Referer (loopback tooling)', () => {
    expect(isStateChangingRequestAllowed({}, allowed).allowed).toBe(true)
  })
})

describe('validateConfigPayload', () => {
  const good = { profile: {}, activeTheme: 'dark', chatMessages: [] }
  it('accepts a well-formed config', () => {
    expect(validateConfigPayload(good).valid).toBe(true)
  })
  it('rejects non-objects', () => {
    expect(validateConfigPayload(null).valid).toBe(false)
    expect(validateConfigPayload('x').valid).toBe(false)
    expect(validateConfigPayload([]).valid).toBe(false)
  })
  it('rejects missing required fields', () => {
    expect(validateConfigPayload({ profile: {}, activeTheme: 'dark' }).valid).toBe(false)
    expect(validateConfigPayload({ activeTheme: 'dark', chatMessages: [] }).valid).toBe(false)
    expect(validateConfigPayload({ profile: {}, chatMessages: [] }).valid).toBe(false)
  })
})

describe('validateGithubSaveTarget (repo/path allow-list)', () => {
  const ok = {
    repoFullName: 'dsj7419/ProfileChatter',
    filePath: 'profileChatterConfig.json',
    branch: 'main',
  }
  it('accepts the default config save target', () => {
    expect(validateGithubSaveTarget(ok).valid).toBe(true)
  })
  it('rejects path traversal', () => {
    expect(validateGithubSaveTarget({ ...ok, filePath: '../../etc/passwd.json' }).valid).toBe(false)
  })
  it('rejects absolute paths and backslashes', () => {
    expect(validateGithubSaveTarget({ ...ok, filePath: '/etc/x.json' }).valid).toBe(false)
    expect(validateGithubSaveTarget({ ...ok, filePath: 'a\\b.json' }).valid).toBe(false)
  })
  it('rejects non-json files (blocks workflow injection)', () => {
    expect(validateGithubSaveTarget({ ...ok, filePath: '.github/workflows/evil.yml' }).valid).toBe(
      false
    )
  })
  it('rejects writes anywhere under .github/', () => {
    expect(validateGithubSaveTarget({ ...ok, filePath: '.github/config.json' }).valid).toBe(false)
  })
  it('rejects a malformed repo name', () => {
    expect(validateGithubSaveTarget({ ...ok, repoFullName: 'not-a-repo' }).valid).toBe(false)
    expect(validateGithubSaveTarget({ ...ok, repoFullName: 'a/b/c' }).valid).toBe(false)
  })
  it('rejects a dangerous branch ref', () => {
    expect(validateGithubSaveTarget({ ...ok, branch: '../evil' }).valid).toBe(false)
  })
  it('rejects missing required fields', () => {
    expect(validateGithubSaveTarget({ repoFullName: 'a/b' }).valid).toBe(false)
  })
})

describe('authorizeStateChange (origin + token)', () => {
  const allowedOrigins = ['http://127.0.0.1:5173']
  const expectedToken = 'a'.repeat(64)
  const ctx = { expectedToken, allowedOrigins }

  it('allows an allowed origin with a valid token', () => {
    const r = authorizeStateChange(
      { origin: 'http://127.0.0.1:5173', 'x-preview-token': expectedToken },
      ctx
    )
    expect(r.allowed).toBe(true)
  })

  it('allows a no-origin (loopback tooling) request with a valid token', () => {
    expect(authorizeStateChange({ 'x-preview-token': expectedToken }, ctx).allowed).toBe(true)
  })

  it('rejects a foreign origin with 403 before checking the token', () => {
    const r = authorizeStateChange(
      { origin: 'http://evil.example', 'x-preview-token': expectedToken },
      ctx
    )
    expect(r.allowed).toBe(false)
    expect(r.status).toBe(403)
  })

  it('rejects a missing token with 401', () => {
    const r = authorizeStateChange({ origin: 'http://127.0.0.1:5173' }, ctx)
    expect(r.allowed).toBe(false)
    expect(r.status).toBe(401)
  })

  it('rejects an invalid token with 401', () => {
    const r = authorizeStateChange(
      { origin: 'http://127.0.0.1:5173', 'x-preview-token': 'b'.repeat(64) },
      ctx
    )
    expect(r.allowed).toBe(false)
    expect(r.status).toBe(401)
  })
})
