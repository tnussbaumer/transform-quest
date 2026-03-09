import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import type { Quest, QuestDay } from '../../types/database'

interface TodaysReadingCardProps {
  quest: Quest
  questDay: QuestDay
  dayNumber: number
  totalDays: number
  isCompleted: boolean
}

export function TodaysReadingCard({
  quest,
  questDay,
  dayNumber,
  totalDays,
  isCompleted,
}: TodaysReadingCardProps) {
  const navigate = useNavigate()

  return (
    <Card glow={isCompleted ? undefined : 'teal'}>
      <div className="space-y-4">
        {/* Quest title */}
        <p className="text-tq-purple text-sm font-bold uppercase tracking-wide">
          {quest.title}
        </p>

        {/* Passage reference */}
        <div>
          <h2 className="text-2xl font-bold text-tq-text leading-tight">
            {questDay.passage_reference ?? "Today's Passage"}
          </h2>
          <p className="text-tq-text-sec text-sm mt-1 font-semibold">
            Day {dayNumber} of {totalDays}
          </p>
        </div>

        {/* CTA button */}
        {isCompleted ? (
          <Button variant="success" fullWidth disabled>
            <CheckCircle size={18} />
            Completed ✓
          </Button>
        ) : (
          <Button
            fullWidth
            onClick={() => navigate(`/read/${questDay.id}`)}
          >
            Start Today's Reading
          </Button>
        )}
      </div>
    </Card>
  )
}
