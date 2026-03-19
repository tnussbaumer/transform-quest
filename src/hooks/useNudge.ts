import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { sendNudgePush } from '../lib/sendNudgePush'
import type { Nudge } from '../types/database'

interface NudgeState {
  todaysNudges: Nudge[]
  loading: boolean
  hasNudgedToday: (friendId: string) => boolean
  nudgeFriend: (toUserId: string, questDayId: string, fromDisplayName?: string) => Promise<void>
}

export function useNudge(): NudgeState {
  const [todaysNudges, setTodaysNudges] = useState<Nudge[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTodaysNudges = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Use UTC midnight to match the send_nudge RPC's date_trunc('day', NOW() AT TIME ZONE 'UTC')
      const now = new Date()
      const todayStartUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))

      const { data, error } = await supabase
        .from('nudges')
        .select('*')
        .eq('from_user', user.id)
        .gte('nudged_at', todayStartUTC.toISOString())

      if (error) {
        console.error('[Nudge] Fetch error:', error)
      }
      console.log('[Nudge] Fetched nudges since', todayStartUTC.toISOString(), '→', (data as Nudge[] | null)?.length ?? 0, 'results')
      setTodaysNudges((data as Nudge[] | null) ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTodaysNudges()
  }, [fetchTodaysNudges])

  function hasNudgedToday(friendId: string): boolean {
    return todaysNudges.some(n => n.to_user === friendId)
  }

  async function nudgeFriend(toUserId: string, questDayId: string, fromDisplayName?: string) {
    if (!questDayId) {
      console.error('[Nudge] No questDayId — cannot nudge without an active quest day')
      return
    }
    console.log('[Nudge] Calling send_nudge with:', { toUserId, questDayId })
    const { data, error: rpcError } = await supabase.rpc('send_nudge', {
      p_to_user_id: toUserId,
      p_quest_day_id: questDayId,
    })
    console.log('[Nudge] RPC response — data:', JSON.stringify(data), 'error:', JSON.stringify(rpcError))
    if (rpcError) {
      console.error('[Nudge] RPC error:', rpcError)
      throw new Error(rpcError.message)
    }
    const result = data as { success: boolean; reason?: string } | null
    // Always refetch — even if already_nudged_today, we want the UI to reflect it
    await fetchTodaysNudges()
    if (result && !result.success && result.reason !== 'already_nudged_today') {
      throw new Error(result.reason ?? 'Could not send nudge')
    }
    // Fire-and-forget push notification to the nudged user
    // If data is null (no error), treat as success — RPC completed without error
    const succeeded = result?.success ?? (rpcError === null)
    if (succeeded && fromDisplayName) {
      sendNudgePush(toUserId, fromDisplayName)
    }
  }

  return { todaysNudges, loading, hasNudgedToday, nudgeFriend }
}
