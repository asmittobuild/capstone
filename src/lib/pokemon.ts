
import type { Pokemon, RawPokemon } from '../types'
import pokedexData from '../data/pokedex.json'

function mapRawToPokemon(raw: RawPokemon): Pokemon {
  return {
    id: raw.id,
    name: raw.name.english,
    types: raw.type,
    stats: {
      hp: raw.base["HP"],
      attack: raw.base["Attack"],
      defense: raw.base["Defense"],
      spAttack: raw.base["Sp. Attack"],
      spDefense: raw.base["Sp. Defense"],
      speed: raw.base["Speed"],
    },
    species: raw.species,
    description: raw.description,
    evolution: raw.evolution,
    profile: raw.profile,
    image: raw.image,
    raw,
  }
}

const pokedex: Pokemon[] = (pokedexData as RawPokemon[]).map(mapRawToPokemon)

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
