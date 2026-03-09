import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCompletion } from '../hooks/useCompletion'
import { useAuth } from '../hooks/useAuth'
import { calculateXp } from '../lib/calculateXp'
import { ProgressDots } from '../components/reading/ProgressDots'
import { PassageStep } from '../components/reading/PassageStep'
import { QuestionStep } from '../components/reading/QuestionStep'
import { CelebrationStep } from '../components/reading/CelebrationStep'
import type { QuestDay, CompleteReadingResult } from '../types/database'

// 5 steps total
const TOTAL_STEPS = 5
// Step indices
const STEP_PASSAGE = 1
const STEP_Q1 = 2
const STEP_Q2 = 3
const STEP_Q3 = 4
const STEP_CELEBRATE = 5

export function ReadingFlowPage() {
  const { questDayId } = useParams<{ questDayId: string }>()
  const { profile } = useAuth()
  const { submitCompletion, submitting } = useCompletion(questDayId)

  const [step, setStep] = useState(STEP_PASSAGE)
  const [questDay, setQuestDay] = useState<QuestDay | null>(null)
  const [loadingDay, setLoadingDay] = useState(true)
  const [answers, setAnswers] = useState({ a1: '', a2: '', a3: '' })
  const [result, setResult] = useState<CompleteReadingResult | null>(null)
  const [xpEarned] = useState(() => calculateXp(new Date()))

  useEffect(() => {
    if (!questDayId) return
    supabase
      .from('quest_days')
      .select('*')
      .eq('id', questDayId)
      .single()
      .then(({ data }) => {
        setQuestDay(data)
        setLoadingDay(false)
      })
  }, [questDayId])

  if (!questDayId) return <Navigate to="/" replace />

  if (loadingDay) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-tq-text-muted text-sm">Loading…</span>
      </div>
    )
  }

  if (!questDay) return <Navigate to="/" replace />

  async function handleFinish() {
    if (!questDayId) return
    try {
      const res = await submitCompletion(questDayId, {
        answer1: answers.a1,
        answer2: answers.a2,
        answer3: answers.a3,
      }, xpEarned)
      setResult(res)
      setStep(STEP_CELEBRATE)
    } catch {
      // Already completed — still go to celebration
      setResult({
        new_streak: profile?.current_streak ?? 1,
        new_xp: profile?.total_xp ?? 0,
        new_level: profile?.level_title ?? 'Seedling',
      })
      setStep(STEP_CELEBRATE)
    }
  }

  const celebrationStreak = result?.new_streak ?? profile?.current_streak ?? 1

  return (
    <div className="min-h-screen bg-tq-bg text-tq-text">
      {/* Progress dots header — hidden on celebration */}
      {step !== STEP_CELEBRATE && (
        <div className="pt-6 px-4">
          <ProgressDots step={step} total={TOTAL_STEPS} />
        </div>
      )}

      {/* Steps */}
      {step === STEP_PASSAGE && (
        <PassageStep
          questDay={questDay}
          onContinue={() => setStep(STEP_Q1)}
        />
      )}

      {step === STEP_Q1 && (
        <QuestionStep
          questionIndex={0}
          value={answers.a1}
          onChange={val => setAnswers(a => ({ ...a, a1: val }))}
          onNext={() => setStep(STEP_Q2)}
          isLast={false}
        />
      )}

      {step === STEP_Q2 && (
        <QuestionStep
          questionIndex={1}
          value={answers.a2}
          onChange={val => setAnswers(a => ({ ...a, a2: val }))}
          onNext={() => setStep(STEP_Q3)}
          isLast={false}
        />
      )}

      {step === STEP_Q3 && (
        <QuestionStep
          questionIndex={2}
          value={answers.a3}
          onChange={val => setAnswers(a => ({ ...a, a3: val }))}
          onNext={handleFinish}
          isLast={true}
          submitting={submitting}
        />
      )}

      {step === STEP_CELEBRATE && (
        <CelebrationStep
          streak={celebrationStreak}
          xpEarned={xpEarned}
        />
      )}
    </div>
  )
}
