import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'

interface ComposeModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (params: {
    postType: 'reflection' | 'thought'
    visibility: 'friends' | 'everyone'
    shareAnswer1: boolean
    shareAnswer2: boolean
    shareAnswer3: boolean
    thoughtText?: string
  }) => Promise<void>
  /** If user completed today's reading, pass their answers here */
  answers?: { a1: string; a2: string; a3: string } | null
}

const QUESTION_LABELS = ['What it says', 'How it applies', "What I'll do"]

export function ComposeModal({ open, onClose, onSubmit, answers }: ComposeModalProps) {
  const hasReflections = !!answers && (answers.a1 || answers.a2 || answers.a3)
  const [mode, setMode] = useState<'reflection' | 'thought'>(hasReflections ? 'reflection' : 'thought')
  const [visibility, setVisibility] = useState<'friends' | 'everyone'>('friends')
  const [share1, setShare1] = useState(true)
  const [share2, setShare2] = useState(true)
  const [share3, setShare3] = useState(true)
  const [thoughtText, setThoughtText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const thoughtLength = thoughtText.trim().length
  const isReflectionValid = mode === 'reflection' && (share1 || share2 || share3)
  const isThoughtValid = mode === 'thought' && thoughtLength > 0 && thoughtLength <= 280
  const canSubmit = isReflectionValid || isThoughtValid

  async function handleSubmit() {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({
        postType: mode,
        visibility,
        shareAnswer1: mode === 'reflection' ? share1 : false,
        shareAnswer2: mode === 'reflection' ? share2 : false,
        shareAnswer3: mode === 'reflection' ? share3 : false,
        thoughtText: mode === 'thought' ? thoughtText.trim() : undefined,
      })
      // Reset state
      setThoughtText('')
      setShare1(true)
      setShare2(true)
      setShare3(true)
      onClose()
    } catch (err) {
      console.error('Failed to create post:', err)
    } finally {
      setSubmitting(false)
    }
  }

  function truncatePreview(text: string, max = 60) {
    return text.length > max ? text.slice(0, max) + '...' : text
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-[428px] bg-tq-surface rounded-t-2xl p-5 pb-8 animate-slide-up"
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        {/* Grab handle */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-1 rounded-full bg-tq-border" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-tq-text-muted hover:text-tq-text hover:bg-tq-surface-2 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-extrabold text-tq-text mb-4">Share with the community</h2>

        {/* Mode toggle (only if reflections available) */}
        {hasReflections && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('reflection')}
              className={[
                'flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200',
                mode === 'reflection'
                  ? 'bg-tq-teal text-tq-bg'
                  : 'bg-tq-surface-2 text-tq-text-sec',
              ].join(' ')}
            >
              Share Reflections
            </button>
            <button
              onClick={() => setMode('thought')}
              className={[
                'flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200',
                mode === 'thought'
                  ? 'bg-tq-teal text-tq-bg'
                  : 'bg-tq-surface-2 text-tq-text-sec',
              ].join(' ')}
            >
              Write a Thought
            </button>
          </div>
        )}

        {/* Reflection sharing */}
        {mode === 'reflection' && answers && (
          <div className="space-y-3 mb-4">
            {[
              { checked: share1, toggle: () => setShare1(!share1), text: answers.a1, label: QUESTION_LABELS[0] },
              { checked: share2, toggle: () => setShare2(!share2), text: answers.a2, label: QUESTION_LABELS[1] },
              { checked: share3, toggle: () => setShare3(!share3), text: answers.a3, label: QUESTION_LABELS[2] },
            ].map((item, i) =>
              item.text ? (
                <label
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl bg-tq-surface-2 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={item.toggle}
                    className="mt-0.5 w-5 h-5 rounded accent-tq-teal flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-tq-text-sec">{item.label}</p>
                    <p className="text-sm text-tq-text truncate">{truncatePreview(item.text)}</p>
                  </div>
                </label>
              ) : null
            )}
          </div>
        )}

        {/* Thought mode */}
        {mode === 'thought' && (
          <div className="mb-4">
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
              thoughtLength > 260 ? 'text-tq-error' : 'text-tq-text-muted',
            ].join(' ')}>
              {thoughtLength}/280
            </p>
          </div>
        )}

        {/* Visibility toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setVisibility('friends')}
            className={[
              'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
              visibility === 'friends'
                ? 'bg-tq-teal text-tq-bg'
                : 'bg-tq-surface-2 text-tq-text-sec',
            ].join(' ')}
          >
            🔒 Friends
          </button>
          <button
            onClick={() => setVisibility('everyone')}
            className={[
              'flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
              visibility === 'everyone'
                ? 'bg-tq-teal text-tq-bg'
                : 'bg-tq-surface-2 text-tq-text-sec',
            ].join(' ')}
          >
            🌍 Everyone
          </button>
        </div>

        {/* Submit */}
        <Button
          fullWidth
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        >
          Share
        </Button>
      </div>
    </div>
  )
}
