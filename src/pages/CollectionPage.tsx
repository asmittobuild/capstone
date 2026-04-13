import { useEffect } from 'react'
import { useFusion } from '../context/FusionContext'
import { Collection } from '../components/Collection/Collection'
import { DBErrorBanner } from '../components/ui/DBErrorBanner'


export function CollectionPage() {
  const { savedFusions, deleteFusion, loadCollection, dbError, isLoading } = useFusion()

  useEffect(() => {
    loadCollection()
  }, [loadCollection])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
        My Collection
      </h1>

      {dbError && <DBErrorBanner onRetry={loadCollection} />}

      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      ) : (
        <Collection fusions={savedFusions} onDelete={deleteFusion} />
      )}
    </div>
  )
}
