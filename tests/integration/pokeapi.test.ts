import { describe, it, expect, vi, afterEach } from 'vitest'
import { getFlavorText } from '../../src/services/pokeapi'

// ── T063: PokeAPI Client ──────────────────────────────────────────────

describe('getFlavorText', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('extracts English flavor text from the last entry', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        flavor_text_entries: [
          { flavor_text: 'Old text\nwith newlines', language: { name: 'en' } },
          { flavor_text: 'Neuester Text', language: { name: 'de' } },
          { flavor_text: 'Latest text\fwith form feeds', language: { name: 'en' } },
        ],
      }),
    })

    // Use a unique ID to avoid cache from other tests
    const result = await getFlavorText(9999)
    expect(result).toBe('Latest text with form feeds')
  })

  it('filters to English-only entries', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        flavor_text_entries: [
          { flavor_text: 'Japanese text', language: { name: 'ja' } },
          { flavor_text: 'English text', language: { name: 'en' } },
        ],
      }),
    })

    const result = await getFlavorText(9998)
    expect(result).toBe('English text')
  })

  it('returns cached value on second call', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        flavor_text_entries: [
          { flavor_text: 'Cached text', language: { name: 'en' } },
        ],
      }),
    })
    globalThis.fetch = mockFetch

    const id = 9997
    await getFlavorText(id)
    await getFlavorText(id)
    // Only one fetch because second call uses cache
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('returns null on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await getFlavorText(9996)
    expect(result).toBeNull()
  })

  it('returns null on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false })

    const result = await getFlavorText(9995)
    expect(result).toBeNull()
  })
})
