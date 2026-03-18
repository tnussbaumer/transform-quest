import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, Completion } from '../types/database'

export interface AdminStats {
  totalUsers: number
  activeToday: number
  avgStreak: number
  completionRate: number
  profiles: Profile[]
  completions: Completion[]
  /** Set of user IDs who completed today's quest day */
  completedTodayUserIds: Set<string>
  loading: boolean
  refetch: () => Promise<void>
}

export function useAdminStats(): AdminStats {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [completedTodayUserIds, setCompletedTodayUserIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)

    const [profilesRes, completionsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('current_streak', { ascending: false }),
      supabase.from('completions').select('*'),
    ])

    const fetchedProfiles = (profilesRes.data ?? []) as Profile[]
    const fetchedCompletions = (completionsRes.data ?? []) as Completion[]

    setProfiles(fetchedProfiles)
    setCompletions(fetchedCompletions)

    // Determine who completed today by checking completions for today's quest day
    // (same approach as useQuest — avoids timezone issues with last_completed_at)
    try {
      const { data: questData } = await supabase
        .from('quests')
        .select('id, start_date')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      const quests = questData as { id: string; start_date: string }[] | null
      if (quests && quests.length > 0) {
        const quest = quests[0]
        const start = new Date(quest.start_date)
        const today = new Date()
        start.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)
        const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        const currentDay = Math.max(1, Math.min(diffDays + 1, 30))

        const { data: dayData } = await supabase
          .from('quest_days')
          .select('id')
          .eq('quest_id', quest.id)
          .eq('day_number', currentDay)
          .maybeSingle()

        if (dayData) {
          const questDayId = (dayData as { id: string }).id
          const { data: todayCompletions } = await supabase
            .from('completions')
            .select('user_id')
            .eq('quest_day_id', questDayId)

          setCompletedTodayUserIds(
            new Set(((todayCompletions as { user_id: string }[]) ?? []).map(c => c.user_id))
          )
        }
      }
    } catch (err) {
      console.error('Failed to fetch today completions:', err)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const totalUsers = profiles.length
  const activeToday = completedTodayUserIds.size
  const avgStreak =
    totalUsers > 0
      ? Math.round((profiles.reduce((sum, p) => sum + p.current_streak, 0) / totalUsers) * 10) / 10
      : 0
  const completionRate = totalUsers > 0 ? Math.round(((activeToday / totalUsers) * 100) * 10) / 10 : 0

  return {
    totalUsers,
    activeToday,
    avgStreak,
    completionRate,
    profiles,
    completions,
    completedTodayUserIds,
    loading,
    refetch,
  }
}
