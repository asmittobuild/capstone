
// Raw format from pokedex.json
export interface RawPokemon {
  id: number;
  name: {
    english: string;
    japanese?: string;
    chinese?: string;
    french?: string;
    [lang: string]: string | undefined;
  };
  type: string[];
  base: {
    "HP": number;
    "Attack": number;
    "Defense": number;
    "Sp. Attack": number;
    "Sp. Defense": number;
    "Speed": number;
    [key: string]: number;
  };
  species?: string;
  description?: string;
  evolution?: any;
  profile?: any;
  image?: any;
}

// Internal format
export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface Pokemon {
  id: number;
  name: string; // English name only
  types: string[];
  stats: PokemonStats;
  species?: string;
  description?: string;
  evolution?: any;
  profile?: any;
  image?: any;
  raw?: RawPokemon; // Optionally keep the raw data
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
