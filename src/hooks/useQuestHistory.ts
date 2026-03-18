import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Quest, QuestDay } from '../types/database'

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

// Quest day row with embedded completions from Supabase join
interface QuestDayWithCompletions extends QuestDay {
  completions: { id: string }[]
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

      // Fetch only active quests (is_active = true)
      // Inactive quests (not yet launched or disabled) are hidden from users
      const { data: questsData, error: questsErr } = await supabase
        .from('quests')
        .select('*')
        .eq('is_active', true)
        .order('start_date', { ascending: false })
      if (questsErr) console.error('useQuestHistory: quests query failed', questsErr)
      const quests = (questsData ?? []) as Quest[]

      // Fetch all quest_days WITH their completions in a single joined query.
      // RLS on completions ensures only the current user's completions are returned.
      // Each quest_day gets a `completions` array — non-empty means the user completed it.
      const { data: daysData, error: daysErr } = await supabase
        .from('quest_days')
        .select('*, completions(id)')
        .order('day_number', { ascending: true })
      if (daysErr) console.error('useQuestHistory: quest_days query failed', daysErr)
      const allDays = (daysData ?? []) as QuestDayWithCompletions[]

      // Build completedDayIds from quest_days that have at least one completion
      const dayIds = new Set(
        allDays
          .filter(d => d.completions && d.completions.length > 0)
          .map(d => d.id)
      )
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
