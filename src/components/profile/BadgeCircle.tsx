import { useState } from 'react'
import type { Badge } from '../../types/database'

interface BadgeCircleProps {
  badge: Badge
  isEarned: boolean
  earnedAt?: string
}

const ringColorByType: Record<string, string> = {
  streak:  'ring-tq-gold',
  quest:   'ring-tq-purple',
  monthly: 'ring-tq-teal',
  special: 'ring-tq-teal',
}

export function BadgeCircle({ badge, isEarned, earnedAt }: BadgeCircleProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const ringColor = ringColorByType[badge.badge_type] ?? 'ring-tq-border'

  return (
    <div className="relative flex flex-col items-center gap-1">
      <button
        className={[
          'w-16 h-16 rounded-full flex items-center justify-center',
          'transition-all duration-200',
          isEarned
            ? `bg-tq-surface ring-2 ${ringColor} shadow-sm`
            : 'bg-tq-surface-2 opacity-40 grayscale',
        ].join(' ')}
        onClick={() => isEarned && setShowTooltip(v => !v)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`${badge.name}${isEarned ? ' (earned)' : ' (not yet earned)'}`}
        type="button"
      >
        <span className="text-2xl" role="img" aria-hidden="true">
          {badge.icon ?? '🏅'}
        </span>
      </button>

      <span className={`text-[10px] font-bold text-center leading-tight max-w-[64px] ${isEarned ? 'text-tq-text-sec' : 'text-tq-text-muted'}`}>
        {badge.name}
      </span>

      {/* Tooltip on tap */}
      {showTooltip && isEarned && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 w-40 bg-tq-surface-2 border border-tq-border rounded-xl p-3 text-center shadow-lg">
          <p className="font-bold text-tq-text text-xs">{badge.name}</p>
          {badge.description && (
            <p className="text-tq-text-sec text-xs mt-1">{badge.description}</p>
          )}
          {earnedAt && (
            <p className="text-tq-text-muted text-xs mt-1">
              Earned {new Date(earnedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
