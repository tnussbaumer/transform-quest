import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Badge, UserBadge } from '../types/database'

interface BadgesState {
  allBadges: Badge[]
  earnedBadges: UserBadge[]
  loading: boolean
  hasBadge: (badgeId: string) => boolean
}

export function useBadges(): BadgesState {
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [badgesResult, userBadgesResult] = await Promise.all([
        supabase
          .from('badges')
          .select('*')
          .order('badge_type')
          .order('requirement_value', { nullsFirst: false }),
        supabase
          .from('user_badges')
          .select('*')
          .eq('user_id', user.id),
      ])

      setAllBadges((badgesResult.data as Badge[] | null) ?? [])
      setEarnedBadges((userBadgesResult.data as UserBadge[] | null) ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  function hasBadge(badgeId: string): boolean {
    return earnedBadges.some(ub => ub.badge_id === badgeId)
  }

  return { allBadges, earnedBadges, loading, hasBadge }
}
