import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateFusionText } from '../../src/services/huggingface'

// ── T062: Hugging Face Client ─────────────────────────────────────────

const TOKEN = 'hf_test_token'
const MODEL = 'test-model'

describe('generateFusionText', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.useRealTimers()
  })

  it('sends correct auth header and request body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers(),
      json: async () => ({
        choices: [{ message: { role: 'assistant', content: 'Fusion text' }, finish_reason: 'stop', index: 0 }],
      }),
    })
    globalThis.fetch = mockFetch

    await generateFusionText(TOKEN, MODEL, 'Pikachu', ['Electric'], 'Charizard', ['Fire', 'Flying'])

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/chat/completions')
    expect(opts.headers.Authorization).toBe(`Bearer ${TOKEN}`)
    expect(opts.headers['Content-Type']).toBe('application/json')

    const body = JSON.parse(opts.body)
    expect(body.model).toBe(MODEL)
    expect(body.messages).toHaveLength(2)
    expect(body.messages[1].content).toContain('Pikachu')
    expect(body.messages[1].content).toContain('Charizard')
  })

  it('parses successful response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      headers: new Headers(),
      json: async () => ({
        choices: [{ message: { role: 'assistant', content: 'Name: Pikazard' }, finish_reason: 'stop', index: 0 }],
      }),
    })

    const result = await generateFusionText(TOKEN, MODEL, 'Pikachu', ['Electric'], 'Charizard', ['Fire'])
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.content).toBe('Name: Pikazard')
  })

  it('detects 401 auth error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 401,
      ok: false,
      headers: new Headers(),
    })

    const result = await generateFusionText(TOKEN, MODEL, 'A', ['X'], 'B', ['Y'])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('auth')
  })

  it('detects 429 rate-limit with Retry-After header', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 429,
      ok: false,
      headers: new Headers({ 'Retry-After': '30' }),
    })

    const result = await generateFusionText(TOKEN, MODEL, 'A', ['X'], 'B', ['Y'])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.kind).toBe('rate-limit')
      if (result.error.kind === 'rate-limit') {
        expect(result.error.retryAfterSeconds).toBe(30)
      }
    }
  })

  it('detects server error (5xx)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 500,
      ok: false,
      headers: new Headers(),
    })

    const result = await generateFusionText(TOKEN, MODEL, 'A', ['X'], 'B', ['Y'])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('server')
  })

  it('retries once on empty response then fails', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({ choices: [{ message: { role: 'assistant', content: '' }, finish_reason: 'stop', index: 0 }] }),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        headers: new Headers(),
        json: async () => ({ choices: [{ message: { role: 'assistant', content: '' }, finish_reason: 'stop', index: 0 }] }),
      })
    globalThis.fetch = mockFetch

    const result = await generateFusionText(TOKEN, MODEL, 'A', ['X'], 'B', ['Y'])
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('empty-response')
  })

  it('returns network error on fetch failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('network'))

    const result = await generateFusionText(TOKEN, MODEL, 'A', ['X'], 'B', ['Y'])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.kind).toBe('network')
  })
})
