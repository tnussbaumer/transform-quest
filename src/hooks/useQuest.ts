import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Quest, QuestDay } from '../types/database'

interface QuestState {
  quest: Quest | null
  questDay: QuestDay | null
  dayNumber: number
  totalDays: number
  isCurrentDayCompleted: boolean
  loading: boolean
  error: string | null
}

export function useQuest(): QuestState {
  const [quest, setQuest] = useState<Quest | null>(null)
  const [questDay, setQuestDay] = useState<QuestDay | null>(null)
  const [dayNumber, setDayNumber] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [isCurrentDayCompleted, setIsCurrentDayCompleted] = useState(false)
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

        // Calculate day number from quest start_date vs today.
        // start_date is a DATE string "YYYY-MM-DD" — parse as local date parts
        // to avoid UTC-vs-local timezone mismatch.
        const [sy, sm, sd] = activeQuest.start_date.split('-').map(Number)
        const start = new Date(sy, sm - 1, sd)  // local midnight
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffMs = today.getTime() - start.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        console.log('[Quest] start_date raw:', activeQuest.start_date)
        console.log('[Quest] parsed start:', start.toISOString(), 'local today:', today.toISOString())
        console.log('[Quest] diffDays:', diffDays, '→ currentDay will be:', diffDays + 1)

        // Fetch all quest_days first so we know the total count for clamping
        const { data: daysData, error: dErr } = await supabase
          .from('quest_days')
          .select('*')
          .eq('quest_id', activeQuest.id)
          .order('day_number', { ascending: true })

        if (dErr) throw dErr
        const days = daysData as QuestDay[] | null
        const totalDayCount = days?.length ?? 0
        setTotalDays(totalDayCount)

        const currentDay = Math.max(1, Math.min(diffDays + 1, totalDayCount))

        setDayNumber(currentDay)

        // Find today's quest_day
        const todayDay = days?.find(d => d.day_number === currentDay) ?? null
        setQuestDay(todayDay)

        // Check completion in the SAME async flow — no race condition
        if (todayDay) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data: completion } = await supabase
              .from('completions')
              .select('id')
              .eq('user_id', user.id)
              .eq('quest_day_id', todayDay.id)
              .maybeSingle()
            setIsCurrentDayCompleted(!!completion)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quest')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return { quest, questDay, dayNumber, totalDays, isCurrentDayCompleted, loading, error }
}
