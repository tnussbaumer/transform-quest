import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Quest, QuestDay, Completion } from '../types/database'

interface QuestWithProgress extends Quest {
  totalDays: number
  completedDays: number
  completionPercent: number
  questDays: QuestDay[]
}

interface QuestHistoryState {
  activeQuests: QuestWithProgress[]
  completedQuests: QuestWithProgress[]
  completedDayIds: Set<string>
  loading: boolean
  refetch: () => Promise<void>
}

export function useQuestHistory(): QuestHistoryState {
  const [activeQuests, setActiveQuests] = useState<QuestWithProgress[]>([])
  const [completedQuests, setCompletedQuests] = useState<QuestWithProgress[]>([])
  const [completedDayIds, setCompletedDayIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all quests
      const { data: questsData, error: questsErr } = await supabase
        .from('quests')
        .select('*')
        .order('start_date', { ascending: false })
      if (questsErr) console.error('useQuestHistory: quests query failed', questsErr)
      const quests = (questsData ?? []) as Quest[]

      // Fetch all quest_days
      const { data: daysData, error: daysErr } = await supabase
        .from('quest_days')
        .select('*')
        .order('day_number', { ascending: true })
      if (daysErr) console.error('useQuestHistory: quest_days query failed', daysErr)
      const allDays = (daysData ?? []) as QuestDay[]

      // Fetch user's completions
      const { data: compData, error: compErr } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id)
      if (compErr) console.error('useQuestHistory: completions query failed', compErr)
      const completions = (compData ?? []) as Completion[]

      const dayIds = new Set(completions.map(c => c.quest_day_id))
      setCompletedDayIds(dayIds)

      const active: QuestWithProgress[] = []
      const completed: QuestWithProgress[] = []

      for (const q of quests) {
        const questDays = allDays.filter(d => d.quest_id === q.id)
        const totalDays = questDays.length
        const completedDays = questDays.filter(d => dayIds.has(d.id)).length
        const completionPercent = totalDays > 0
          ? Math.round((completedDays / totalDays) * 100)
          : 0

        const entry: QuestWithProgress = {
          ...q,
          totalDays,
          completedDays,
          completionPercent,
          questDays,
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const endDate = new Date(q.end_date)
        endDate.setHours(0, 0, 0, 0)

        if (q.is_active && endDate >= today) {
          active.push(entry)
        } else {
          completed.push(entry)
        }
      }

      setActiveQuests(active)
      setCompletedQuests(completed)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { activeQuests, completedQuests, completedDayIds, loading, refetch: load }
}
