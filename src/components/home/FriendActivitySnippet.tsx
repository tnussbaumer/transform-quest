import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { isCompletedToday } from '../../lib/streakUtils'
import type { FriendWithProfile } from '../../types/database'

interface FriendActivitySnippetProps {
  friends: FriendWithProfile[]
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function FriendActivitySnippet({ friends }: FriendActivitySnippetProps) {
  const navigate = useNavigate()

  if (friends.length === 0) {
    return (
      <button
        onClick={() => navigate('/friends')}
        className="w-full bg-tq-surface rounded-2xl p-4 border border-tq-border/50 text-left hover:bg-tq-surface-2 transition-colors"
        aria-label="Add friends"
      >
        <div className="flex items-center justify-between">
          <p className="text-tq-text-sec text-sm font-semibold">
            Add friends to see their progress!
          </p>
          <span className="text-tq-teal text-sm font-bold flex-shrink-0 ml-2">
            Add Friends →
          </span>
        </div>
      </button>
    )
  }

  const completedCount = friends.filter(f => isCompletedToday(f.friend.last_completed_at)).length
  const displayFriends = friends.slice(0, 3)

  return (
    <button
      onClick={() => navigate('/friends')}
      className="w-full bg-tq-surface rounded-2xl p-4 border border-tq-border/50 text-left hover:bg-tq-surface-2 transition-colors"
      aria-label={`${completedCount} friends completed today`}
    >
      <div className="flex items-center gap-3">
        {/* Stacked mini avatars */}
        <div className="flex -space-x-2 flex-shrink-0">
          {displayFriends.map(f => (
            <div
              key={f.friend.id}
              className="w-8 h-8 rounded-full bg-tq-purple border-2 border-tq-surface flex items-center justify-center"
              aria-hidden="true"
            >
              {f.friend.avatar_url ? (
                <img src={f.friend.avatar_url} alt={f.friend.display_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xs font-extrabold text-white leading-none">
                  {getInitials(f.friend.display_name)}
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="flex-1 text-sm font-semibold text-tq-text-sec">
          <span className="text-tq-text font-bold">{completedCount}</span>
          {' '}friend{completedCount !== 1 ? 's' : ''} completed today
        </p>

        <ChevronRight size={16} className="text-tq-text-muted flex-shrink-0" />
      </div>
    </button>
  )
}
