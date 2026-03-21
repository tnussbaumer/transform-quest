import { useMemo, useState } from 'react'
import { ChevronLeft, BookOpen, Lightbulb, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { BibleReadingGuide } from './BibleReadingGuide'
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
  const [hintExpanded, setHintExpanded] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  const hasHint = !!questDay.reading_hint?.trim()

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
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex flex-col items-center justify-center min-h-full gap-4">
          {/* Passage reference — large and prominent */}
          <p className="text-3xl font-extrabold text-tq-text text-center">
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

          {/* Scripture Summary — shown when passage_text exists (reading quests) */}
          {!isDiscipline && questDay.passage_text && (
            <div className="bg-tq-surface-2 rounded-2xl p-5 border border-tq-border/30 max-w-xs w-full">
              <p className="text-xs font-extrabold uppercase tracking-widest text-tq-purple mb-2">
                Scripture Summary
              </p>
              <p className="text-tq-text-sec text-sm leading-relaxed">
                {questDay.passage_text}
              </p>
            </div>
          )}

          {/* Reading Hint — collapsible, below summary */}
          {!isDiscipline && hasHint && (
            <div className="max-w-xs w-full">
              <button
                onClick={() => setHintExpanded(v => !v)}
                className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-tq-surface border border-tq-teal/20 hover:bg-tq-surface-2 transition-colors min-h-[44px]"
              >
                <Lightbulb size={18} className="text-tq-teal flex-shrink-0" />
                <span className="flex-1 text-left text-sm font-semibold text-tq-teal">
                  Help with this passage
                </span>
                <ChevronDown
                  size={16}
                  className={`text-tq-teal transition-transform duration-200 ${hintExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              <div
                className="overflow-hidden transition-all duration-300 ease-out"
                style={{
                  maxHeight: hintExpanded ? '200px' : '0px',
                  opacity: hintExpanded ? 1 : 0,
                }}
              >
                <div className="mt-2 bg-tq-surface-2 rounded-xl p-4 border border-tq-border/30">
                  <p className="text-tq-text text-sm leading-relaxed">
                    {questDay.reading_hint}
                  </p>
                </div>
              </div>
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

          {/* How to Read the Bible link */}
          {!isDiscipline && (
            <button
              onClick={() => setGuideOpen(true)}
              className="text-tq-text-muted text-xs font-semibold hover:text-tq-teal transition-colors py-2 min-h-[44px] flex items-center gap-1"
            >
              📖 How to Read the Bible
            </button>
          )}
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="px-4 pb-8 pt-4 bg-gradient-to-t from-tq-bg via-tq-bg to-transparent">
        <Button fullWidth onClick={onContinue}>
          {isDiscipline ? 'Continue' : "I've Read It"}
        </Button>
      </div>

      <BibleReadingGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </div>
  )
}
