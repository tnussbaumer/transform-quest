import type { Profile } from '../../types/database'
import { Avatar } from './Avatar'
import { xpToNextLevel, formatXp } from '../../lib/levelUtils'

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const xpNeeded = xpToNextLevel(profile.total_xp)
  const xpProgress = xpNeeded !== null
    ? 1 - (xpNeeded / (profile.total_xp + xpNeeded))
    : 1

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <Avatar profile={profile} size="lg" />

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-tq-text truncate max-w-[280px]">{profile.display_name}</h1>
        <p className="text-tq-teal text-sm font-bold mt-0.5">{profile.level_title}</p>

        {/* XP Progress Bar */}
        <div className="mt-2 w-40 mx-auto">
          <div className="h-1.5 bg-tq-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full gradient-quest rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.round(xpProgress * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-tq-text-muted mt-1">
            {formatXp(profile.total_xp)} XP{xpNeeded !== null ? ` — ${formatXp(xpNeeded)} to next level` : ' — Max level!'}
          </p>
        </div>

        <p className="text-tq-text-muted text-xs mt-1">Member since {joinDate}</p>
      </div>
    </div>
  )
}
