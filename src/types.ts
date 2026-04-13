export interface PokemonStats {
  hp: number
  attack: number
  defense: number
  spAttack: number
  spDefense: number
  speed: number
}

export interface Pokemon {
  id: number
  name: string
  types: string[]
  stats: PokemonStats
}

export interface FusionParent {
  id: number
  name: string
  types: string[]
}

export interface Fusion {
  id: string
  parent1: FusionParent
  parent2: FusionParent
  name: string
  description: string
  stats: PokemonStats
  imageBase64: string | null
  flavorText: string | null
  createdAt: string
  mode: 'random' | 'manual'
}

export interface Settings {
  apiToken: string | null
  modelId: string
  theme: 'light' | 'dark' | 'system'
}
