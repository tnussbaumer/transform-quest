import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toLocalDateString } from '../../lib/streakUtils'
import type { Completion } from '../../types/database'

interface StreakCalendarProps {
  completions: Completion[]
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  // Returns 0=Mon … 6=Sun (remapped from JS 0=Sun)
  return (new Date(year, month, 1).getDay() + 6) % 7
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function StreakCalendar({ completions }: StreakCalendarProps) {
  const now = new Date()
  const [displayYear, setDisplayYear] = useState(now.getFullYear())
  const [displayMonth, setDisplayMonth] = useState(now.getMonth())

  const todayStr = toLocalDateString(now)

  // Build Set of completed date strings
  const completedDates = new Set(
    completions.map(c => toLocalDateString(new Date(c.completed_at)))
  )

  const daysInMonth = getDaysInMonth(displayYear, displayMonth)
  const firstDayOffset = getFirstDayOfMonth(displayYear, displayMonth) // 0=Mon

  function prevMonth() {
    if (displayMonth === 0) {
      setDisplayYear(y => y - 1)
      setDisplayMonth(11)
    } else {
      setDisplayMonth(m => m - 1)
    }
  }

  function nextMonth() {
    const isCurrentMonth = displayYear === now.getFullYear() && displayMonth === now.getMonth()
    if (isCurrentMonth) return // Don't go into the future
    if (displayMonth === 11) {
      setDisplayYear(y => y + 1)
      setDisplayMonth(0)
    } else {
      setDisplayMonth(m => m + 1)
    }
  }

  const isCurrentMonth = displayYear === now.getFullYear() && displayMonth === now.getMonth()

  return (
    <div className="space-y-3">
      {/* Month navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-tq-text-sec hover:text-tq-text hover:bg-tq-surface-2 transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-bold text-tq-text">
          {MONTH_NAMES[displayMonth]} {displayYear}
        </h3>
        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-tq-text-sec hover:text-tq-text hover:bg-tq-surface-2 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-semibold text-tq-text-muted py-1">
            {d}
          </div>
        ))}

        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOffset }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isDone = completedDates.has(dateStr)
          const isToday = dateStr === todayStr

          return (
            <div
              key={day}
              className={[
                'aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-colors',
                isDone
                  ? 'bg-tq-teal text-tq-bg'
                  : isToday
                  ? 'border-2 border-tq-gold text-tq-gold'
                  : 'text-tq-text-muted',
              ].join(' ')}
              aria-label={`${dateStr}${isDone ? ' — completed' : isToday ? ' — today' : ''}`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}
