import { useMemo } from 'react'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { QuestDay } from '../../types/database'

interface PassageStepProps {
  questDay: QuestDay
  questType?: 'reading' | 'discipline' | 'event'
  onContinue: () => void
}

const ENCOURAGEMENTS = [
  "Grab your Bible and turn to today's passage!",
  "Time to open your Bible! Today's reading is waiting for you.",
  "Your Bible has the best version of this story. Open it up!",
  "No screen can replace the real thing. Crack open your Bible!",
  "Let's go! Find today's passage in your Bible and start reading.",
  "God's Word is powerful. Grab your Bible and dive in!",
]

export function PassageStep({ questDay, questType, onContinue }: PassageStepProps) {
  const isDiscipline = questType === 'discipline' || questType === 'event'
  const navigate = useNavigate()

  const encouragement = useMemo(
    () => ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)],
    []
  )

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-tq-surface border border-tq-border text-tq-text-sec hover:text-tq-text transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-extrabold text-tq-text flex-1">
          {isDiscipline ? "Today's Challenge" : "Today's Reading"}
        </h1>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
        {/* Passage reference — large and prominent */}
        <p className="text-3xl font-extrabold text-tq-text text-center mb-6">
          {questDay.passage_reference ?? (isDiscipline ? "Today's Challenge" : "Today's Passage")}
        </p>

        {/* Encouraging card for reading quests */}
        {!isDiscipline && (
          <div className="bg-tq-surface rounded-2xl p-6 border border-tq-border/50 text-center max-w-xs w-full space-y-4">
            <BookOpen size={36} className="text-tq-teal mx-auto" />
            <p className="text-tq-text text-base leading-relaxed font-medium">
              📖 {encouragement}
            </p>
            <a
              href="https://www.biblegateway.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-tq-text-muted text-xs hover:text-tq-teal transition-colors underline"
            >
              Don&apos;t have a Bible? Try biblegateway.com
            </a>
          </div>
        )}

        {/* Discipline/event quests still show passage text */}
        {isDiscipline && (
          <div className="bg-tq-surface rounded-2xl p-5 border border-tq-border/50 max-w-xs w-full">
            <p className="text-tq-text text-lg leading-relaxed whitespace-pre-wrap font-normal">
              {questDay.passage_text ?? 'Challenge details not available.'}
            </p>
          </div>
        )}
      </div>

      {/* Fixed bottom button */}
      <div className="px-4 pb-8 pt-4 bg-gradient-to-t from-tq-bg via-tq-bg to-transparent">
        <Button fullWidth onClick={onContinue}>
          {isDiscipline ? 'Continue' : "I've Read It"}
        </Button>
      </div>
    </div>
  )
}
