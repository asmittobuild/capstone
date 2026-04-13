import type { Fusion } from '../../types'
import { FusionCard } from '../FusionCard/FusionCard'
import { EmptyState } from './EmptyState'

interface CollectionProps {
  fusions: Fusion[]
  onDelete: (id: string) => void
}

export function Collection({ fusions, onDelete }: CollectionProps) {
  if (fusions.length === 0) return <EmptyState />

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      {fusions.map((f) => (
        <FusionCard key={f.id} fusion={f} onDelete={() => onDelete(f.id)} isSaved />
      ))}
    </div>
  )
}
