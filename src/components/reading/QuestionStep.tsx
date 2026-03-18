import { Button } from '../ui/Button'
import { Textarea } from '../ui/Textarea'

const READING_QUESTIONS = [
  'What does this passage say?',
  'How does this apply to you?',
  'What does this require you to do?',
]

const DISCIPLINE_QUESTIONS = [
  'What did you do?',
  'What did you learn?',
  'What will you do differently?',
]

const MAX_CHARS = 500

interface QuestionStepProps {
  questionIndex: number   // 0-based (0, 1, 2)
  value: string
  onChange: (val: string) => void
  onNext: () => void
  isLast: boolean
  submitting?: boolean
  questType?: 'reading' | 'discipline' | 'event'
}

export function QuestionStep({
  questionIndex,
  value,
  onChange,
  onNext,
  isLast,
  submitting = false,
  questType,
}: QuestionStepProps) {
  const questions = questType === 'discipline' || questType === 'event'
    ? DISCIPLINE_QUESTIONS
    : READING_QUESTIONS
  const question = questions[questionIndex]
  const charCount = value.length

  return (
    <div className="flex flex-col min-h-screen px-4">
      {/* Question area */}
      <div className="flex-1 flex flex-col justify-center py-8 space-y-6">
        <div className="space-y-2">
          <p className="text-tq-teal text-xs font-bold uppercase tracking-widest">
            Question {questionIndex + 1} of 3
          </p>
          <h2 className="text-2xl font-extrabold text-tq-text leading-tight">
            {question}
          </h2>
          <p className="text-tq-text-muted text-sm">
            Write 1-2 sentences. Be honest with yourself.
          </p>
        </div>

        <div>
          <Textarea
            value={value}
            onChange={e => onChange(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Type your response here..."
            autoFocus
            inputMode="text"
          />
          <p className={[
            'text-xs mt-1.5 text-right tabular-nums transition-colors',
            charCount > MAX_CHARS * 0.9 ? 'text-tq-gold' : 'text-tq-text-muted/50',
          ].join(' ')}>
            {charCount}/{MAX_CHARS}
          </p>
        </div>
      </div>

      {/* Bottom button */}
      <div className="pb-8 pt-4">
        <Button
          fullWidth
          onClick={onNext}
          disabled={!value.trim() || submitting}
        >
          {submitting ? 'Saving...' : isLast ? 'Finish' : 'Next'}
        </Button>
      </div>
    </div>
  )
}
