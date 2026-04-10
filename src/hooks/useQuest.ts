import { useState, useEffect, useCallback } from 'react'
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
  refetch: () => Promise<void>
}

export function useQuest(): QuestState {
  const [quest, setQuest] = useState<Quest | null>(null)
  const [questDay, setQuestDay] = useState<QuestDay | null>(null)
  const [dayNumber, setDayNumber] = useState(0)
  const [totalDays, setTotalDays] = useState(0)
  const [isCurrentDayCompleted, setIsCurrentDayCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
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

        // Calendar-based max day (how far along the quest is by date)
        const calendarDay = Math.max(1, Math.min(diffDays + 1, totalDayCount))

        const { data: { user } } = await supabase.auth.getUser()

        let currentDay = calendarDay
        const completedQuestDayIds = new Set<string>()

        if (user && days && days.length > 0) {
          // Fetch user's completions for this quest to find their actual progress
          const dayIds = days.map(d => d.id)
          const { data: completions } = await supabase
            .from('completions')
            .select('quest_day_id')
            .eq('user_id', user.id)
            .in('quest_day_id', dayIds)

          for (const c of ((completions ?? []) as { quest_day_id: string }[])) {
            completedQuestDayIds.add(c.quest_day_id)
          }

          // Show the first uncompleted day within the calendar range,
          // so users can't skip ahead but also don't get forced past missed days
          const firstUncompleted = days
            .filter(d => d.day_number <= calendarDay && !completedQuestDayIds.has(d.id))
            .sort((a, b) => a.day_number - b.day_number)[0]

          if (firstUncompleted) {
            currentDay = firstUncompleted.day_number
          }
          // If all days up to calendarDay are completed, keep calendarDay (shows as done)
        }

        setDayNumber(currentDay)

        // Find today's quest_day
        const todayDay = days?.find(d => d.day_number === currentDay) ?? null
        setQuestDay(todayDay)

        // Check completion using the set we already built (avoids extra query)
        if (todayDay) {
          setIsCurrentDayCompleted(completedQuestDayIds.has(todayDay.id))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load quest')
      } finally {
        setLoading(false)
      }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { quest, questDay, dayNumber, totalDays, isCurrentDayCompleted, loading, error, refetch: load }
}
