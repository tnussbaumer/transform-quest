import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

interface StreakFreezeState {
  needsFreeze: boolean
  freezesAvailable: number
  loading: boolean
  useFreeze: () => Promise<boolean>
  dismiss: () => void
}

export function useStreakFreeze(): StreakFreezeState {
  const { profile, user, patchProfile } = useAuth()
  const [needsFreeze, setNeedsFreeze] = useState(false)
  const [loading, setLoading] = useState(true)

  const freezesAvailable = profile?.streak_freezes_available ?? 0

  useEffect(() => {
    if (!profile || !user) {
      setLoading(false)
      return
    }

    // Check if streak is about to break
    if (
      profile.last_completed_at &&
      profile.current_streak > 0 &&
      profile.streak_freezes_available > 0
    ) {
      const lastDate = new Date(profile.last_completed_at)
      const now = new Date()
      lastDate.setHours(0, 0, 0, 0)
      now.setHours(0, 0, 0, 0)
      const diffDays = Math.floor(
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      // If they missed yesterday (2+ days gap), offer freeze
      setNeedsFreeze(diffDays >= 2)
    } else {
      setNeedsFreeze(false)
    }

    setLoading(false)
  }, [profile, user])

  async function useFreeze(): Promise<boolean> {
    const { data, error } = await supabase.rpc('use_streak_freeze')
    if (error) return false
    const result = data as { freeze_used: boolean; remaining_freezes?: number }
    if (result.freeze_used) {
      patchProfile({
        streak_freezes_available: result.remaining_freezes ?? freezesAvailable - 1,
      })
      setNeedsFreeze(false)
      return true
    }
    return false
  }

  function dismiss() {
    setNeedsFreeze(false)
  }

  return { needsFreeze, freezesAvailable, loading, useFreeze, dismiss }
}
