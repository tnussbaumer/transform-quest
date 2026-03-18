import type { Profile } from '../../types/database'
import { Avatar } from './Avatar'

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <Avatar profile={profile} size="lg" />

      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-tq-text">{profile.display_name}</h1>
        <p className="text-tq-teal text-sm font-bold mt-0.5">{profile.level_title}</p>
        <p className="text-tq-text-muted text-xs mt-1">Member since {joinDate}</p>
      </div>
    </div>
  )
}
