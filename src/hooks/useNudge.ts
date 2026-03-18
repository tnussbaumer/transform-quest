import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Nudge } from '../types/database'

interface NudgeState {
  todaysNudges: Nudge[]
  loading: boolean
  hasNudgedToday: (friendId: string) => boolean
  nudgeFriend: (toUserId: string, questDayId: string) => Promise<void>
}

export function useNudge(): NudgeState {
  const [todaysNudges, setTodaysNudges] = useState<Nudge[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTodaysNudges = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('nudges')
        .select('*')
        .eq('from_user', user.id)
        .gte('nudged_at', todayStart.toISOString())

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

  async function nudgeFriend(toUserId: string, questDayId: string) {
    const { data } = await supabase.rpc('send_nudge', {
      p_to_user_id: toUserId,
      p_quest_day_id: questDayId,
    })
    const result = data as { success: boolean; reason?: string } | null
    // Always refetch — even if already_nudged_today, we want the UI to reflect it
    await fetchTodaysNudges()
    if (result && !result.success && result.reason !== 'already_nudged_today') {
      throw new Error(result.reason ?? 'Could not send nudge')
    }
  }

  return { todaysNudges, loading, hasNudgedToday, nudgeFriend }
}
