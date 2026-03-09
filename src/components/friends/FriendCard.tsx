import { Flame, Check } from 'lucide-react'
import { isCompletedToday } from '../../lib/streakUtils'
import type { FriendWithProfile } from '../../types/database'

interface FriendCardProps {
  friendship: FriendWithProfile
  hasNudgedToday: boolean
  onNudge: () => void
  nudging?: boolean
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function FriendCard({ friendship, hasNudgedToday, onNudge, nudging = false }: FriendCardProps) {
  const { friend, mutual_streak } = friendship
  const completedToday = isCompletedToday(friend.last_completed_at)

  return (
    <div className="flex items-center gap-3 py-3 px-1">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full bg-tq-purple flex-shrink-0 flex items-center justify-center border border-tq-border"
        aria-hidden="true"
      >
        {friend.avatar_url ? (
          <img src={friend.avatar_url} alt={friend.display_name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-sm font-extrabold text-white">{getInitials(friend.display_name)}</span>
        )}
      </div>

      {/* Name + streak info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-tq-text text-sm truncate">{friend.display_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`flex items-center gap-1 text-xs font-semibold ${completedToday ? 'text-tq-gold' : 'text-tq-text-muted'}`}>
            <Flame size={12} />
            {friend.current_streak}
          </span>
          {completedToday && (
            <span className="flex items-center gap-1 text-xs font-semibold text-tq-success">
              <Check size={12} strokeWidth={3} />
              Done today
            </span>
          )}
          {mutual_streak > 0 && (
            <span className="text-xs font-semibold text-tq-gold-light">
              🔥 {mutual_streak} together
            </span>
          )}
        </div>
      </div>

      {/* Nudge button — only if friend hasn't completed today */}
      {!completedToday && (
        <button
          onClick={onNudge}
          disabled={hasNudgedToday || nudging}
          className={[
            'flex-shrink-0 flex items-center gap-1.5',
            'px-3 h-9 rounded-lg text-xs font-bold',
            'border-l-4 border-tq-teal bg-tq-surface-2',
            'transition-all duration-200',
            hasNudgedToday || nudging
              ? 'text-tq-text-muted cursor-not-allowed opacity-60'
              : 'text-tq-teal hover:bg-tq-surface',
          ].join(' ')}
          aria-label={hasNudgedToday ? 'Already nudged today' : `Nudge ${friend.display_name}`}
        >
          {hasNudgedToday ? '✓ Nudged' : '👋 Nudge'}
        </button>
      )}
    </div>
  )
}
