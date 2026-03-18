import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Avatar } from '../profile/Avatar'
import type { FriendWithProfile } from '../../types/database'

interface FriendActivitySnippetProps {
  friends: FriendWithProfile[]
  completedTodayIds?: Set<string>
}

export function FriendActivitySnippet({ friends, completedTodayIds }: FriendActivitySnippetProps) {
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

  const completedCount = completedTodayIds
    ? friends.filter(f => completedTodayIds.has(f.friend.id)).length
    : 0
  const displayFriends = friends.slice(0, 3)

  return (
    <button
      onClick={() => navigate('/friends')}
      className="w-full bg-tq-surface rounded-2xl p-4 border border-tq-border/50 text-left hover:bg-tq-surface-2 transition-colors"
      aria-label={`${completedCount} friends completed today`}
    >
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2 flex-shrink-0">
          {displayFriends.map(f => (
            <Avatar
              key={f.friend.id}
              profile={f.friend}
              size="sm"
              className="border-2 !border-tq-surface"
            />
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
