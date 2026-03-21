import { useState } from 'react'
import { ChevronDown, Zap } from 'lucide-react'
import { Card } from '../ui/Card'
import type { JournalEntry } from '../../types/database'

interface JournalSectionProps {
  entries: JournalEntry[]
  loading: boolean
}

const Q_LABELS = ['What does this say?', 'How does this apply?', 'What will you do?']

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function JournalCard({ entry, index }: { entry: JournalEntry; index: number }) {
  const qd = entry.quest_days
  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Card>
        <div className="space-y-3">
          {/* Header: quest title + date */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-tq-text-muted truncate">
              {qd?.quests?.title ?? 'Quest'}
            </p>
            <p className="text-xs text-tq-text-muted flex-shrink-0 ml-2">
              {formatDate(entry.completed_at)}
            </p>
          </div>

          {/* Passage reference */}
          {qd?.passage_reference && (
            <p className="text-base font-bold text-tq-text">
              {qd.passage_reference}
            </p>
          )}

          {/* Answers */}
          <div className="space-y-2.5">
            {[entry.answer_1, entry.answer_2, entry.answer_3].map((answer, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-tq-teal mb-0.5">{Q_LABELS[i]}</p>
                <p className="text-sm text-tq-text-sec leading-relaxed">{answer}</p>
              </div>
            ))}
          </div>

          {/* XP */}
          <div className="flex items-center gap-1 pt-1">
            <Zap size={12} className="text-tq-gold" />
            <span className="text-xs font-bold text-tq-gold">+{entry.xp_earned} XP</span>
          </div>
        </div>
      </Card>
    </div>
  )
}

export function JournalSection({ entries, loading }: JournalSectionProps) {
  const [expanded, setExpanded] = useState(false)

  if (loading) {
    return (
      <section aria-label="My Journal">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-3">
          📖 My Journal
        </h2>
        <Card>
          <div className="space-y-3">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-16 w-full rounded-xl" />
          </div>
        </Card>
      </section>
    )
  }

  if (entries.length === 0) {
    return (
      <section aria-label="My Journal">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-3">
          📖 My Journal
        </h2>
        <Card>
          <p className="text-tq-text-muted text-sm text-center py-4">
            Your journal is empty — complete your first reading to start!
          </p>
        </Card>
      </section>
    )
  }

  const preview = entries.slice(0, 3)
  const showToggle = entries.length > 3

  return (
    <section aria-label="My Journal">
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-3">
        📖 My Journal
      </h2>

      <div className="space-y-3">
        {/* Preview (collapsed) or full list (expanded) */}
        {(expanded ? entries : preview).map((entry, i) => (
          <JournalCard key={entry.id} entry={entry} index={i} />
        ))}

        {/* Toggle */}
        {showToggle && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-tq-text-sec hover:text-tq-teal transition-colors min-h-[44px]"
            aria-expanded={expanded}
          >
            {expanded ? 'Show less' : `See all entries (${entries.length})`}
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </section>
  )
}
