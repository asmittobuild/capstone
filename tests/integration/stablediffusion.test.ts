import { describe, it, expect, vi, afterEach } from 'vitest'
import { isAvailable, generateImage } from '../../src/services/stablediffusion'

// ── T064: SDXL Client ─────────────────────────────────────────────────

describe('isAvailable', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('returns true when health endpoint returns ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })
    expect(await isAvailable()).toBe(true)
  })

  it('returns false when health endpoint returns non-ok', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })
    expect(await isAvailable()).toBe(false)
  })

  it('returns false on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('timeout'))
    expect(await isAvailable()).toBe(false)
  })
})

describe('generateImage', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('sends correct parameters and returns base64 image', async () => {
    const mockData = { image: 'base64data==', seed: 42 }
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    })
    globalThis.fetch = mockFetch

    const result = await generateImage('Pikazard fusion')
    expect(result).toEqual(mockData)

    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/generate')
    expect(opts.method).toBe('POST')
    const body = JSON.parse(opts.body)
    expect(body.prompt).toContain('Pikazard fusion')
    expect(body.width).toBe(1024)
    expect(body.height).toBe(1024)
  })

  it('returns null on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })
    expect(await generateImage('test')).toBeNull()
  })

  it('returns null on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('timeout'))
    expect(await generateImage('test')).toBeNull()
  })
})
