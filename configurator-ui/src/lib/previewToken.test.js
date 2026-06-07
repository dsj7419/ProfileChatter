import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPreviewToken, __resetPreviewTokenCache } from './previewToken.js'

beforeEach(() => {
  __resetPreviewTokenCache()
})

describe('getPreviewToken', () => {
  it('fetches the token from the preview server /preview-token endpoint', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ token: 'tok123' }) })
    vi.stubGlobal('fetch', fetchMock)

    const token = await getPreviewToken('http://localhost:3001')

    expect(token).toBe('tok123')
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/preview-token')
  })

  it('caches the token so repeated calls make a single request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'tok' }) })
    vi.stubGlobal('fetch', fetchMock)

    await getPreviewToken('http://localhost:3001')
    await getPreviewToken('http://localhost:3001')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns empty string on failure without poisoning the cache (retries next time)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await getPreviewToken('http://localhost:3001')).toBe('')

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'later' }) })
    )
    expect(await getPreviewToken('http://localhost:3001')).toBe('later')
  })
})
