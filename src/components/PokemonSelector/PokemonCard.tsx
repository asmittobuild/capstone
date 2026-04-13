import type { Pokemon } from '../../types'
import { TypeBadge } from '../ui/TypeBadge'

interface PokemonCardProps {
  pokemon: Pokemon
  selected?: boolean
  onClick: () => void
}

export function PokemonCard({ pokemon, selected, onClick }: PokemonCardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-center hover:shadow-md ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <span className="text-2xl">🔮</span>
      <span className="text-xs font-medium text-gray-900 dark:text-white truncate w-full">
        #{pokemon.id} {pokemon.name}
      </span>
      <div className="flex gap-0.5 flex-wrap justify-center">
        {pokemon.types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </div>
    </button>
  )
}
