import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile, Completion } from '../types/database'

interface ProfileState {
  profile: Profile | null
  completions: Completion[]
  loading: boolean
  refetch: () => Promise<void>
}

export function useProfile(): ProfileState {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [completions, setCompletions] = useState<Completion[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileResult, completionsResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('completions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }),
      ])

      setProfile(profileResult.data as Profile | null)
      setCompletions((completionsResult.data as Completion[] | null) ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { profile, completions, loading, refetch: fetchData }
}
