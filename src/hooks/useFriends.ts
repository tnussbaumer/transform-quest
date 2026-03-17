import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { isCompletedToday } from '../lib/streakUtils'
import type { Friendship, FriendWithProfile, FriendProfile } from '../types/database'

interface FriendsState {
  friends: FriendWithProfile[]
  pendingIncoming: (Friendship & { sender: Pick<FriendProfile, 'id' | 'display_name'> })[]
  pendingSent: Friendship[]
  loading: boolean
  addFriend: (inviteCode: string) => Promise<void>
  acceptFriend: (friendshipId: string) => Promise<void>
  declineFriend: (friendshipId: string) => Promise<void>
  removeFriend: (friendshipId: string) => Promise<void>
  refetch: () => Promise<void>
}

export function useFriends(): FriendsState {
  const [friends, setFriends] = useState<FriendWithProfile[]>([])
  const [pendingIncoming, setPendingIncoming] = useState<FriendsState['pendingIncoming']>([])
  const [pendingSent, setPendingSent] = useState<Friendship[]>([])
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

      // Separate by status
      const accepted = rows.filter(r => r.status === 'accepted')
      const incoming = rows.filter(r => r.status === 'pending' && r.user_b === user.id)
      const sent     = rows.filter(r => r.status === 'pending' && r.user_a === user.id)

      setPendingSent(sent)

      // Fetch friend profiles for accepted friendships
      const friendIds = accepted.map(r => r.user_a === user.id ? r.user_b : r.user_a)

      let profiles: FriendProfile[] = []
      if (friendIds.length > 0) {
        const { data: pData } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, current_streak, last_completed_at, level_title')
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

      // Fetch sender profiles for incoming pending requests
      const senderIds = incoming.map(r => r.user_a)
      let senderProfiles: Pick<FriendProfile, 'id' | 'display_name'>[] = []
      if (senderIds.length > 0) {
        const { data: sData } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', senderIds)
        senderProfiles = (sData as Pick<FriendProfile, 'id' | 'display_name'>[] | null) ?? []
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
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function addFriend(inviteCode: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const trimmedCode = inviteCode.trim().toUpperCase()

    // Look up the user with that invite code
    const { data: target, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('invite_code', trimmedCode)
      .maybeSingle()

    if (error || !target) throw new Error('Invite code not found')

    const targetProfile = target as { id: string }

    if (targetProfile.id === user.id) throw new Error("You can't add yourself")

    // Check if friendship already exists in either direction
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_a.eq.${user.id},user_b.eq.${targetProfile.id}),and(user_a.eq.${targetProfile.id},user_b.eq.${user.id})`)
      .maybeSingle()

    if (existing) throw new Error('Already friends or request pending')

    await supabase
      .from('friendships')
      .insert({ user_a: user.id, user_b: targetProfile.id, status: 'pending' })

    // Fire badge check for Friendly (async, don't await)
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
    loading,
    addFriend,
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
