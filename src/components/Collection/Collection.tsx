
import { useState } from 'react'
import type { Fusion } from '../../types'
import { FusionCard } from '../FusionCard/FusionCard'
import { EmptyState } from './EmptyState'

interface CollectionProps {
  fusions: Fusion[];
  onDelete: (id: string) => Promise<void> | void;
}

export function Collection({ fusions, onDelete }: CollectionProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (fusions.length === 0) return <EmptyState />;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
      {fusions.map((f) => (
        <FusionCard
          key={f.id}
          fusion={f}
          onDelete={() => handleDelete(f.id)}
          isSaved
          isDeleting={deletingId === f.id}
        />
      ))}
    </div>
  );
}
