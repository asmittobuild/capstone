import { useEffect } from 'react'
import { useFusion } from '../context/FusionContext'
import { Collection } from '../components/Collection/Collection'
import { DBErrorBanner } from '../components/ui/DBErrorBanner'

export function CollectionPage() {
  const { savedFusions, deleteFusion, loadCollection, dbError } = useFusion()

  useEffect(() => {
    loadCollection()
  }, [loadCollection])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        My Collection
      </h1>

      {dbError && <DBErrorBanner onRetry={loadCollection} />}

      <Collection fusions={savedFusions} onDelete={deleteFusion} />
    </div>
  )
}
