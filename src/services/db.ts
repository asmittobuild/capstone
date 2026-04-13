import { createClient } from '@supabase/supabase-js'
import type { Fusion } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

export interface DBResult<T> {
  ok: true
  data: T
}

export interface DBError {
  ok: false
  message: string
}

type DBResponse<T> = DBResult<T> | DBError

interface FusionRow {
  id: string
  parent1: Fusion['parent1']
  parent2: Fusion['parent2']
  name: string
  description: string
  stats: Fusion['stats']
  image_base64: string | null
  flavor_text: string | null
  created_at: string
  mode: string
}

function rowToFusion(row: FusionRow): Fusion {
  return {
    id: row.id,
    parent1: row.parent1,
    parent2: row.parent2,
    name: row.name,
    description: row.description,
    stats: row.stats,
    imageBase64: row.image_base64,
    flavorText: row.flavor_text,
    createdAt: row.created_at,
    mode: row.mode as Fusion['mode'],
  }
}

function fusionToRow(fusion: Fusion) {
  return {
    id: fusion.id,
    parent1: fusion.parent1,
    parent2: fusion.parent2,
    name: fusion.name,
    description: fusion.description,
    stats: fusion.stats,
    image_base64: fusion.imageBase64,
    flavor_text: fusion.flavorText,
    created_at: fusion.createdAt,
    mode: fusion.mode,
  }
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch {
    return await fn()
  }
}

export async function listFusions(): Promise<DBResponse<Fusion[]>> {
  if (!supabase) return { ok: false, message: 'Database not configured' }

  return withRetry(async () => {
    const { data, error } = await supabase
      .from('fusions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { ok: false, message: error.message }
    return { ok: true, data: (data as FusionRow[]).map(rowToFusion) }
  })
}

export async function saveFusion(fusion: Fusion): Promise<DBResponse<void>> {
  if (!supabase) return { ok: false, message: 'Database not configured' }

  return withRetry(async () => {
    const { error } = await supabase.from('fusions').insert(fusionToRow(fusion))

    if (error) return { ok: false, message: error.message }
    return { ok: true, data: undefined }
  })
}

export async function deleteFusion(id: string): Promise<DBResponse<void>> {
  if (!supabase) return { ok: false, message: 'Database not configured' }

  return withRetry(async () => {
    const { error } = await supabase.from('fusions').delete().eq('id', id)

    if (error) return { ok: false, message: error.message }
    return { ok: true, data: undefined }
  })
}
