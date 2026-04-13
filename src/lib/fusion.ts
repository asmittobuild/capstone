import type { Pokemon, PokemonStats } from '../types'

export function averageStats(a: PokemonStats, b: PokemonStats): PokemonStats {
  return {
    hp: Math.round((a.hp + b.hp) / 2),
    attack: Math.round((a.attack + b.attack) / 2),
    defense: Math.round((a.defense + b.defense) / 2),
    spAttack: Math.round((a.spAttack + b.spAttack) / 2),
    spDefense: Math.round((a.spDefense + b.spDefense) / 2),
    speed: Math.round((a.speed + b.speed) / 2),
  }
}

export function areTypesCompatible(a: Pokemon, b: Pokemon): boolean {
  if (a.types.length !== b.types.length) return true
  const sortedA = [...a.types].sort()
  const sortedB = [...b.types].sort()
  return sortedA.some((t, i) => t !== sortedB[i])
}
