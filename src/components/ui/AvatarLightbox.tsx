import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

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

interface LightboxUser {
  display_name: string
  avatar_url?: string | null
  avatar_type?: 'preset' | 'custom'
  avatar_preset?: string
  level_title?: string
  current_streak?: number
}

interface AvatarLightboxProps {
  user: LightboxUser | null
  onClose: () => void
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function AvatarLightbox({ user, onClose }: AvatarLightboxProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (user) {
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [user])

  if (!user) return null

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 150)
  }

  // Render the large avatar directly (not via Avatar component)
  // to control object-fit properly at 200px
  const preset = user.avatar_preset && user.avatar_preset !== 'default'
    ? PRESET_AVATARS[user.avatar_preset]
    : null
  const isCustomPhoto = user.avatar_type === 'custom' && user.avatar_url

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      />

      {/* Content */}
      <div
        className="relative flex flex-col items-center gap-4 transition-all duration-200"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.85)',
          opacity: visible ? 1 : 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Large avatar — rendered inline for proper cropping */}
        <div className="w-[200px] h-[200px] rounded-full border-[3px] border-white/80 glow-purple overflow-hidden flex-shrink-0 bg-tq-surface">
          {isCustomPhoto ? (
            <img
              src={user.avatar_url!}
              alt={user.display_name}
              className="w-[200px] h-[200px] object-cover object-center"
            />
          ) : preset ? (
            <div className={`w-full h-full bg-gradient-to-br ${preset.bg} flex items-center justify-center`}>
              <span className="text-7xl">{preset.emoji}</span>
            </div>
          ) : (
            <div className="w-full h-full bg-tq-purple flex items-center justify-center">
              <span className="text-6xl font-extrabold text-white">
                {getInitials(user.display_name)}
              </span>
            </div>
          )}
        </div>

        {/* Name */}
        <h2 className="text-2xl font-extrabold text-white text-center">
          {user.display_name}
        </h2>

        {/* Level */}
        {user.level_title && (
          <p className="text-sm font-bold text-tq-purple-light -mt-2">
            {user.level_title}
          </p>
        )}

        {/* Streak */}
        {user.current_streak !== undefined && user.current_streak > 0 && (
          <div className="flex items-center gap-1.5 -mt-1">
            <Flame size={16} className="text-tq-gold" />
            <span className="text-sm font-extrabold text-tq-gold tabular-nums">
              {user.current_streak} day streak
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
