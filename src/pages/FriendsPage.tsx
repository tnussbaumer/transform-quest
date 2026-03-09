import { useAuth } from '../hooks/useAuth'
import { useFriends } from '../hooks/useFriends'
import { useNudge } from '../hooks/useNudge'
import { useQuest } from '../hooks/useQuest'
import { AddFriendSection } from '../components/friends/AddFriendSection'
import { PendingRequests } from '../components/friends/PendingRequests'
import { FriendsList } from '../components/friends/FriendsList'
import { Card } from '../components/ui/Card'

export function FriendsPage() {
  const { profile } = useAuth()
  const { friends, pendingIncoming, loading, addFriend, acceptFriend, declineFriend } = useFriends()
  const { questDay } = useQuest()
  const { hasNudgedToday, nudgeFriend } = useNudge()

  if (!profile) return null

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-tq-text">Friends</h1>

      {/* Add friend + your code */}
      <section aria-label="Add friends">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-3">
          Add Friend
        </h2>
        <Card>
          <AddFriendSection profile={profile} onAdd={addFriend} />
        </Card>
      </section>

      {/* Incoming requests */}
      <PendingRequests
        requests={pendingIncoming}
        onAccept={acceptFriend}
        onDecline={declineFriend}
      />

      {/* Friends list */}
      <section aria-label="Friend streaks">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-3">
          Friend Streaks
        </h2>
        {loading ? (
          <Card>
            <div className="h-20 flex items-center justify-center">
              <span className="text-tq-text-muted text-sm">Loading…</span>
            </div>
          </Card>
        ) : (
          <Card>
            <FriendsList
              friends={friends}
              hasNudgedToday={hasNudgedToday}
              onNudge={nudgeFriend}
              currentQuestDayId={questDay?.id}
            />
          </Card>
        )}
      </section>
    </div>
  )
}
