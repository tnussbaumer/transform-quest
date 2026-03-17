import { useState, useEffect } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useCompletion } from '../hooks/useCompletion'
import { useAuth } from '../hooks/useAuth'
import { useFriends } from '../hooks/useFriends'
import { calculateXp } from '../lib/calculateXp'
import { ProgressDots } from '../components/reading/ProgressDots'
import { PassageStep } from '../components/reading/PassageStep'
import { QuestionStep } from '../components/reading/QuestionStep'
import { CelebrationStep } from '../components/reading/CelebrationStep'
import { FriendStreaksStep } from '../components/reading/FriendStreaksStep'
import { ShareButton } from '../components/reading/ShareButton'
import { Button } from '../components/ui/Button'
import type { QuestDay, CompleteReadingResult, NewBadge } from '../types/database'

const STEP_PASSAGE    = 1
const STEP_Q1         = 2
const STEP_Q2         = 3
const STEP_Q3         = 4
const STEP_CELEBRATE  = 5
const STEP_FRIENDS    = 6
const STEP_DONE       = 7

export function ReadingFlowPage() {
  const { questDayId } = useParams<{ questDayId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { submitCompletion, submitting } = useCompletion(questDayId)
  const { friends } = useFriends()

  const hasFriends = friends.length > 0
  const TOTAL_STEPS = hasFriends ? 7 : 5

  const [step, setStep] = useState(STEP_PASSAGE)
  const [questDay, setQuestDay] = useState<QuestDay | null>(null)
  const [questType, setQuestType] = useState<'reading' | 'discipline' | 'event'>('reading')
  const [loadingDay, setLoadingDay] = useState(true)
  const [answers, setAnswers] = useState({ a1: '', a2: '', a3: '' })
  const [result, setResult] = useState<CompleteReadingResult | null>(null)
  const [newBadges, setNewBadges] = useState<NewBadge[]>([])
  const [xpEarned] = useState(() => calculateXp(new Date()))

  useEffect(() => {
    if (!questDayId) return
    supabase
      .from('quest_days')
      .select('*')
      .eq('id', questDayId)
      .single()
      .then(async ({ data }) => {
        const qd = data as QuestDay | null
        setQuestDay(qd)
        if (qd) {
          const { data: quest } = await supabase
            .from('quests')
            .select('quest_type')
            .eq('id', qd.quest_id)
            .single()
          if (quest) setQuestType((quest as { quest_type: string }).quest_type as 'reading' | 'discipline' | 'event')
        }
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
      setNewBadges(res.new_badges ?? [])
    } catch (err) {
      console.error('complete_reading RPC failed:', err)
      setResult({
        new_streak: profile?.current_streak ?? 1,
        new_xp: profile?.total_xp ?? 0,
        new_level: profile?.level_title ?? 'Seedling',
        new_badges: [],
        xp_earned: xpEarned,
        milestone_bonus: 0,
        quest_complete: false,
        freeze_earned: false,
      })
    }
    setStep(STEP_CELEBRATE)
  }

  function handleCelebrationContinue() {
    if (hasFriends) {
      setStep(STEP_FRIENDS)
    } else {
      navigate('/', { replace: true })
    }
  }

  const celebrationStreak = result?.new_streak ?? (profile?.current_streak ?? 0) + 1
  const dayNumber = questDay.day_number

  return (
    <div className="min-h-screen bg-tq-bg text-tq-text">
      {/* Progress dots — visible only on reading steps */}
      {step >= STEP_PASSAGE && step <= STEP_Q3 && (
        <div className="pt-6 px-4">
          <ProgressDots step={step} total={TOTAL_STEPS} />
        </div>
      )}

      {step === STEP_PASSAGE && (
        <PassageStep
          questDay={questDay}
          questType={questType}
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
          questType={questType}
        />
      )}

      {step === STEP_Q2 && (
        <QuestionStep
          questionIndex={1}
          value={answers.a2}
          onChange={val => setAnswers(a => ({ ...a, a2: val }))}
          onNext={() => setStep(STEP_Q3)}
          isLast={false}
          questType={questType}
        />
      )}

      {step === STEP_Q3 && (
        <QuestionStep
          questionIndex={2}
          value={answers.a3}
          onChange={val => setAnswers(a => ({ ...a, a3: val }))}
          onNext={handleFinish}
          questType={questType}
          isLast={true}
          submitting={submitting}
        />
      )}

      {step === STEP_CELEBRATE && (
        <CelebrationStep
          streak={celebrationStreak}
          xpEarned={xpEarned}
          questDay={questDay}
          dayNumber={dayNumber}
          answers={answers}
          newBadges={newBadges}
          onContinue={handleCelebrationContinue}
        />
      )}

      {step === STEP_FRIENDS && (
        <FriendStreaksStep
          questDayId={questDayId}
          dayNumber={dayNumber}
          passageReference={questDay.passage_reference ?? ''}
          answers={answers}
          streakCount={celebrationStreak}
          onContinue={() => setStep(STEP_DONE)}
        />
      )}

      {step === STEP_DONE && (
        <div className="flex flex-col min-h-screen items-center justify-center px-6 py-12 text-center">
          <div className="space-y-6 w-full max-w-xs">
            <p className="text-5xl">🎉</p>
            <h1 className="text-2xl font-extrabold text-tq-text">
              {"You're done for today!"}
            </h1>
            <p className="text-tq-text-sec text-sm">
              Great job showing up. See you tomorrow!
            </p>
            <div className="space-y-3 pt-2">
              <ShareButton
                dayNumber={dayNumber}
                passageReference={questDay.passage_reference ?? ''}
                answers={answers}
                streakCount={celebrationStreak}
                fullWidth
              />
              <Button fullWidth onClick={() => navigate('/', { replace: true })}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
