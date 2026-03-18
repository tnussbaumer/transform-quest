const PRESET_AVATARS: Record<string, { emoji: string; bg: string }> = {
  lion:     { emoji: '🦁', bg: 'from-amber-600 to-amber-800' },
  eagle:    { emoji: '🦅', bg: 'from-sky-600 to-sky-800' },
  flame:    { emoji: '🔥', bg: 'from-orange-500 to-red-700' },
  shield:   { emoji: '🛡️', bg: 'from-indigo-500 to-indigo-800' },
  mountain: { emoji: '⛰️', bg: 'from-emerald-600 to-emerald-900' },
  star:     { emoji: '⭐', bg: 'from-yellow-500 to-amber-700' },
  compass:  { emoji: '🧭', bg: 'from-teal-500 to-teal-800' },
  crown:    { emoji: '👑', bg: 'from-purple-500 to-purple-800' },
}

export { PRESET_AVATARS }

const SIZE_MAP = {
  sm: { container: 'w-8 h-8', emoji: 'text-sm', initials: 'text-xs' },
  md: { container: 'w-12 h-12', emoji: 'text-xl', initials: 'text-sm' },
  lg: { container: 'w-20 h-20', emoji: 'text-3xl', initials: 'text-2xl' },
}

interface AvatarProps {
  profile: {
    avatar_type?: 'preset' | 'custom'
    avatar_preset?: string
    avatar_url?: string | null
    display_name: string
  }
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function Avatar({ profile, size = 'md', className = '' }: AvatarProps) {
  const s = SIZE_MAP[size]

  // Custom uploaded photo
  if (profile.avatar_type === 'custom' && profile.avatar_url) {
    return (
      <div className={`${s.container} rounded-full overflow-hidden flex-shrink-0 border-2 border-tq-border ${className}`}>
        <img
          src={profile.avatar_url}
          alt={profile.display_name}
          className="w-full h-full object-cover object-top"
        />
      </div>
    )
  }

  // Preset avatar
  const preset = profile.avatar_preset && profile.avatar_preset !== 'default'
    ? PRESET_AVATARS[profile.avatar_preset]
    : null

  if (preset) {
    return (
      <div
        className={`${s.container} rounded-full bg-gradient-to-br ${preset.bg} flex items-center justify-center flex-shrink-0 border-2 border-white/10 ${className}`}
        aria-label={`${profile.display_name}'s avatar`}
      >
        <span className={s.emoji}>{preset.emoji}</span>
      </div>
    )
  }

  // Fallback: initials
  return (
    <div
      className={`${s.container} rounded-full bg-tq-purple flex items-center justify-center flex-shrink-0 border-2 border-tq-border ${className}`}
      aria-label={`${profile.display_name}'s avatar`}
    >
      <span className={`${s.initials} font-extrabold text-white`}>
        {getInitials(profile.display_name)}
      </span>
    </div>
  )
}
