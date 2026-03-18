import { useEffect, useRef } from 'react'
import { Check, BookOpen, Lock, Trophy, Flame } from 'lucide-react'
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
    setTimeout(() => {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }, [])

  return (
    <div className="space-y-1.5">
      {questDays.map((day) => {
        const status = getNodeStatus(day, completedDayIds, todayDayNumber)
        const isMilestone = day.is_milestone
        const isToday = status === 'today-done' || status === 'today-pending'
        const isClickable = status === 'today-pending'
        const isPast = status === 'completed' || status === 'today-done'

        // Today's card — hero treatment
        if (isToday) {
          return (
            <div key={day.id} ref={todayRef}>
              <button
                type="button"
                onClick={() => isClickable && onDayClick(day)}
                disabled={!isClickable}
                className={[
                  'w-full text-left rounded-2xl p-4 transition-all duration-200',
                  'border-2',
                  status === 'today-pending'
                    ? 'bg-gradient-to-br from-tq-gold/15 via-tq-surface to-tq-gold/5 border-tq-gold/40 cursor-pointer active:scale-[0.98]'
                    : 'bg-gradient-to-br from-tq-teal/15 via-tq-surface to-tq-teal/5 border-tq-teal/40',
                ].join(' ')}
              >
                <div className="flex items-center gap-3.5">
                  {/* Status circle */}
                  <div
                    className={[
                      'w-12 h-12 rounded-full flex items-center justify-center shrink-0',
                      status === 'today-pending'
                        ? 'bg-tq-gold shadow-lg shadow-tq-gold/30 animate-gold-pulse'
                        : 'bg-tq-teal shadow-lg shadow-tq-teal/30',
                    ].join(' ')}
                  >
                    {status === 'today-done' ? (
                      <Check size={22} className="text-white" strokeWidth={3} />
                    ) : (
                      <BookOpen size={20} className="text-tq-bg" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          'text-xs font-bold uppercase tracking-wider',
                          status === 'today-pending' ? 'text-tq-gold' : 'text-tq-teal',
                        ].join(' ')}
                      >
                        {status === 'today-done' ? 'Completed Today' : 'Today'}
                      </span>
                      {isMilestone && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-tq-purple bg-tq-purple/15 rounded-full px-2 py-0.5">
                          <Trophy size={10} />
                          Milestone
                        </span>
                      )}
                    </div>
                    <p className="text-base font-bold text-tq-text mt-0.5">
                      Day {day.day_number}{day.passage_reference ? ` · ${day.passage_reference}` : ''}
                    </p>
                    {status === 'today-pending' && (
                      <p className="text-xs text-tq-gold/80 font-semibold mt-1">
                        Tap to start reading →
                      </p>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )
        }

        // Milestone card — special treatment for past/future milestones
        if (isMilestone) {
          return (
            <div key={day.id}>
              <div
                className={[
                  'rounded-xl p-3.5 border transition-all',
                  isPast
                    ? 'bg-tq-surface border-tq-purple/30'
                    : 'bg-tq-surface/50 border-tq-border/30 opacity-50',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  {/* Status circle */}
                  <div
                    className={[
                      'w-10 h-10 rounded-full flex items-center justify-center shrink-0 ring-2',
                      isPast
                        ? 'bg-tq-purple ring-tq-purple/30'
                        : 'bg-tq-surface-2 ring-tq-border/30',
                    ].join(' ')}
                  >
                    {isPast ? (
                      <Trophy size={18} className="text-white" />
                    ) : (
                      <Trophy size={16} className="text-tq-text-muted" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={[
                        'text-xs font-bold uppercase tracking-wider',
                        isPast ? 'text-tq-purple' : 'text-tq-text-muted',
                      ].join(' ')}>
                        Milestone · Day {day.day_number}
                      </span>
                      {isPast && (
                        <Check size={14} className="text-tq-teal" strokeWidth={3} />
                      )}
                    </div>
                    <p className={[
                      'text-sm font-semibold mt-0.5',
                      isPast ? 'text-tq-text' : 'text-tq-text-muted',
                    ].join(' ')}>
                      {day.passage_reference ?? `Day ${day.day_number}`}
                    </p>
                    {day.milestone_note && isPast && (
                      <p className="text-xs text-tq-purple/80 mt-1 font-medium">
                        {day.milestone_note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        }

        // Completed day — compact row
        if (isPast) {
          return (
            <div key={day.id}>
              <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 bg-tq-surface/60">
                <div className="w-7 h-7 rounded-full bg-tq-teal/20 flex items-center justify-center shrink-0">
                  <Check size={14} className="text-tq-teal" strokeWidth={3} />
                </div>
                <span className="text-sm text-tq-text-sec">
                  <span className="font-semibold text-tq-text">Day {day.day_number}</span>
                  {day.passage_reference && (
                    <span className="text-tq-text-muted"> · {day.passage_reference}</span>
                  )}
                </span>
              </div>
            </div>
          )
        }

        // Future day — locked row
        return (
          <div key={day.id}>
            <div className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 opacity-40">
              <div className="w-7 h-7 rounded-full bg-tq-surface-2 border border-tq-border/50 flex items-center justify-center shrink-0">
                <Lock size={11} className="text-tq-text-muted" />
              </div>
              <span className="text-sm text-tq-text-muted">
                <span className="font-medium">Day {day.day_number}</span>
                {day.passage_reference && (
                  <span> · {day.passage_reference}</span>
                )}
              </span>
            </div>
          </div>
        )
      })}

      {/* Quest finish line */}
      {questDays.length > 0 && (
        <div className="flex items-center justify-center gap-2 pt-3 pb-1">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-tq-border/50" />
          <div className="flex items-center gap-1.5 text-tq-text-muted">
            <Flame size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {completedDayIds.size}/{questDays.length} Days
            </span>
            <Flame size={14} />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-tq-border/50" />
        </div>
      )}
    </div>
  )
}
