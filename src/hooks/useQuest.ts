import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Quest, QuestDay } from '../types/database'

interface QuestState {
  quest: Quest | null
  questDay: QuestDay | null
  dayNumber: number
  totalDays: number
  loading: boolean
  error: string | null
}

export function useQuest(): QuestState {
  const [quest, setQuest] = useState<Quest | null>(null)
  const [questDay, setQuestDay] = useState<QuestDay | null>(null)
  const [dayNumber, setDayNumber] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        // Fetch the active quest
        const { data, error: qErr } = await supabase
          .from('quests')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)

        if (qErr) throw qErr
        const quests = data as Quest[] | null
        if (!quests || quests.length === 0) {
          setLoading(false)
          return
        }

        const activeQuest = quests[0]
        setQuest(activeQuest)

        // Calculate day number from quest start_date vs today
        const start = new Date(activeQuest.start_date)
        const today = new Date()
        start.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)
        const diffMs = today.getTime() - start.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const currentDay = Math.max(1, Math.min(diffDays + 1, 30))

        setDayNumber(currentDay)

        // Fetch all quest_days to know total count
        const { data: daysData, error: dErr } = await supabase
          .from('quest_days')
          .select('*')
          .eq('quest_id', activeQuest.id)
          .order('day_number', { ascending: true })

        if (dErr) throw dErr
        const days = daysData as QuestDay[] | null

        setTotalDays(days?.length ?? 0)

        // Find today's quest_day
        const todayDay = days?.find(d => d.day_number === currentDay) ?? null
        setQuestDay(todayDay)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quest')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { quest, questDay, dayNumber, totalDays, loading, error }
}
