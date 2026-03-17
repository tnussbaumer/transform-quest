import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { isCompletedToday } from '../lib/streakUtils'
import type { Profile, Completion } from '../types/database'

export interface AdminStats {
  totalUsers: number
  activeToday: number
  avgStreak: number
  completionRate: number
  profiles: Profile[]
  completions: Completion[]
  loading: boolean
  refetch: () => Promise<void>
}

export function useAdminStats(): AdminStats {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
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
    setLoading(false)
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  const totalUsers = profiles.length
  const activeToday = profiles.filter((p) => isCompletedToday(p.last_completed_at)).length
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
    loading,
    refetch,
  }
}
