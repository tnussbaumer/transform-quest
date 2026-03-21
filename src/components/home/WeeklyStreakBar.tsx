import { Check } from 'lucide-react'
import { getCurrentWeekDays, toLocalDateString } from '../../lib/streakUtils'
import type { Completion } from '../../types/database'

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

interface WeeklyStreakBarProps {
  completions: Completion[]
}

export function WeeklyStreakBar({ completions }: WeeklyStreakBarProps) {
  const weekDays = getCurrentWeekDays()
  const todayStr = toLocalDateString()

  const completedDates = new Set(
    completions.map(c => toLocalDateString(new Date(c.completed_at)))
  )

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-3">
        This Week
      </h3>
      <div className="flex items-end justify-between">
        {weekDays.map((day, index) => {
          const dateStr = toLocalDateString(day)
          const isToday = dateStr === todayStr
          const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
          const isDone = completedDates.has(dateStr)
          const isFuture = !isToday && !isPast

          return (
            <div key={dateStr} className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-tq-text-muted">
                {DAY_LABELS[index]}
              </span>

              <div
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                  'animate-dot-pop',
                  isDone && isToday
                    ? 'bg-tq-teal ring-2 ring-tq-teal ring-offset-2 ring-offset-tq-bg'
                    : isDone
                    ? 'bg-tq-success'
                    : isToday
                    ? 'bg-tq-surface-2 border-2 border-tq-gold animate-gold-pulse'
                    : isFuture
                    ? 'bg-tq-surface-2'
                    : 'bg-tq-surface-2 opacity-50',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{ animationDelay: `${index * 60}ms` }}
                aria-label={`${day.toLocaleDateString('en-US', { weekday: 'long' })} — ${isDone ? 'completed' : isToday ? 'today' : 'not completed'}`}
              >
                {isDone && (
                  <Check size={16} strokeWidth={3} className="text-tq-bg" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
