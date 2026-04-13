import { useNavigate } from 'react-router-dom'
import { useFusion } from '../context/FusionContext'
import { useSettings } from '../context/SettingsContext'
import { FusionCard } from '../components/FusionCard/FusionCard'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { Button } from '../components/ui/Button'
import { useToast } from '../hooks/useToast'
import { Toast } from '../components/ui/Toast'

export function HomePage() {
  const navigate = useNavigate()
  const { isFirstRun } = useSettings()
  const {
    currentFusion,
    isLoading,
    error,
    rateLimitCooldown,
    generateRandom,
    regenerate,
    saveFusion,
  } = useFusion()
  const { toast, show, dismiss } = useToast()

  // Handler to wrap saveFusion and show toast
  const handleSaveFusion = async () => {
    try {
      const { saveFusion: dbSave } = await import('../services/db')
      if (!currentFusion) return
      const result = await dbSave(currentFusion)
      if (result.ok) {
        show('Fusion saved!', 'success')
      } else {
        show(result.message || 'Failed to save fusion.', 'error')
      }
    } catch {
      show('Failed to save fusion. Supabase may be unreachable.', 'error')
    }
  }

  const handleGenerate = () => {
    if (isFirstRun) {
      navigate('/settings')
      return
    }
    generateRandom()
  }

  // Handler for discarding the current fusion (unsaved)
  const handleDiscardFusion = () => {
    if (window.confirm('Are you sure you want to discard this fusion?')) {
      // Remove current fusion from context
      window.location.reload() // quick way to reset state; for a more robust solution, expose setCurrentFusion in context
    }
  }

  // Helper to check if current fusion is saved (by id)
  const isSaved = false // Always false for now; can be improved if savedFusions is exposed

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PokeFusions</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate unique AI-powered Pokemon fusions
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          variant="primary"
          onClick={handleGenerate}
          loading={isLoading}
          disabled={rateLimitCooldown > 0}
        >
          {rateLimitCooldown > 0
            ? `Wait ${rateLimitCooldown}s`
            : isFirstRun
              ? 'Set API Token First'
              : 'Generate Fusion'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          <button
            onClick={handleGenerate}
            className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {isLoading && <SkeletonCard />}

      {currentFusion && !isLoading && (
        <FusionCard
          fusion={currentFusion}
          onRegenerate={regenerate}
          onSave={handleSaveFusion}
          onDelete={handleDiscardFusion}
          isSaved={isSaved}
          isRegenerating={isLoading}
        />
      )}

      {toast && <Toast toast={toast} onDismiss={dismiss} />}
    </div>
  )
}
