import { v4 as uuidv4 } from 'uuid'
import type { Fusion, FusionParent, Pokemon, PokemonStats } from '../types'
import { getAll } from './pokemon'
import { generateFusionText, type HFResult } from '../services/huggingface'
import { getFlavorText } from '../services/pokeapi'
import * as sd from '../services/stablediffusion'

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

/** Parse AI response to extract fusion name and description */
export function parseAIResponse(
  content: string,
  parent1Name: string,
  parent2Name: string,
): { name: string; description: string } {
  const lines = content.split('\n').filter((l) => l.trim())

  let name = ''
  let description = ''

  for (const line of lines) {
    const trimmed = line.trim()
    // Match "1. Name: Xyz" or "**Name:** Xyz" or "Name: Xyz"
    const nameMatch = trimmed.match(
      /^(?:\d+\.\s*)?(?:\*\*)?(?:name|fusion name|fusion)\s*:?\s*\*?\*?\s*(.+)/i,
    )
    if (nameMatch && !name) {
      name = nameMatch[1].replace(/\*\*/g, '').trim()
      continue
    }
    // Match "2. Description: ..." or "**Description:** ..."
    const descMatch = trimmed.match(
      /^(?:\d+\.\s*)?(?:\*\*)?(?:description|appearance|abilities)\s*:?\s*\*?\*?\s*(.+)/i,
    )
    if (descMatch) {
      description += (description ? ' ' : '') + descMatch[1].replace(/\*\*/g, '').trim()
      continue
    }
    // If we already have a name but no explicit desc match, treat as description
    if (name && !nameMatch) {
      description += (description ? ' ' : '') + trimmed.replace(/\*\*/g, '').trim()
    }
  }

  // Fallback name generation
  if (!name) {
    const half1 = parent1Name.slice(0, Math.ceil(parent1Name.length / 2))
    const half2 = parent2Name.slice(Math.floor(parent2Name.length / 2))
    name = half1 + half2
  }

  if (!description) {
    description = content.replace(/\*\*/g, '').trim()
  }

  return { name, description }
}

function toParent(p: Pokemon): FusionParent {
  return { id: p.id, name: p.name, types: p.types }
}

/** Select a random compatible pair from the pokedex */
export function selectRandomPair(): { p1: Pokemon; p2: Pokemon } {
  const all = getAll()
  let attempts = 0
  while (attempts < 100) {
    const i1 = Math.floor(Math.random() * all.length)
    let i2 = Math.floor(Math.random() * all.length)
    if (i2 === i1) i2 = (i1 + 1) % all.length
    if (areTypesCompatible(all[i1], all[i2])) {
      return { p1: all[i1], p2: all[i2] }
    }
    attempts++
  }
  // Fallback: just pick two different Pokemon
  return { p1: all[0], p2: all[1] }
}

export interface GenerateFusionOptions {
  apiToken: string
  modelId: string
  parent1: Pokemon
  parent2: Pokemon
  mode: 'random' | 'manual'
}

export type GenerateResult =
  | { ok: true; fusion: Fusion }
  | { ok: false; error: ReturnType<typeof extractError> }

function extractError(result: HFResult & { ok: false }) {
  return result.error
}

/** Full fusion generation orchestrator */
export async function generateFusion(opts: GenerateFusionOptions): Promise<GenerateResult> {
  const { apiToken, modelId, parent1, parent2, mode } = opts

  // 1. Average stats
  const stats = averageStats(parent1.stats, parent2.stats)

  // 2. AI text generation (max 12s via HF client timeout)
  const hfResult = await generateFusionText(
    apiToken,
    modelId,
    parent1.name,
    parent1.types,
    parent2.name,
    parent2.types,
  )

  if (!hfResult.ok) {
    return { ok: false, error: hfResult.error }
  }

  const { name, description } = parseAIResponse(hfResult.content, parent1.name, parent2.name)

  // 3. Optional PokeAPI flavor text (non-blocking, 3s timeout built into service)
  // 4. Optional SDXL image (non-blocking, 15s timeout built into service)
  const [flavorText, imageResult] = await Promise.all([
    getFlavorText(parent1.id).catch(() => null),
    sd.isAvailable().then((avail) =>
      avail ? sd.generateImage(`${name}, fusion of ${parent1.name} and ${parent2.name}`) : null,
    ).catch(() => null),
  ])

  const fusion: Fusion = {
    id: uuidv4(),
    parent1: toParent(parent1),
    parent2: toParent(parent2),
    name,
    description,
    stats,
    imageBase64: imageResult?.image ?? null,
    flavorText: flavorText ?? null,
    createdAt: new Date().toISOString(),
    mode,
  }

  return { ok: true, fusion }
}
