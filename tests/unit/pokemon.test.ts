import { describe, it, expect } from 'vitest'
import { getAll, getById, getByName, getTypes } from '../../src/lib/pokemon'

// ── T060: Pokemon Data Access ─────────────────────────────────────────

describe('getAll', () => {
  it('returns a non-empty array', () => {
    const all = getAll()
    expect(all.length).toBeGreaterThan(0)
  })

  it('each entry has required fields', () => {
    const first = getAll()[0]
    expect(first).toHaveProperty('id')
    expect(first).toHaveProperty('name')
    expect(first).toHaveProperty('types')
    expect(first).toHaveProperty('stats')
  })
})

describe('getById', () => {
  it('returns Bulbasaur for id 1', () => {
    const p = getById(1)
    expect(p).toBeDefined()
    expect(p!.name).toBe('Bulbasaur')
  })

  it('returns undefined for invalid id', () => {
    expect(getById(999999)).toBeUndefined()
  })
})

describe('getByName', () => {
  it('finds by exact name', () => {
    const p = getByName('Bulbasaur')
    expect(p).toBeDefined()
    expect(p!.id).toBe(1)
  })

  it('is case-insensitive', () => {
    const p = getByName('bULBASAUR')
    expect(p).toBeDefined()
    expect(p!.id).toBe(1)
  })

  it('returns undefined for unknown name', () => {
    expect(getByName('Missingno')).toBeUndefined()
  })
})

describe('getTypes', () => {
  it('returns a sorted array of unique types', () => {
    const types = getTypes()
    expect(types.length).toBeGreaterThan(0)
    const sorted = [...types].sort()
    expect(types).toEqual(sorted)
  })

  it('contains common types like Fire and Water', () => {
    const types = getTypes()
    expect(types).toContain('Fire')
    expect(types).toContain('Water')
  })
})
