import { useEffect, useRef } from 'react'
import { Check, Lock, Star, Trophy } from 'lucide-react'
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
    <div className="relative py-4 px-2">
      {questDays.map((day, index) => {
        const status = getNodeStatus(day, completedDayIds, todayDayNumber)
        const isEven = index % 2 === 1
        const isMilestone = day.is_milestone
        const isToday =
          status === 'today-done' || status === 'today-pending'
        const isClickable = status !== 'future'
        const isLast = index === questDays.length - 1

        const nodeSize = isMilestone ? 48 : 36
        const iconSize = isMilestone ? 20 : 18
        const lockSize = isMilestone ? 18 : 14

        // Determine if the segment below this node is completed
        const segmentCompleted =
          !isLast &&
          (status === 'completed' || status === 'today-done')

        return (
          <div key={day.id} className="relative">
            {/* Row with node */}
            <div
              className={`flex items-center ${
                isEven ? 'justify-end pr-8' : 'justify-start pl-8'
              }`}
            >
              <div
                ref={isToday ? todayRef : undefined}
                className="flex flex-col items-center gap-1"
              >
                {/* Node circle */}
                <button
                  type="button"
                  onClick={() => isClickable && onDayClick(day)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center rounded-full
                    transition-all duration-200
                    ${!isClickable ? 'cursor-default opacity-60' : 'cursor-pointer hover:ring-2 hover:ring-tq-teal/50'}
                    ${isMilestone ? 'ring-2 ring-tq-purple' : ''}
                    ${status === 'completed' ? 'bg-tq-success' : ''}
                    ${status === 'today-done' ? 'bg-tq-teal ring-4 ring-tq-teal/30' : ''}
                    ${status === 'today-pending' ? 'bg-tq-gold animate-gold-pulse' : ''}
                    ${status === 'future' ? 'bg-tq-surface-2' : ''}
                  `}
                  style={{ width: nodeSize, height: nodeSize }}
                >
                  {status === 'completed' && !isMilestone && (
                    <Check size={iconSize} className="text-white" />
                  )}
                  {status === 'completed' && isMilestone && (
                    <Trophy size={iconSize} className="text-white" />
                  )}
                  {status === 'today-done' && (
                    <Check size={iconSize} className="text-white" />
                  )}
                  {status === 'today-pending' && !isMilestone && (
                    <span className="text-sm font-bold text-tq-bg">
                      {day.day_number}
                    </span>
                  )}
                  {status === 'today-pending' && isMilestone && (
                    <Star size={iconSize} className="text-tq-bg" />
                  )}
                  {status === 'future' && !isMilestone && (
                    <Lock size={lockSize} className="text-tq-text-muted" />
                  )}
                  {status === 'future' && isMilestone && (
                    <Star size={lockSize} className="text-tq-text-muted" />
                  )}
                </button>

                {/* Labels */}
                <span className="text-xs text-tq-text-sec">
                  Day {day.day_number}
                </span>
                {isMilestone && day.passage_reference && (
                  <span className="text-xs text-tq-purple">
                    {day.passage_reference}
                  </span>
                )}
              </div>
            </div>

            {/* Connecting line to next node */}
            {!isLast && (
              <div
                className={`flex ${
                  isEven ? 'justify-end pr-8' : 'justify-start pl-8'
                }`}
              >
                <div className="flex justify-center" style={{ width: nodeSize }}>
                  <div
                    className={`w-0.5 h-8 ${
                      segmentCompleted ? 'bg-tq-teal/40' : 'bg-tq-border'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
