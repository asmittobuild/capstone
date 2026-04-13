export function EmptyState() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-6xl">✨</div>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
        No fusions saved yet
      </h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
        Generate a fusion on the Home page or Select page, then click "Save" to add it to your
        collection.
      </p>
    </div>
  )
}
