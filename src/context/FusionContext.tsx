import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import type { Fusion, Pokemon } from '../types'
import { generateFusion, selectRandomPair, type GenerateResult } from '../lib/fusion'
import { useSettings } from './SettingsContext'
import type { HFRateLimitError } from '../services/huggingface'

interface FusionContextValue {
  currentFusion: Fusion | null
  isLoading: boolean
  error: string | null
  rateLimitCooldown: number
  generateRandom: () => Promise<void>
  generateManual: (p1: Pokemon, p2: Pokemon) => Promise<void>
  regenerate: () => Promise<void>
  savedFusions: Fusion[]
  saveFusion: () => Promise<void>
  deleteFusion: (id: string) => Promise<void>
  loadCollection: () => Promise<void>
  dbError: string | null
}

const FusionContext = createContext<FusionContextValue | null>(null)

export function FusionProvider({ children }: { children: ReactNode }) {
  const { apiToken, modelId } = useSettings()
  const [currentFusion, setCurrentFusion] = useState<Fusion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimitCooldown, setRateLimitCooldown] = useState(0)
  const [savedFusions, setSavedFusions] = useState<Fusion[]>([])
  const [dbError, setDbError] = useState<string | null>(null)
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastParentsRef = useRef<{ p1: Pokemon; p2: Pokemon } | null>(null)

  const startCooldown = useCallback((seconds: number) => {
    setRateLimitCooldown(seconds)
    if (cooldownRef.current) clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setRateLimitCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleResult = useCallback(
    (result: GenerateResult) => {
      if (result.ok) {
        setCurrentFusion(result.fusion)
        setError(null)
      } else {
        const err = result.error
        if (err.kind === 'rate-limit') {
          startCooldown((err as HFRateLimitError).retryAfterSeconds)
          setError(`Rate limited. Please wait ${(err as HFRateLimitError).retryAfterSeconds}s.`)
        } else {
          setError(err.message)
        }
      }
    },
    [startCooldown],
  )

  const generateRandom = useCallback(async () => {
    if (!apiToken) {
      setError('Please set your API token in Settings first.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const { p1, p2 } = selectRandomPair()
      lastParentsRef.current = { p1, p2 }
      const result = await generateFusion({ apiToken, modelId, parent1: p1, parent2: p2, mode: 'random' })
      handleResult(result)
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }, [apiToken, modelId, handleResult])

  const generateManual = useCallback(
    async (p1: Pokemon, p2: Pokemon) => {
      if (!apiToken) {
        setError('Please set your API token in Settings first.')
        return
      }
      if (p1.id === p2.id) {
        setError('Please select two different Pokemon.')
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        lastParentsRef.current = { p1, p2 }
        const result = await generateFusion({ apiToken, modelId, parent1: p1, parent2: p2, mode: 'manual' })
        handleResult(result)
      } catch {
        setError('An unexpected error occurred.')
      } finally {
        setIsLoading(false)
      }
    },
    [apiToken, modelId, handleResult],
  )

  const regenerate = useCallback(async () => {
    if (!apiToken || !lastParentsRef.current) return
    setIsLoading(true)
    setError(null)
    try {
      const { p1, p2 } = lastParentsRef.current
      const result = await generateFusion({
        apiToken,
        modelId,
        parent1: p1,
        parent2: p2,
        mode: currentFusion?.mode ?? 'random',
      })
      if (result.ok && currentFusion) {
        // Preserve original ID and createdAt
        result.fusion.id = currentFusion.id
        result.fusion.createdAt = currentFusion.createdAt
      }
      handleResult(result)
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }, [apiToken, modelId, currentFusion, handleResult])

  const saveFusion = useCallback(async () => {
    if (!currentFusion) return
    try {
      const { saveFusion: dbSave } = await import('../services/db')
      const result = await dbSave(currentFusion)
      if (result.ok) {
        setSavedFusions((prev) => [currentFusion, ...prev.filter((f) => f.id !== currentFusion.id)])
        setDbError(null)
      } else {
        setDbError(result.message)
      }
    } catch {
      setDbError('Failed to save fusion. Supabase may be unreachable.')
    }
  }, [currentFusion])

  const deleteFusion = useCallback(async (id: string) => {
    try {
      const { deleteFusion: dbDelete } = await import('../services/db')
      const result = await dbDelete(id)
      if (result.ok) {
        setSavedFusions((prev) => prev.filter((f) => f.id !== id))
        setDbError(null)
      } else {
        setDbError(result.message)
      }
    } catch {
      setDbError('Failed to delete fusion. Supabase may be unreachable.')
    }
  }, [])

  const loadCollection = useCallback(async () => {
    try {
      const { listFusions } = await import('../services/db')
      const result = await listFusions()
      if (result.ok) {
        setSavedFusions(result.data)
        setDbError(null)
      } else {
        setDbError(result.message)
      }
    } catch {
      setDbError('Failed to load collection. Supabase may be unreachable.')
    }
  }, [])

  return (
    <FusionContext.Provider
      value={{
        currentFusion,
        isLoading,
        error,
        rateLimitCooldown,
        generateRandom,
        generateManual,
        regenerate,
        savedFusions,
        saveFusion,
        deleteFusion,
        loadCollection,
        dbError,
      }}
    >
      {children}
    </FusionContext.Provider>
  )
}

export function useFusion(): FusionContextValue {
  const ctx = useContext(FusionContext)
  if (!ctx) throw new Error('useFusion must be used within FusionProvider')
  return ctx
}
