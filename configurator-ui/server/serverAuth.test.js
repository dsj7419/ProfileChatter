import { describe, it, expect } from 'vitest'
import { generateSessionToken, isLoopbackHost, isValidPreviewToken } from './serverAuth.js'

describe('generateSessionToken', () => {
  it('returns a 64-char hex token', () => {
    expect(generateSessionToken()).toMatch(/^[0-9a-f]{64}$/)
  })
  it('returns a different token each call', () => {
    expect(generateSessionToken()).not.toBe(generateSessionToken())
  })
})

describe('isLoopbackHost (gate for /preview-token)', () => {
  it('accepts loopback hosts with a port', () => {
    expect(isLoopbackHost('127.0.0.1:3001')).toBe(true)
    expect(isLoopbackHost('localhost:5173')).toBe(true)
    expect(isLoopbackHost('[::1]:3001')).toBe(true)
  })
  it('accepts loopback hosts without a port', () => {
    expect(isLoopbackHost('127.0.0.1')).toBe(true)
    expect(isLoopbackHost('localhost')).toBe(true)
  })
  it('rejects LAN IPs and external hosts', () => {
    expect(isLoopbackHost('192.168.1.50:3001')).toBe(false)
    expect(isLoopbackHost('evil.example')).toBe(false)
    expect(isLoopbackHost('10.0.0.5:3001')).toBe(false)
  })
  it('rejects a missing/empty Host header', () => {
    expect(isLoopbackHost(undefined)).toBe(false)
    expect(isLoopbackHost('')).toBe(false)
  })
})

describe('isValidPreviewToken', () => {
  const token = 'a'.repeat(64)
  it('accepts a matching token', () => {
    expect(isValidPreviewToken(token, token)).toBe(true)
  })
  it('rejects a mismatched token', () => {
    expect(isValidPreviewToken('b'.repeat(64), token)).toBe(false)
  })
  it('rejects missing/empty provided token', () => {
    expect(isValidPreviewToken(undefined, token)).toBe(false)
    expect(isValidPreviewToken('', token)).toBe(false)
  })
  it('rejects when no expected token is configured', () => {
    expect(isValidPreviewToken(token, '')).toBe(false)
    expect(isValidPreviewToken(token, undefined)).toBe(false)
  })
})
