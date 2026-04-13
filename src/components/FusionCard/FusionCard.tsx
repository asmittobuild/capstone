import type { Fusion } from '../../types'
import { sanitize } from '../../lib/sanitize'
import { TypeBadge } from '../ui/TypeBadge'
import { StatBar } from './StatBar'
import { Button } from '../ui/Button'
import pokemonLogo from '../../assets/pokemon-logo.svg'

interface FusionCardProps {
  fusion: Fusion
  onSave?: () => void
  onDelete?: () => void
  onRegenerate?: () => void
  isSaved?: boolean
  isRegenerating?: boolean
}

export function FusionCard({
  fusion,
  onSave,
  onDelete,
  onRegenerate,
  isSaved,
  isRegenerating,
}: FusionCardProps) {
  const totalStats =
    fusion.stats.hp +
    fusion.stats.attack +
    fusion.stats.defense +
    fusion.stats.spAttack +
    fusion.stats.spDefense +
    fusion.stats.speed

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden w-full max-w-md mx-auto transition-all duration-300">
      {/* Image */}
      <div className="relative h-84 bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
        {fusion.imageBase64 ? (
          <img
            src={`data:image/png;base64,${fusion.imageBase64}`}
            alt={fusion.name}
            className="max-h-full max-w-full object-contain rounded-xl shadow transition-opacity duration-500 bg-white"
            style={{ background: 'rgba(255,255,255,0.8)' }}
          />
        ) : (
          <img
            src={pokemonLogo}
            alt="Pokemon Logo Placeholder"
            className="h-32 w-32 opacity-30"
          />
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Name */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {fusion.name}
        </h2>

        {/* Parents */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">{fusion.parent1.name}</span>
          <div className="flex gap-1">
            {fusion.parent1.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <span>×</span>
          <span className="font-medium">{fusion.parent2.name}</span>
          <div className="flex gap-1">
            {fusion.parent2.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>

        {/* Stats (two columns) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <StatBar label="HP" value={fusion.stats.hp} />
          <StatBar label="Attack" value={fusion.stats.attack} />
          <StatBar label="Defense" value={fusion.stats.defense} />
          <StatBar label="Sp. Atk" value={fusion.stats.spAttack} />
          <StatBar label="Sp. Def" value={fusion.stats.spDefense} />
          <StatBar label="Speed" value={fusion.stats.speed} />
        </div>
        <div className="flex items-center justify-end gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 pt-1 border-t border-gray-200 dark:border-gray-700">
          <span>Total</span>
          <span>{totalStats}</span>
        </div>

        {/* Description */}
        <div
          className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitize(fusion.description) }}
        />

        {/* Flavor text */}
        {fusion.flavorText && (
          <p className="text-xs italic text-gray-500 dark:text-gray-400">
            {fusion.flavorText}
          </p>
        )}

        {/* Timestamp */}
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
          {new Date(fusion.createdAt).toLocaleString()}
        </p>

        {/* Actions */}
        <div className="flex gap-2 justify-center pt-2">
          {onRegenerate && (
            <Button variant="secondary" onClick={onRegenerate} loading={isRegenerating}>
              Regenerate
            </Button>
          )}
          {onSave && !isSaved && (
            <Button variant="primary" onClick={onSave}>
              Save
            </Button>
          )}
          {!isSaved && onDelete && (
            <Button variant="danger" onClick={onDelete}>
              Discard
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
