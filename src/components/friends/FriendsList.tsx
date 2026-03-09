import { Users } from 'lucide-react'
import { FriendCard } from './FriendCard'
import type { FriendWithProfile } from '../../types/database'

interface FriendsListProps {
  friends: FriendWithProfile[]
  hasNudgedToday: (friendId: string) => boolean
  onNudge: (toUserId: string, questDayId: string) => Promise<void>
  currentQuestDayId?: string
}

export function FriendsList({ friends, hasNudgedToday, onNudge, currentQuestDayId }: FriendsListProps) {
  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <div className="w-14 h-14 rounded-full bg-tq-surface-2 flex items-center justify-center">
          <Users size={28} className="text-tq-text-muted" />
        </div>
        <p className="font-bold text-tq-text">No friends yet</p>
        <p className="text-tq-text-sec text-sm max-w-[240px]">
          Share your invite code above to connect with friends from your group.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-tq-border/40">
      {friends.map(friendship => (
        <FriendCard
          key={friendship.id}
          friendship={friendship}
          hasNudgedToday={hasNudgedToday(friendship.friend.id)}
          onNudge={() => onNudge(friendship.friend.id, currentQuestDayId ?? '')}
        />
      ))}
    </div>
  )
}
