import { describe, it, expect } from 'vitest'
import { averageStats, areTypesCompatible, parseAIResponse, selectRandomPair } from '../../src/lib/fusion'
import type { PokemonStats, Pokemon } from '../../src/types'

// ── T057: Stat Averaging ──────────────────────────────────────────────

describe('averageStats', () => {
  it('averages each stat with Math.round', () => {
    const a: PokemonStats = { hp: 45, attack: 49, defense: 49, spAttack: 65, spDefense: 65, speed: 45 }
    const b: PokemonStats = { hp: 80, attack: 82, defense: 83, spAttack: 100, spDefense: 100, speed: 80 }
    const result = averageStats(a, b)
    expect(result).toEqual({
      hp: 63,       // (45+80)/2 = 62.5 → 63
      attack: 66,   // (49+82)/2 = 65.5 → 66
      defense: 66,  // (49+83)/2 = 66
      spAttack: 83, // (65+100)/2 = 82.5 → 83
      spDefense: 83,
      speed: 63,
    })
  })

  it('returns identical stats when inputs are symmetric', () => {
    const stats: PokemonStats = { hp: 50, attack: 60, defense: 70, spAttack: 80, spDefense: 90, speed: 100 }
    expect(averageStats(stats, stats)).toEqual(stats)
  })

  it('handles zero stats', () => {
    const zero: PokemonStats = { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 }
    const other: PokemonStats = { hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 }
    expect(averageStats(zero, other)).toEqual({
      hp: 50, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50,
    })
  })

  it('handles max stats (255)', () => {
    const max: PokemonStats = { hp: 255, attack: 255, defense: 255, spAttack: 255, spDefense: 255, speed: 255 }
    expect(averageStats(max, max)).toEqual(max)
  })
})

// ── T058: Type Compatibility ──────────────────────────────────────────

describe('areTypesCompatible', () => {
  const makePokemon = (types: string[]): Pokemon => ({
    id: 1, name: 'Test', types, stats: { hp: 1, attack: 1, defense: 1, spAttack: 1, spDefense: 1, speed: 1 },
  })

  it('returns false for identical single-type Pokemon', () => {
    expect(areTypesCompatible(makePokemon(['Fire']), makePokemon(['Fire']))).toBe(false)
  })

  it('returns false for identical dual-type Pokemon', () => {
    expect(areTypesCompatible(makePokemon(['Grass', 'Poison']), makePokemon(['Grass', 'Poison']))).toBe(false)
  })

  it('returns true for different types', () => {
    expect(areTypesCompatible(makePokemon(['Fire']), makePokemon(['Water']))).toBe(true)
  })

  it('returns true for partial overlap in dual types', () => {
    expect(areTypesCompatible(makePokemon(['Fire', 'Flying']), makePokemon(['Fire', 'Rock']))).toBe(true)
  })

  it('returns true when type counts differ (single vs dual)', () => {
    expect(areTypesCompatible(makePokemon(['Fire']), makePokemon(['Fire', 'Flying']))).toBe(true)
  })
})

// ── T059: AI Response Parser ──────────────────────────────────────────

describe('parseAIResponse', () => {
  it('extracts name and description from structured response', () => {
    const response = `1. Name: Chariquaza
2. Description: A mighty dragon wreathed in flames with emerald wings.`
    const result = parseAIResponse(response, 'Charizard', 'Rayquaza')
    expect(result.name).toBe('Chariquaza')
    expect(result.description).toContain('dragon wreathed in flames')
  })

  it('extracts from bold markdown format', () => {
    const response = `**Name:** Bulbasar
**Description:** A grass-type hybrid with razor leaves.`
    const result = parseAIResponse(response, 'Bulbasaur', 'Charizard')
    expect(result.name).toBe('Bulbasar')
    expect(result.description).toContain('grass-type hybrid')
  })

  it('generates fallback name when none found', () => {
    const response = 'Just a wonderful creature with fire and water abilities.'
    const result = parseAIResponse(response, 'Charizard', 'Blastoise')
    // half1 = "Chari" (ceil(9/2)=5), half2 = "toise" (floor(9/2)=4 → slice from 4)
    expect(result.name).toBe('Charitoise')
  })

  it('handles empty response', () => {
    const result = parseAIResponse('', 'Pikachu', 'Eevee')
    // Fallback name: "Pika" (ceil(7/2)=4) + "vee" (floor(5/2)=2→slice(2)) = "Pikavee"
    expect(result.name).toBe('Pikavee')
    expect(result.description).toBe('')
  })

  it('handles response with only a name line', () => {
    const result = parseAIResponse('Name: Pikavee', 'Pikachu', 'Eevee')
    expect(result.name).toBe('Pikavee')
  })

  it('collects continuation lines as description after name', () => {
    const response = `Name: Charbasaur
A fire-breathing plant creature.
It has vine whips that shoot flames.`
    const result = parseAIResponse(response, 'Charizard', 'Bulbasaur')
    expect(result.name).toBe('Charbasaur')
    expect(result.description).toContain('fire-breathing plant creature')
    expect(result.description).toContain('vine whips that shoot flames')
  })
})

// ── selectRandomPair ──────────────────────────────────────────────────

describe('selectRandomPair', () => {
  it('returns two different Pokemon', () => {
    const { p1, p2 } = selectRandomPair()
    expect(p1.id).not.toBe(p2.id)
  })

  it('returns type-compatible Pokemon', () => {
    const { p1, p2 } = selectRandomPair()
    expect(areTypesCompatible(p1, p2)).toBe(true)
  })
})
