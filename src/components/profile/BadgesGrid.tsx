import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { BadgeCircle } from './BadgeCircle'
import type { Badge, UserBadge } from '../../types/database'

interface BadgesGridProps {
  allBadges: Badge[]
  earnedBadges: UserBadge[]
  currentStreak?: number
}

/** Pick the next ~4 unearned badges the user is closest to earning */
function pickUpNext(allBadges: Badge[], earnedIds: Set<string>, currentStreak: number): Badge[] {
  const unearned = allBadges.filter(b => !earnedIds.has(b.id))
  const picked: Badge[] = []
  const pickedIds = new Set<string>()

  // 1. Next streak badge (based on current streak)
  const streakBadges = unearned
    .filter(b => b.badge_type === 'streak' && b.requirement_value !== null)
    .sort((a, b) => (a.requirement_value ?? 0) - (b.requirement_value ?? 0))
  const nextStreak = streakBadges.find(b => (b.requirement_value ?? 0) > currentStreak)
  if (nextStreak) {
    picked.push(nextStreak)
    pickedIds.add(nextStreak.id)
  }

  // 2. Next quest section badges (badge_type = 'quest', not yet earned)
  const questBadges = unearned.filter(b => b.badge_type === 'quest' && !pickedIds.has(b.id))
  for (const qb of questBadges) {
    if (picked.length >= 4) break
    picked.push(qb)
    pickedIds.add(qb.id)
  }

  // 3. Special badges (Encourager, Friendly, etc.)
  const specialBadges = unearned.filter(b => b.badge_type === 'special' && !pickedIds.has(b.id))
  for (const sb of specialBadges) {
    if (picked.length >= 4) break
    picked.push(sb)
    pickedIds.add(sb.id)
  }

  // 4. Fill remaining from any unearned
  if (picked.length < 4) {
    for (const b of unearned) {
      if (picked.length >= 4) break
      if (!pickedIds.has(b.id)) {
        picked.push(b)
        pickedIds.add(b.id)
      }
    }
  }

  return picked.slice(0, 4)
}

export function BadgesGrid({ allBadges, earnedBadges, currentStreak = 0 }: BadgesGridProps) {
  const [expanded, setExpanded] = useState(false)
  const earnedIds = new Set(earnedBadges.map(ub => ub.badge_id))
  const earnedMap = new Map(earnedBadges.map(ub => [ub.badge_id, ub]))

  const earned = allBadges.filter(b => earnedIds.has(b.id))
  const upNext = pickUpNext(allBadges, earnedIds, currentStreak)

  if (allBadges.length === 0) {
    return (
      <p className="text-tq-text-muted text-sm text-center py-4">
        No badges available yet.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {/* Earned badges */}
      {earned.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {earned.map(badge => (
            <BadgeCircle
              key={badge.id}
              badge={badge}
              isEarned={true}
              earnedAt={earnedMap.get(badge.id)?.earned_at}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-tq-text-muted text-sm">
            Complete your first reading to start earning badges!
          </p>
        </div>
      )}

      {/* Up Next (hidden when expanded to avoid duplicates) */}
      {upNext.length > 0 && !expanded && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-tq-text-sec mb-3">
            Up Next
          </p>
          <div className="flex flex-wrap gap-4">
            {upNext.map(badge => (
              <BadgeCircle
                key={badge.id}
                badge={badge}
                isEarned={false}
              />
            ))}
          </div>
        </div>
      )}

      {/* See all toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-tq-text-sec hover:text-tq-teal transition-colors min-h-[44px]"
        aria-expanded={expanded}
      >
        {expanded ? 'Show less' : `See all badges (${allBadges.length})`}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded: full grid */}
      {expanded && (
        <div className="flex flex-wrap gap-4">
          {allBadges.map(badge => {
            const ub = earnedMap.get(badge.id)
            return (
              <BadgeCircle
                key={badge.id}
                badge={badge}
                isEarned={!!ub}
                earnedAt={ub?.earned_at}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
