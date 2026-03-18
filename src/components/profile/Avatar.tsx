const PRESET_AVATARS: Record<string, { emoji: string; bg: string }> = {
  lion:     { emoji: '🦁', bg: 'from-[#E09800] to-[#FFB830]' },
  eagle:    { emoji: '🦅', bg: 'from-[#009B82] to-[#00C9A7]' },
  flame:    { emoji: '🔥', bg: 'from-[#FF6B35] to-[#FFB830]' },
  shield:   { emoji: '🛡️', bg: 'from-[#7340E0] to-[#8B5CF6]' },
  mountain: { emoji: '⛰️', bg: 'from-[#009B82] to-[#00C9A7]/80' },
  star:     { emoji: '⭐', bg: 'from-[#FFB830] to-[#FFD470]' },
  compass:  { emoji: '🧭', bg: 'from-[#00C9A7] to-[#33FFD4]' },
  crown:    { emoji: '👑', bg: 'from-[#8B5CF6] to-[#A78BFA]' },
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
