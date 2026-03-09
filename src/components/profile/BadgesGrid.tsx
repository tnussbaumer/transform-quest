import { BadgeCircle } from './BadgeCircle'
import type { Badge, UserBadge } from '../../types/database'

interface BadgesGridProps {
  allBadges: Badge[]
  earnedBadges: UserBadge[]
}

export function BadgesGrid({ allBadges, earnedBadges }: BadgesGridProps) {
  const earnedMap = new Map(earnedBadges.map(ub => [ub.badge_id, ub]))

  if (allBadges.length === 0) {
    return (
      <p className="text-tq-text-muted text-sm text-center py-4">
        No badges available yet.
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-4">
      {allBadges.map(badge => {
        const earned = earnedMap.get(badge.id)
        return (
          <BadgeCircle
            key={badge.id}
            badge={badge}
            isEarned={!!earned}
            earnedAt={earned?.earned_at}
          />
        )
      })}
    </div>
  )
}
