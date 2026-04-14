import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Pokemon } from '../types'
import { useFusion } from '../context/FusionContext'
import { useSettings } from '../context/SettingsContext'
import { PokemonSelector } from '../components/PokemonSelector/PokemonSelector'
import { FusionCard } from '../components/FusionCard/FusionCard'
import { useToast } from '../hooks/useToast'
import { Toast } from '../components/ui/Toast'
import { SkeletonCard } from '../components/ui/SkeletonCard'
import { Button } from '../components/ui/Button'

export function SelectPage() {
  const navigate = useNavigate()
  const { isFirstRun } = useSettings()
    const { isLoading, error, generateManual, savedFusions, currentFusion, saveFusion } = useFusion()
  const { toast, show, dismiss } = useToast()
  const [pokemon1, setPokemon1] = useState<Pokemon | null>(null)
  const [pokemon2, setPokemon2] = useState<Pokemon | null>(null)

  const sameSelected = pokemon1 && pokemon2 && pokemon1.id === pokemon2.id

  const handleFuse = async () => {
    if (isFirstRun) {
      navigate('/settings')
      return
    }
    if (pokemon1 && pokemon2) {
      // Use generateManual from useFusion context for correct auth handling
      await generateManual(pokemon1, pokemon2)
      // localFusion will be set via context's currentFusion if needed, or you can listen for changes
    }
  }

    const handleSaveFusion = async () => {
      try {
        await saveFusion();
        show('Fusion saved!', 'success');
      } catch {
        show('Failed to save fusion. Supabase may be unreachable.', 'error');
      }
    }

  const handleDiscardFusion = () => {
      // No need to set localFusion, currentFusion is used now
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        Select Two Pokemon
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <PokemonSelector
          label="Pokemon 1"
          selected={pokemon1}
          onSelect={setPokemon1}
          excludeId={pokemon2?.id}
        />
        <PokemonSelector
          label="Pokemon 2"
          selected={pokemon2}
          onSelect={setPokemon2}
          excludeId={pokemon1?.id}
        />
      </div>

      {sameSelected && (
        <p className="text-center text-red-500 text-sm">Please select two different Pokemon.</p>
      )}

      <div className="flex justify-center">
        <Button
          variant="primary"
          onClick={handleFuse}
          loading={isLoading}
          disabled={!pokemon1 || !pokemon2 || !!sameSelected}
        >
          {isFirstRun ? 'Set API Token First' : 'Fuse!'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {isLoading && <SkeletonCard />}

        {currentFusion && !isLoading && (
        <div className="flex justify-center">
          <FusionCard
              fusion={currentFusion}
            onSave={handleSaveFusion}
            onDelete={handleDiscardFusion}
            isSaved={!!(currentFusion && savedFusions.find(f => f.id === currentFusion.id))}
            isRegenerating={isLoading}
          />
        </div>
      )}

      {toast && <Toast toast={toast} onDismiss={dismiss} />}
    </div>
  )
}
