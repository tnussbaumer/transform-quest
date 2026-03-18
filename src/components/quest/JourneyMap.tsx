import { useEffect, useRef } from 'react'
import { Check, BookOpen, Lock, Trophy } from 'lucide-react'
import type { QuestDay } from '../../types/database'

interface JourneyMapProps {
  questDays: QuestDay[]
  completedDayIds: Set<string>
  todayDayNumber: number
  onDayClick: (questDay: QuestDay) => void
}

type NodeStatus = 'completed' | 'today-done' | 'today-pending' | 'future'

function getNodeStatus(
  day: QuestDay,
  completedDayIds: Set<string>,
  todayDayNumber: number
): NodeStatus {
  const isCompleted = completedDayIds.has(day.id)
  const isToday = day.day_number === todayDayNumber

  if (isToday && isCompleted) return 'today-done'
  if (isToday) return 'today-pending'
  if (isCompleted) return 'completed'
  return 'future'
}

export default function JourneyMap({
  questDays,
  completedDayIds,
  todayDayNumber,
  onDayClick,
}: JourneyMapProps) {
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [])

  return (
    <div className="relative">
      {questDays.map((day, index) => {
        const status = getNodeStatus(day, completedDayIds, todayDayNumber)
        const isMilestone = day.is_milestone
        const isToday = status === 'today-done' || status === 'today-pending'
        const isClickable = status === 'today-pending'
        const isLast = index === questDays.length - 1
        const isPast = status === 'completed' || status === 'today-done'

        return (
          <div key={day.id} className="relative flex">
            {/* Timeline line + node column */}
            <div className="flex flex-col items-center w-10 shrink-0">
              {/* Node circle */}
              <div
                ref={isToday ? todayRef : undefined}
                className={[
                  'relative z-10 flex items-center justify-center rounded-full shrink-0 transition-all duration-200',
                  isMilestone ? 'w-10 h-10' : 'w-8 h-8',
                  status === 'completed' ? 'bg-tq-teal' : '',
                  status === 'today-done' ? 'bg-tq-teal ring-[3px] ring-tq-teal/25' : '',
                  status === 'today-pending' ? 'bg-tq-gold ring-[3px] ring-tq-gold/25 animate-gold-pulse' : '',
                  status === 'future' ? 'bg-tq-surface-2 border border-tq-border' : '',
                  isMilestone && isPast ? 'ring-2 ring-tq-purple ring-offset-2 ring-offset-tq-bg' : '',
                ].join(' ')}
              >
                {isPast && !isMilestone && (
                  <Check size={16} className="text-white" strokeWidth={3} />
                )}
                {isPast && isMilestone && (
                  <Trophy size={16} className="text-white" />
                )}
                {status === 'today-pending' && (
                  <BookOpen size={16} className="text-tq-bg" />
                )}
                {status === 'future' && (
                  <Lock size={12} className="text-tq-text-muted" />
                )}
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={[
                    'w-px flex-1 min-h-[8px]',
                    isPast ? 'bg-tq-teal/30' : 'bg-tq-border/50',
                  ].join(' ')}
                />
              )}
            </div>

            {/* Content */}
            <button
              type="button"
              onClick={() => isClickable && onDayClick(day)}
              disabled={!isClickable}
              className={[
                'flex-1 min-w-0 ml-3 pb-4 text-left transition-colors',
                isClickable ? 'cursor-pointer' : 'cursor-default',
                // Vertical alignment: center content with node
                isMilestone ? 'pt-1' : 'pt-0.5',
              ].join(' ')}
            >
              {/* Day row */}
              <div className="flex items-baseline gap-2">
                <span
                  className={[
                    'text-sm font-bold tabular-nums',
                    status === 'completed' ? 'text-tq-teal' : '',
                    status === 'today-done' ? 'text-tq-teal' : '',
                    status === 'today-pending' ? 'text-tq-gold' : '',
                    status === 'future' ? 'text-tq-text-muted' : '',
                  ].join(' ')}
                >
                  Day {day.day_number}
                </span>

                {day.passage_reference && (
                  <span
                    className={[
                      'text-sm',
                      isPast ? 'text-tq-text-sec' : '',
                      isToday ? 'text-tq-text font-semibold' : '',
                      status === 'future' ? 'text-tq-text-muted' : '',
                    ].join(' ')}
                  >
                    {day.passage_reference}
                  </span>
                )}
              </div>

              {/* Milestone badge */}
              {isMilestone && day.milestone_note && (
                <div
                  className={[
                    'mt-1.5 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1',
                    isPast
                      ? 'bg-tq-purple/15 text-tq-purple'
                      : 'bg-tq-surface-2 text-tq-text-muted',
                  ].join(' ')}
                >
                  <Trophy size={12} />
                  <span className="text-xs font-semibold">Milestone</span>
                </div>
              )}

              {/* Today CTA hint */}
              {status === 'today-pending' && (
                <p className="mt-1 text-xs text-tq-gold font-semibold">
                  Tap to start today&apos;s reading
                </p>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
