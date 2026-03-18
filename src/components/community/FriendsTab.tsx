import { useState, useEffect } from 'react'
import { Search, UserPlus, QrCode } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useFriends } from '../../hooks/useFriends'
import { useNudge } from '../../hooks/useNudge'
import { useQuest } from '../../hooks/useQuest'
import { supabase } from '../../lib/supabase'
import { Avatar } from '../profile/Avatar'
import { PendingRequests } from '../friends/PendingRequests'
import { FriendsList } from '../friends/FriendsList'
import { QRCodeModal } from './QRCodeModal'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'
import type { DiscoverableUser } from '../../hooks/useFriends'

export function FriendsTab() {
  const { profile } = useAuth()
  const { friends, pendingIncoming, pendingSent, discoverableUsers, loading, sendFriendRequest, acceptFriend, declineFriend } = useFriends()
  const { questDay } = useQuest()
  const { hasNudgedToday, nudgeFriend } = useNudge()
  const [searchQuery, setSearchQuery] = useState('')
  const [sendingTo, setSendingTo] = useState<string | null>(null)
  const [completedTodayIds, setCompletedTodayIds] = useState<Set<string>>(new Set())
  const [qrModalOpen, setQrModalOpen] = useState(false)

  // Fetch which friends completed today's quest day
  useEffect(() => {
    if (!questDay?.id) return
    supabase
      .from('completions')
      .select('user_id')
      .eq('quest_day_id', questDay.id)
      .then(({ data }) => {
        const ids = new Set(((data as { user_id: string }[]) ?? []).map(c => c.user_id))
        setCompletedTodayIds(ids)
      })
  }, [questDay?.id])

  if (!profile) return null

  const sentToIds = new Set(pendingSent.map(r => r.user_b))

  const filteredUsers = searchQuery.trim()
    ? discoverableUsers.filter(u =>
        u.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : discoverableUsers

  async function handleSendRequest(user: DiscoverableUser) {
    setSendingTo(user.id)
    try {
      await sendFriendRequest(user.id)
    } catch {
      // silently handle
    } finally {
      setSendingTo(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* My QR Code button */}
      {profile.invite_code && (
        <button
          onClick={() => setQrModalOpen(true)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-tq-surface border border-tq-border/50 hover:bg-tq-surface-2 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-tq-purple/20 flex items-center justify-center flex-shrink-0">
            <QrCode size={20} className="text-tq-purple" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-tq-text">My QR Code</p>
            <p className="text-xs text-tq-text-muted">Friends can scan to add you</p>
          </div>
        </button>
      )}

      <QRCodeModal open={qrModalOpen} onClose={() => setQrModalOpen(false)} />

      {/* Incoming requests */}
      <PendingRequests
        requests={pendingIncoming}
        onAccept={acceptFriend}
        onDecline={declineFriend}
      />

      {/* Friend discovery */}
      <section aria-label="Find friends">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-3">
          Find Friends
        </h2>
        <Card>
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tq-text-muted" />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="!pl-9"
                aria-label="Search for friends"
              />
            </div>

            {loading ? (
              <div className="h-20 flex items-center justify-center">
                <span className="text-tq-text-muted text-sm">Loading...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-tq-text-muted text-sm">
                  {searchQuery ? 'No users found' : 'Everyone is already your friend!'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-tq-border/40 max-h-64 overflow-y-auto">
                {filteredUsers.map(user => {
                  const alreadySent = sentToIds.has(user.id)
                  const isSending = sendingTo === user.id

                  return (
                    <div key={user.id} className="flex items-center gap-3 py-3">
                      <Avatar profile={user} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-tq-text text-sm truncate">{user.display_name}</p>
                        <p className="text-tq-text-muted text-xs">{user.level_title}</p>
                      </div>
                      <button
                        onClick={() => handleSendRequest(user)}
                        disabled={alreadySent || isSending}
                        className={[
                          'flex-shrink-0 flex items-center gap-1.5',
                          'px-3 h-9 rounded-xl text-xs font-bold',
                          'transition-all duration-200',
                          alreadySent
                            ? 'bg-tq-surface-2 text-tq-text-muted cursor-not-allowed'
                            : 'bg-tq-teal text-tq-bg hover:bg-tq-teal-light active:scale-95',
                          isSending ? 'opacity-60' : '',
                        ].join(' ')}
                        aria-label={alreadySent ? 'Request sent' : `Add ${user.display_name}`}
                      >
                        {alreadySent ? (
                          'Requested'
                        ) : (
                          <>
                            <UserPlus size={14} />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Friends list */}
      <section aria-label="Friend streaks">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-3">
          Friend Streaks
        </h2>
        {loading ? (
          <Card>
            <div className="h-20 flex items-center justify-center">
              <span className="text-tq-text-muted text-sm">Loading...</span>
            </div>
          </Card>
        ) : (
          <Card>
            <FriendsList
              friends={friends}
              hasNudgedToday={hasNudgedToday}
              onNudge={(toUserId, questDayId) => nudgeFriend(toUserId, questDayId, profile?.display_name)}
              currentQuestDayId={questDay?.id}
              completedTodayIds={completedTodayIds}
            />
          </Card>
        )}
      </section>
    </div>
  )
}
