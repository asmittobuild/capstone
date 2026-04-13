import { useState, useCallback, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
  message: string
  type: ToastType
  id: number
}

export function useToast() {
  const [toast, setToast] = useState<Toast | null>(null)
  const idRef = useRef(0)

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++idRef.current
    setToast({ message, type, id })
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current))
    }, 3000)
  }, [])

  const dismiss = useCallback(() => setToast(null), [])

  return { toast, show, dismiss }
}
