import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { JournalEntry } from '../types/database'

interface JournalState {
  entries: JournalEntry[]
  loading: boolean
  error: string | null
}

export function useJournal(): JournalState {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error: err } = await supabase
        .from('completions')
        .select('id, answer_1, answer_2, answer_3, xp_earned, completed_at, quest_days(passage_reference, day_number, quests(title))')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      if (err) {
        setError(err.message)
      } else {
        setEntries((data as unknown as JournalEntry[] | null) ?? [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { entries, loading, error }
}
