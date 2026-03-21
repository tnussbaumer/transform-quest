import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { Avatar } from '../profile/Avatar'

interface LightboxUser {
  display_name: string
  avatar_url: string | null
  avatar_type: 'preset' | 'custom'
  avatar_preset: string
  level_title?: string
  current_streak?: number
}

interface AvatarLightboxProps {
  user: LightboxUser | null
  onClose: () => void
}

export function AvatarLightbox({ user, onClose }: AvatarLightboxProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (user) {
      // Trigger entrance animation on next frame
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
    }
  }, [user])

  if (!user) return null

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 150) // wait for exit animation
  }

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
        {/* Large avatar */}
        <div className="rounded-full border-[3px] border-white/80 glow-purple overflow-hidden">
          <Avatar
            profile={user}
            size="lg"
            className="!w-[200px] !h-[200px] !text-6xl"
          />
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
