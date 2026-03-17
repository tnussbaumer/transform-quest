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
  loading: boolean
}

export function useQuestHistory(): QuestHistoryState {
  const [activeQuests, setActiveQuests] = useState<QuestWithProgress[]>([])
  const [completedQuests, setCompletedQuests] = useState<QuestWithProgress[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all quests
      const { data: questsData } = await supabase
        .from('quests')
        .select('*')
        .order('start_date', { ascending: false })
      const quests = (questsData ?? []) as Quest[]

      // Fetch all quest_days
      const { data: daysData } = await supabase
        .from('quest_days')
        .select('*')
        .order('day_number', { ascending: true })
      const allDays = (daysData ?? []) as QuestDay[]

      // Fetch user's completions
      const { data: compData } = await supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id)
      const completions = (compData ?? []) as Completion[]

      const completedDayIds = new Set(completions.map(c => c.quest_day_id))

      const active: QuestWithProgress[] = []
      const completed: QuestWithProgress[] = []

      for (const q of quests) {
        const questDays = allDays.filter(d => d.quest_id === q.id)
        const totalDays = questDays.length
        const completedDays = questDays.filter(d => completedDayIds.has(d.id)).length
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

  return { activeQuests, completedQuests, loading }
}
