import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Settings } from '../types'

const DEFAULT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3'

interface SettingsContextValue extends Settings {
  setApiToken: (token: string | null) => void
  setModelId: (id: string) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  isFirstRun: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [apiToken, setApiToken] = useLocalStorage<string | null>('pf-api-token', null)
  const [modelId, setModelId] = useLocalStorage<string>('pf-model-id', DEFAULT_MODEL)
  const [theme, setTheme] = useLocalStorage<'light' | 'dark' | 'system'>('pf-theme', 'system')

  useEffect(() => {
    const root = document.documentElement
    const applyTheme = () => {
      if (theme === 'dark') {
        root.classList.add('dark')
      } else if (theme === 'light') {
        root.classList.remove('dark')
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        root.classList.toggle('dark', prefersDark)
      }
    }
    applyTheme()

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const isFirstRun = apiToken === null

  return (
    <SettingsContext.Provider
      value={{ apiToken, modelId, theme, setApiToken, setModelId, setTheme, isFirstRun }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
