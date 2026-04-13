export function DBErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-yellow-800 dark:text-yellow-200">Database Unavailable</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Unable to connect to the database. Your fusions are safe in memory.
          </p>
        </div>
        <button
          onClick={onRetry}
          className="px-3 py-1 text-sm bg-yellow-200 dark:bg-yellow-700 rounded hover:bg-yellow-300 dark:hover:bg-yellow-600 text-yellow-900 dark:text-yellow-100"
        >
          Retry
        </button>
      </div>
    </div>
  )
}
