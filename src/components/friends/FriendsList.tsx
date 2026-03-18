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
        <div className="text-4xl mb-1">👥</div>
        <p className="font-bold text-tq-text text-lg">No friends yet</p>
        <p className="text-tq-text-sec text-sm max-w-[240px]">
          Find people from your group above and add them as friends!
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
