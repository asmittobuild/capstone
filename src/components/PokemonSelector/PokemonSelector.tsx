import { useMemo, useState } from 'react'
import type { Pokemon } from '../../types'
import { getAll, getTypes } from '../../lib/pokemon'
import { PokemonCard } from './PokemonCard'

interface PokemonSelectorProps {
  selected: Pokemon | null
  onSelect: (pokemon: Pokemon) => void
  label: string
  excludeId?: number
}

const PAGE_SIZE = 60

export function PokemonSelector({ selected, onSelect, label, excludeId }: PokemonSelectorProps) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const types = useMemo(() => getTypes(), [])

  const filtered = useMemo(() => {
    let list = getAll()
    if (excludeId != null) list = list.filter((p) => p.id !== excludeId)
    if (search) {
      const lower = search.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(lower) || String(p.id).includes(search),
      )
    }
    if (typeFilter) {
      list = list.filter((p) => p.types.includes(typeFilter))
    }
    return list
  }, [search, typeFilter, excludeId])

  const visible = filtered.slice(0, visibleCount)

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>

      {selected && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Selected: #{selected.id} {selected.name}
          </span>
          <button
            onClick={() => onSelect(null as unknown as Pokemon)}
            className="text-xs text-blue-500 underline"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value)
            setVisibleCount(PAGE_SIZE)
          }}
          className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-80 overflow-y-auto">
        {visible.map((p) => (
          <PokemonCard
            key={p.id}
            pokemon={p}
            selected={selected?.id === p.id}
            onClick={() => onSelect(p)}
          />
        ))}
      </div>

      {visibleCount < filtered.length && (
        <button
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Load more ({filtered.length - visibleCount} remaining)
        </button>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {filtered.length} Pokemon found
      </p>
    </div>
  )
}
