import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── T065: Supabase DB Wrapper ─────────────────────────────────────────

// We need to mock @supabase/supabase-js before importing db.ts
// Since db.ts reads env vars at module level, mock import.meta.env too

const mockFrom = vi.fn()
const mockCreateClient = vi.fn().mockReturnValue({ from: mockFrom })

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}))

// Provide env vars so supabase client is created
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key')

// Dynamic import to ensure mocks are in place
const { listFusions, saveFusion, deleteFusion } = await import('../../src/services/db')

describe('listFusions', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('returns fusions in descending order with camelCase mapping', async () => {
    const mockRow = {
      id: 'abc',
      parent1: { id: 1, name: 'Pikachu', types: ['Electric'] },
      parent2: { id: 4, name: 'Charmander', types: ['Fire'] },
      name: 'Pikmander',
      description: 'A fusion',
      stats: { hp: 50, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 },
      image_base64: 'img==',
      flavor_text: 'A quick Pokemon',
      created_at: '2025-01-01T00:00:00Z',
      mode: 'random',
    }

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [mockRow], error: null }),
      }),
    })

    const result = await listFusions()
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toHaveLength(1)
      const f = result.data[0]
      // Verify snake_case → camelCase mapping
      expect(f.imageBase64).toBe('img==')
      expect(f.flavorText).toBe('A quick Pokemon')
      expect(f.createdAt).toBe('2025-01-01T00:00:00Z')
    }
  })

  it('returns error on query failure', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Query failed' } }),
      }),
    })

    const result = await listFusions()
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toBe('Query failed')
  })
})

describe('saveFusion', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('inserts with camelCase → snake_case mapping', async () => {
    const insertFn = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: insertFn })

    const fusion = {
      id: 'abc',
      parent1: { id: 1, name: 'Pikachu', types: ['Electric'] },
      parent2: { id: 4, name: 'Charmander', types: ['Fire'] },
      name: 'Pikmander',
      description: 'A fusion',
      stats: { hp: 50, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 },
      imageBase64: 'img==',
      flavorText: 'A quick Pokemon',
      createdAt: '2025-01-01T00:00:00Z',
      mode: 'random' as const,
    }

    const result = await saveFusion(fusion)
    expect(result.ok).toBe(true)

    const insertedRow = insertFn.mock.calls[0][0]
    // Verify camelCase → snake_case mapping
    expect(insertedRow.image_base64).toBe('img==')
    expect(insertedRow.flavor_text).toBe('A quick Pokemon')
    expect(insertedRow.created_at).toBe('2025-01-01T00:00:00Z')
  })

  it('returns error on insert failure', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: { message: 'Insert failed' } }),
    })

    const fusion = {
      id: 'abc',
      parent1: { id: 1, name: 'P', types: ['X'] },
      parent2: { id: 2, name: 'Q', types: ['Y'] },
      name: 'PQ',
      description: '',
      stats: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
      imageBase64: null,
      flavorText: null,
      createdAt: '',
      mode: 'random' as const,
    }

    const result = await saveFusion(fusion)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toBe('Insert failed')
  })
})

describe('deleteFusion', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('deletes by id', async () => {
    const eqFn = vi.fn().mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({ eq: eqFn }),
    })

    const result = await deleteFusion('abc')
    expect(result.ok).toBe(true)
    expect(eqFn).toHaveBeenCalledWith('id', 'abc')
  })

  it('returns error on delete failure', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } }),
      }),
    })

    const result = await deleteFusion('abc')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.message).toBe('Delete failed')
  })
})
