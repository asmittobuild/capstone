interface StatBarProps {
  label: string
  value: number
  max?: number
}

export function StatBar({ label, value, max = 255 }: StatBarProps) {
  const pct = Math.min(100, (value / max) * 100)
  const color = value >= 100 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-20 text-right font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-gray-600 dark:text-gray-400">{value}</span>
    </div>
  )
}
