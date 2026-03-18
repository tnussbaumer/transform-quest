import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { isCompletedToday } from '../lib/streakUtils'
import type { Friendship, FriendWithProfile, FriendProfile } from '../types/database'

// Sender profile fields for pending request display (includes avatar fields)
type SenderProfile = Pick<FriendProfile, 'id' | 'display_name' | 'avatar_url' | 'avatar_type' | 'avatar_preset'>

// Discovery user — any profile not already friended
export interface DiscoverableUser {
  id: string
  display_name: string
  avatar_url: string | null
  avatar_type: 'preset' | 'custom'
  avatar_preset: string
  level_title: string
}

interface FriendsState {
  friends: FriendWithProfile[]
  pendingIncoming: (Friendship & { sender: SenderProfile })[]
  pendingSent: Friendship[]
  discoverableUsers: DiscoverableUser[]
  loading: boolean
  sendFriendRequest: (targetUserId: string) => Promise<void>
  acceptFriend: (friendshipId: string) => Promise<void>
  declineFriend: (friendshipId: string) => Promise<void>
  removeFriend: (friendshipId: string) => Promise<void>
  refetch: () => Promise<void>
}

const PROFILE_FIELDS = 'id, display_name, avatar_url, avatar_type, avatar_preset, current_streak, last_completed_at, level_title'

export function useFriends(): FriendsState {
  const [friends, setFriends] = useState<FriendWithProfile[]>([])
  const [pendingIncoming, setPendingIncoming] = useState<FriendsState['pendingIncoming']>([])
  const [pendingSent, setPendingSent] = useState<Friendship[]>([])
  const [discoverableUsers, setDiscoverableUsers] = useState<DiscoverableUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all friendships involving this user
      const { data: raw } = await supabase
        .from('friendships')
        .select('*')
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .order('created_at', { ascending: false })

      const rows = (raw as Friendship[] | null) ?? []

      const accepted = rows.filter(r => r.status === 'accepted')
      const incoming = rows.filter(r => r.status === 'pending' && r.user_b === user.id)
      const sent     = rows.filter(r => r.status === 'pending' && r.user_a === user.id)

      setPendingSent(sent)

      // Fetch friend profiles for accepted friendships (with avatar fields)
      const friendIds = accepted.map(r => r.user_a === user.id ? r.user_b : r.user_a)

      let profiles: FriendProfile[] = []
      if (friendIds.length > 0) {
        const { data: pData } = await supabase
          .from('profiles')
          .select(PROFILE_FIELDS)
          .in('id', friendIds)
        profiles = (pData as FriendProfile[] | null) ?? []
      }

      const profileMap = new Map(profiles.map(p => [p.id, p]))

      const enriched: FriendWithProfile[] = accepted
        .map(r => {
          const friendId = r.user_a === user.id ? r.user_b : r.user_a
          const friend = profileMap.get(friendId)
          if (!friend) return null
          return { ...r, friend }
        })
        .filter((x): x is FriendWithProfile => x !== null)

      setFriends(enriched)

      // Fetch sender profiles for incoming pending requests (with avatar fields)
      const senderIds = incoming.map(r => r.user_a)
      let senderProfiles: SenderProfile[] = []
      if (senderIds.length > 0) {
        const { data: sData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, avatar_type, avatar_preset')
          .in('id', senderIds)
        senderProfiles = (sData as SenderProfile[] | null) ?? []
      }

      const senderMap = new Map(senderProfiles.map(p => [p.id, p]))
      const enrichedIncoming = incoming
        .map(r => {
          const sender = senderMap.get(r.user_a)
          if (!sender) return null
          return { ...r, sender }
        })
        .filter((x): x is FriendsState['pendingIncoming'][number] => x !== null)

      setPendingIncoming(enrichedIncoming)

      // Friend discovery: fetch all profiles, filter out self + anyone already connected
      const connectedIds = new Set<string>([user.id])
      for (const r of rows) {
        connectedIds.add(r.user_a)
        connectedIds.add(r.user_b)
      }

      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, avatar_type, avatar_preset, level_title')
        .order('display_name')

      const discoverable = ((allProfiles as DiscoverableUser[] | null) ?? [])
        .filter(p => !connectedIds.has(p.id))

      setDiscoverableUsers(discoverable)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function sendFriendRequest(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    if (targetUserId === user.id) throw new Error("You can't add yourself")

    await supabase
      .from('friendships')
      .insert({ user_a: user.id, user_b: targetUserId, status: 'pending' })

    // Fire badge check (async, don't await)
    supabase.rpc('check_and_award_badges', { p_user_id: user.id }).then(() => {})

    await fetchData()
  }

  async function acceptFriend(friendshipId: string) {
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) supabase.rpc('check_and_award_badges', { p_user_id: user.id }).then(() => {})

    await fetchData()
  }

  async function declineFriend(friendshipId: string) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    await fetchData()
  }

  async function removeFriend(friendshipId: string) {
    await supabase.from('friendships').delete().eq('id', friendshipId)
    await fetchData()
  }

  return {
    friends,
    pendingIncoming,
    pendingSent,
    discoverableUsers,
    loading,
    sendFriendRequest,
    acceptFriend,
    declineFriend,
    removeFriend,
    refetch: fetchData,
  }
}

// Re-export for components
export function isFriendCompletedToday(lastCompletedAt: string | null): boolean {
  return isCompletedToday(lastCompletedAt)
}
