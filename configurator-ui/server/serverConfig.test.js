import { describe, it, expect } from 'vitest'
import { resolveBindHost, isExternalBind, isDebugEndpointEnabled } from './serverConfig.js'

describe('preview server bind-host policy (security)', () => {
  it('defaults to loopback (127.0.0.1) when no host env is set', () => {
    expect(resolveBindHost({})).toBe('127.0.0.1')
  })

  it('does NOT resolve to an all-interfaces bind by default', () => {
    expect(isExternalBind(resolveBindHost({}))).toBe(false)
  })

  it('binds all interfaces only when external access is explicitly opted in', () => {
    expect(resolveBindHost({ PREVIEW_ALLOW_EXTERNAL: 'true' })).toBe('0.0.0.0')
  })

  it('honors an explicit custom host', () => {
    expect(resolveBindHost({ PREVIEW_SERVER_HOST: '192.168.1.50' })).toBe('192.168.1.50')
  })

  it('ignores a blank PREVIEW_SERVER_HOST and stays loopback', () => {
    expect(resolveBindHost({ PREVIEW_SERVER_HOST: '   ' })).toBe('127.0.0.1')
  })
})

describe('isExternalBind classifies LAN-reachable hosts', () => {
  it('treats 0.0.0.0, ::, and a specific LAN IP as external', () => {
    expect(isExternalBind('0.0.0.0')).toBe(true)
    expect(isExternalBind('::')).toBe(true)
    expect(isExternalBind('192.168.1.50')).toBe(true)
  })

  it('treats loopback hosts as not external', () => {
    expect(isExternalBind('127.0.0.1')).toBe(false)
    expect(isExternalBind('::1')).toBe(false)
    expect(isExternalBind('localhost')).toBe(false)
  })

  it('treats an empty/undefined host as external (binds everything)', () => {
    expect(isExternalBind('')).toBe(true)
    expect(isExternalBind(undefined)).toBe(true)
  })
})

describe('debug endpoint gating (security)', () => {
  it('disables /debug-cookies by default', () => {
    expect(isDebugEndpointEnabled({})).toBe(false)
  })

  it('enables debug endpoints only when explicitly turned on', () => {
    expect(isDebugEndpointEnabled({ PREVIEW_ENABLE_DEBUG: 'true' })).toBe(true)
  })
})
