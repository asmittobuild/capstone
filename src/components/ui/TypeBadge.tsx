const typeColors: Record<string, string> = {
  Normal: 'bg-gray-400',
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Electric: 'bg-yellow-400 text-gray-900',
  Grass: 'bg-green-500',
  Ice: 'bg-cyan-300 text-gray-900',
  Fighting: 'bg-red-700',
  Poison: 'bg-purple-500',
  Ground: 'bg-amber-600',
  Flying: 'bg-indigo-300',
  Psychic: 'bg-pink-500',
  Bug: 'bg-lime-500',
  Rock: 'bg-yellow-700',
  Ghost: 'bg-purple-700',
  Dragon: 'bg-indigo-600',
  Dark: 'bg-gray-700',
  Steel: 'bg-gray-400',
  Fairy: 'bg-pink-300 text-gray-900',
}

export function TypeBadge({ type }: { type: string }) {
  const color = typeColors[type] ?? 'bg-gray-500'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white ${color}`}>
      {type}
    </span>
  )
}
