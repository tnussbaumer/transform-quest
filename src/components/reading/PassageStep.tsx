import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { QuestDay } from '../../types/database'

interface PassageStepProps {
  questDay: QuestDay
  questType?: 'reading' | 'discipline' | 'event'
  onContinue: () => void
}

export function PassageStep({ questDay, questType, onContinue }: PassageStepProps) {
  const isDiscipline = questType === 'discipline' || questType === 'event'
  const navigate = useNavigate()

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
          {questDay.passage_reference ?? (isDiscipline ? "Today's Challenge" : "Today's Passage")}
        </h1>
      </div>

      {/* Scrollable passage text */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="bg-tq-surface rounded-2xl p-5 border border-tq-border/50">
          <p className="text-tq-text text-lg leading-relaxed whitespace-pre-wrap font-normal">
            {questDay.passage_text ?? (isDiscipline ? 'Challenge details not available.' : 'Passage text not available.')}
          </p>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="px-4 pb-8 pt-4 bg-gradient-to-t from-tq-bg via-tq-bg to-transparent">
        <Button fullWidth onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  )
}
