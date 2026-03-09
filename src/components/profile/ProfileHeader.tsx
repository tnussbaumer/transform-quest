import type { Profile } from '../../types/database'

interface ProfileHeaderProps {
  profile: Profile
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      {/* Avatar */}
      <div
        className="w-20 h-20 rounded-full bg-tq-purple flex items-center justify-center border-2 border-tq-border"
        aria-label={`Avatar for ${profile.display_name}`}
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.display_name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-2xl font-extrabold text-white">
            {getInitials(profile.display_name)}
          </span>
        )}
      </div>

      {/* Name + level */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold text-tq-text">{profile.display_name}</h1>
        <p className="text-tq-teal text-sm font-bold mt-0.5">{profile.level_title}</p>
        <p className="text-tq-text-muted text-xs mt-1">Member since {joinDate}</p>
      </div>
    </div>
  )
}
