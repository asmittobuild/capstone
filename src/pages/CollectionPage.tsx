import { useEffect, useState } from 'react'
import { useFusion } from '../context/FusionContext'
import { Collection } from '../components/Collection/Collection'
import { DBErrorBanner } from '../components/ui/DBErrorBanner'

export function CollectionPage() {
  const { savedFusions, deleteFusion, loadCollection, dbError } = useFusion()
  const [isCollectionLoading, setIsCollectionLoading] = useState(true)

  useEffect(() => {
    setIsCollectionLoading(true)
    loadCollection().finally(() => setIsCollectionLoading(false))
  }, [loadCollection])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        My Collection
      </h1>

      {dbError && <DBErrorBanner onRetry={loadCollection} />}

      {isCollectionLoading ? (
        <div className="flex justify-center py-12">
          <span className="text-gray-500 dark:text-gray-400 text-lg">Loading...</span>
        </div>
      ) : (
        <Collection fusions={savedFusions} onDelete={deleteFusion} />
      )}
    </div>
  )
}
