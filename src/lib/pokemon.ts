import type { Pokemon } from '../types'
import pokedexData from '../data/pokedex.json'

const pokedex: Pokemon[] = pokedexData as Pokemon[]

export function getAll(): Pokemon[] {
  return pokedex
}

export function getById(id: number): Pokemon | undefined {
  return pokedex.find((p) => p.id === id)
}

export function getByName(name: string): Pokemon | undefined {
  const lower = name.toLowerCase()
  return pokedex.find((p) => p.name.toLowerCase() === lower)
}

export function getTypes(): string[] {
  const types = new Set<string>()
  for (const p of pokedex) {
    for (const t of p.types) {
      types.add(t)
    }
  }
  return [...types].sort()
}
