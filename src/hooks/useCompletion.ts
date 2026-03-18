import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { isCompletedToday } from '../lib/streakUtils'
import type { CompleteReadingResult } from '../types/database'

interface SubmitAnswers {
  answer1: string
  answer2: string
  answer3: string
}

interface CompletionState {
  isCompletedToday: boolean
  loading: boolean
  submitting: boolean
  submitCompletion: (questDayId: string, answers: SubmitAnswers, xp: number) => Promise<CompleteReadingResult>
  refetch: () => Promise<void>
}

export function useCompletion(questDayId: string | undefined): CompletionState {
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const checkCompletion = useCallback(async () => {
    if (!questDayId) {
      // Don't set loading=false here — questDayId may still be loading
      // from useQuest. The page's loading flag should gate on questLoading
      // for the "no quest day" case.
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('completions')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('quest_day_id', questDayId)
        .maybeSingle()

      const row = data as { completed_at: string } | null
      setCompleted(row ? isCompletedToday(row.completed_at) : false)
    } finally {
      setLoading(false)
    }
  }, [questDayId])

  useEffect(() => {
    checkCompletion()
  }, [checkCompletion])

  async function submitCompletion(
    questDayId: string,
    answers: SubmitAnswers,
    xp: number
  ): Promise<CompleteReadingResult> {
    setSubmitting(true)
    try {
      const { data, error } = await supabase.rpc('complete_reading', {
        p_quest_day_id: questDayId,
        p_answer_1: answers.answer1,
        p_answer_2: answers.answer2,
        p_answer_3: answers.answer3,
        p_xp_earned: xp,
      })

      if (error) throw error
      setCompleted(true)
      return data as CompleteReadingResult
    } finally {
      setSubmitting(false)
    }
  }

  return {
    isCompletedToday: completed,
    loading,
    submitting,
    submitCompletion,
    refetch: checkCompletion,
  }
}
