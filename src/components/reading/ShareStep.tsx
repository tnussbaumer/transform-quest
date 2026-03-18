import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'
import type { CreateWallPostResult } from '../../types/database'

interface ShareStepProps {
  questDayId: string
  answers: { a1: string; a2: string; a3: string }
  onContinue: () => void
  onXpEarned?: (xp: number) => void
}

const QUESTION_LABELS = ['What it says', 'How it applies', "What I'll do"]

export function ShareStep({ questDayId, answers, onContinue, onXpEarned }: ShareStepProps) {
  const [mode, setMode] = useState<'reflection' | 'thought'>('reflection')
  const [visibility, setVisibility] = useState<'friends' | 'everyone'>('friends')
  const [share1, setShare1] = useState(true)
  const [share2, setShare2] = useState(true)
  const [share3, setShare3] = useState(true)
  const [thoughtText, setThoughtText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [shared, setShared] = useState(false)
  const [xpEarned, setXpEarned] = useState(0)

  function truncate(text: string, max = 60) {
    return text.length > max ? text.slice(0, max) + '...' : text
  }

  const canSubmitReflection = mode === 'reflection' && (share1 || share2 || share3)
  const canSubmitThought = mode === 'thought' && thoughtText.trim().length > 0 && thoughtText.trim().length <= 280
  const canSubmit = canSubmitReflection || canSubmitThought

  async function handleShare() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      const { data, error } = await supabase.rpc('create_wall_post', {
        p_quest_day_id: questDayId,
        p_post_type: mode,
        p_visibility: visibility,
        p_share_answer_1: mode === 'reflection' ? share1 : false,
        p_share_answer_2: mode === 'reflection' ? share2 : false,
        p_share_answer_3: mode === 'reflection' ? share3 : false,
        p_thought_text: mode === 'thought' ? thoughtText.trim() : null,
      })
      if (error) throw error
      const result = data as CreateWallPostResult
      setShared(true)
      if (result.xp_earned > 0) {
        setXpEarned(result.xp_earned)
        onXpEarned?.(result.xp_earned)
      }
      // Auto-continue after a brief moment
      setTimeout(onContinue, 1500)
    } catch (err) {
      console.error('Failed to share:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (shared) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center px-6 py-12 text-center">
        <div className="space-y-4 animate-fade-up">
          <p className="text-5xl">🎉</p>
          <h2 className="text-xl font-extrabold text-tq-text">Shared!</h2>
          {xpEarned > 0 && (
            <p className="text-lg font-bold text-tq-gold">+{xpEarned} XP for sharing!</p>
          )}
          <p className="text-sm text-tq-text-sec">Your community can now see your thoughts.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-6 py-12">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
        <div className="w-full space-y-5">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-tq-teal/20 flex items-center justify-center mx-auto">
              <MessageCircle size={28} className="text-tq-teal" />
            </div>
            <h2 className="text-xl font-extrabold text-tq-text">Share with the community?</h2>
            <p className="text-sm text-tq-text-sec">Let others see what you're learning</p>
          </div>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('reflection')}
              className={[
                'flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200',
                mode === 'reflection' ? 'bg-tq-teal text-tq-bg' : 'bg-tq-surface-2 text-tq-text-sec',
              ].join(' ')}
            >
              Share Reflections
            </button>
            <button
              onClick={() => setMode('thought')}
              className={[
                'flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200',
                mode === 'thought' ? 'bg-tq-teal text-tq-bg' : 'bg-tq-surface-2 text-tq-text-sec',
              ].join(' ')}
            >
              Write a Thought
            </button>
          </div>

          {/* Reflection toggles */}
          {mode === 'reflection' && (
            <div className="space-y-2.5">
              {[
                { checked: share1, toggle: () => setShare1(!share1), text: answers.a1, label: QUESTION_LABELS[0] },
                { checked: share2, toggle: () => setShare2(!share2), text: answers.a2, label: QUESTION_LABELS[1] },
                { checked: share3, toggle: () => setShare3(!share3), text: answers.a3, label: QUESTION_LABELS[2] },
              ].map((item, i) =>
                item.text ? (
                  <label
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-tq-surface cursor-pointer border border-tq-border/50"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={item.toggle}
                      className="mt-0.5 w-5 h-5 rounded accent-tq-teal flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-tq-text-sec">{item.label}</p>
                      <p className="text-sm text-tq-text">{truncate(item.text)}</p>
                    </div>
                  </label>
                ) : null
              )}
            </div>
          )}

          {/* Thought input */}
          {mode === 'thought' && (
            <div>
              <Textarea
                placeholder="What's on your mind about today's reading?"
                value={thoughtText}
                onChange={e => {
                  if (e.target.value.length <= 280) setThoughtText(e.target.value)
                }}
                maxLength={280}
              />
              <p className={[
                'text-xs font-semibold mt-1 text-right',
                thoughtText.length > 260 ? 'text-tq-error' : 'text-tq-text-muted',
              ].join(' ')}>
                {thoughtText.trim().length}/280
              </p>
            </div>
          )}

          {/* Visibility */}
          <div className="flex gap-2">
            <button
              onClick={() => setVisibility('friends')}
              className={[
                'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                visibility === 'friends' ? 'bg-tq-teal text-tq-bg' : 'bg-tq-surface-2 text-tq-text-sec',
              ].join(' ')}
            >
              🔒 Friends
            </button>
            <button
              onClick={() => setVisibility('everyone')}
              className={[
                'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                visibility === 'everyone' ? 'bg-tq-teal text-tq-bg' : 'bg-tq-surface-2 text-tq-text-sec',
              ].join(' ')}
            >
              🌍 Everyone
            </button>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <Button fullWidth onClick={handleShare} loading={submitting} disabled={!canSubmit}>
              Share
            </Button>
            <button
              onClick={onContinue}
              className="w-full py-2 text-sm font-semibold text-tq-text-muted hover:text-tq-text-sec transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
