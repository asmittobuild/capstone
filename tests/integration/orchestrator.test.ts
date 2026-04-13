import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Pokemon } from '../../src/types'
import { generateFusion, type GenerateFusionOptions } from '../../src/lib/fusion'

// ── T066: Orchestrator Integration ────────────────────────────────────

// Mock all external services
vi.mock('../../src/services/huggingface', () => ({
  generateFusionText: vi.fn(),
}))

vi.mock('../../src/services/pokeapi', () => ({
  getFlavorText: vi.fn(),
}))

vi.mock('../../src/services/stablediffusion', () => ({
  isAvailable: vi.fn(),
  generateImage: vi.fn(),
}))

vi.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}))

import { generateFusionText } from '../../src/services/huggingface'
import { getFlavorText } from '../../src/services/pokeapi'
import * as sd from '../../src/services/stablediffusion'

const parent1: Pokemon = {
  id: 25, name: 'Pikachu', types: ['Electric'],
  stats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
}

const parent2: Pokemon = {
  id: 6, name: 'Charizard', types: ['Fire', 'Flying'],
  stats: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 },
}

const baseOpts: GenerateFusionOptions = {
  apiToken: 'test-token',
  modelId: 'test-model',
  parent1,
  parent2,
  mode: 'random',
}

describe('generateFusion orchestrator', () => {
  beforeEach(() => {
    vi.mocked(generateFusionText).mockReset()
    vi.mocked(getFlavorText).mockReset()
    vi.mocked(sd.isAvailable).mockReset()
    vi.mocked(sd.generateImage).mockReset()
  })

  it('assembles full fusion with all services succeeding', async () => {
    vi.mocked(generateFusionText).mockResolvedValue({
      ok: true,
      content: 'Name: Pikazard\nDescription: An electric dragon with lightning breath.',
    })
    vi.mocked(getFlavorText).mockResolvedValue('When several of these Pokemon gather...')
    vi.mocked(sd.isAvailable).mockResolvedValue(true)
    vi.mocked(sd.generateImage).mockResolvedValue({ image: 'base64img==', seed: 42 })

    const result = await generateFusion(baseOpts)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const f = result.fusion
    expect(f.id).toBe('test-uuid-1234')
    expect(f.name).toBe('Pikazard')
    expect(f.description).toContain('electric dragon')
    expect(f.parent1.name).toBe('Pikachu')
    expect(f.parent2.name).toBe('Charizard')
    expect(f.stats.hp).toBe(57) // Math.round((35+78)/2)
    expect(f.imageBase64).toBe('base64img==')
    expect(f.flavorText).toBe('When several of these Pokemon gather...')
    expect(f.mode).toBe('random')
    expect(f.createdAt).toBeDefined()
  })

  it('degrades gracefully when PokeAPI fails', async () => {
    vi.mocked(generateFusionText).mockResolvedValue({
      ok: true,
      content: 'Name: Pikazard\nDescription: Lightning dragon.',
    })
    vi.mocked(getFlavorText).mockRejectedValue(new Error('timeout'))
    vi.mocked(sd.isAvailable).mockResolvedValue(false)

    const result = await generateFusion(baseOpts)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.fusion.flavorText).toBeNull()
    expect(result.fusion.imageBase64).toBeNull()
  })

  it('degrades gracefully when SDXL is unavailable', async () => {
    vi.mocked(generateFusionText).mockResolvedValue({
      ok: true,
      content: 'Name: Pikazard\nDescription: A.",',
    })
    vi.mocked(getFlavorText).mockResolvedValue('Some text')
    vi.mocked(sd.isAvailable).mockResolvedValue(false)

    const result = await generateFusion(baseOpts)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.fusion.imageBase64).toBeNull()
  })

  it('returns error when HF text generation fails', async () => {
    vi.mocked(generateFusionText).mockResolvedValue({
      ok: false,
      error: { kind: 'auth', message: 'Invalid token' },
    })

    const result = await generateFusion(baseOpts)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toEqual({ kind: 'auth', message: 'Invalid token' })
  })

  it('handles rate-limit error from HF', async () => {
    vi.mocked(generateFusionText).mockResolvedValue({
      ok: false,
      error: { kind: 'rate-limit', retryAfterSeconds: 60 },
    })

    const result = await generateFusion(baseOpts)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.kind).toBe('rate-limit')
    }
  })
})
