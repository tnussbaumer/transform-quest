import { useEffect, useRef, useMemo } from 'react'
import { Check, BookOpen, Trophy, Star } from 'lucide-react'
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

// Layout constants
const NODE_GAP_Y = 100
const PADDING_TOP = 50
const PADDING_BOTTOM = 80
const MAP_WIDTH = 320
const NODE_SIZE = 52
const NODE_SIZE_TODAY = 64
const NODE_SIZE_MILESTONE = 58

// Winding S-curve horizontal positions (% of width), cycling every 4 nodes
const X_PATTERN = [0.5, 0.78, 0.5, 0.22]

function getNodeCenter(index: number) {
  const x = X_PATTERN[index % X_PATTERN.length] * MAP_WIDTH
  const y = PADDING_TOP + index * NODE_GAP_Y
  return { x, y }
}

// Build SVG path string connecting all nodes with smooth bezier curves
function buildPath(count: number): string {
  if (count < 2) return ''
  const first = getNodeCenter(0)
  let d = `M ${first.x} ${first.y}`

  for (let i = 1; i < count; i++) {
    const prev = getNodeCenter(i - 1)
    const curr = getNodeCenter(i)
    const midY = (prev.y + curr.y) / 2
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`
  }
  return d
}

// Deterministic sparkle positions based on index
function getSparkles(count: number) {
  const sparkles: { x: number; y: number; size: number; opacity: number }[] = []
  for (let i = 0; i < count * 2; i++) {
    // Simple hash-like distribution
    const seed = (i * 137 + 97) % 200
    const x = (seed / 200) * MAP_WIDTH
    const y = PADDING_TOP + (i * NODE_GAP_Y * 0.5) + ((seed % 60) - 30)
    const size = 1.5 + (seed % 3)
    const opacity = 0.15 + (seed % 20) / 100
    sparkles.push({ x, y, size, opacity })
  }
  return sparkles
}

export default function JourneyMap({
  questDays,
  completedDayIds,
  todayDayNumber,
  onDayClick,
}: JourneyMapProps) {
  const todayRef = useRef<HTMLDivElement>(null)
  const totalHeight = PADDING_TOP + (questDays.length - 1) * NODE_GAP_Y + PADDING_BOTTOM

  const pathD = useMemo(() => buildPath(questDays.length), [questDays.length])
  const sparkles = useMemo(() => getSparkles(questDays.length), [questDays.length])

  // Find where completed path ends (for gradient split)
  const lastCompletedIndex = useMemo(() => {
    let last = -1
    for (let i = 0; i < questDays.length; i++) {
      const s = getNodeStatus(questDays[i], completedDayIds, todayDayNumber)
      if (s === 'completed' || s === 'today-done') last = i
    }
    return last
  }, [questDays, completedDayIds, todayDayNumber])

  const completedFraction = questDays.length > 1
    ? (lastCompletedIndex + 1) / questDays.length
    : 0

  useEffect(() => {
    setTimeout(() => {
      todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl -mx-2">
      {/* Background gradient zones */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(0,201,167,0.06) 0%, rgba(139,92,246,0.06) 40%, rgba(255,184,48,0.04) 70%, rgba(139,92,246,0.08) 100%)',
        }}
      />

      {/* Container with fixed aspect */}
      <div className="relative mx-auto" style={{ width: MAP_WIDTH, height: totalHeight }}>

        {/* SVG layer: path + sparkles */}
        <svg
          className="absolute inset-0"
          width={MAP_WIDTH}
          height={totalHeight}
          viewBox={`0 0 ${MAP_WIDTH} ${totalHeight}`}
          fill="none"
        >
          <defs>
            {/* Path gradient: teal → gold → gray */}
            <linearGradient id="pathGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.5" />
              <stop offset={`${completedFraction * 100}%`} stopColor="#00C9A7" stopOpacity="0.4" />
              <stop offset={`${Math.min(completedFraction * 100 + 5, 100)}%`} stopColor="#FFB830" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2D3154" stopOpacity="0.3" />
            </linearGradient>

            {/* Glow filter for completed path */}
            <filter id="pathGlow" x="-20%" y="-5%" width="140%" height="110%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Node glow filters */}
            <filter id="glowTeal" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feFlood floodColor="#00C9A7" floodOpacity="0.4" />
              <feComposite in2="blur" operator="in" />
            </filter>
            <filter id="glowGold" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feFlood floodColor="#FFB830" floodOpacity="0.5" />
              <feComposite in2="blur" operator="in" />
            </filter>
            <filter id="glowPurple" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feFlood floodColor="#8B5CF6" floodOpacity="0.4" />
              <feComposite in2="blur" operator="in" />
            </filter>
          </defs>

          {/* Background sparkles */}
          {sparkles.map((s, i) => (
            <circle
              key={`sparkle-${i}`}
              cx={s.x}
              cy={s.y}
              r={s.size}
              fill="white"
              opacity={s.opacity}
            />
          ))}

          {/* Path glow (wider, blurred) */}
          <path
            d={pathD}
            stroke="url(#pathGrad)"
            strokeWidth={12}
            strokeLinecap="round"
            fill="none"
            filter="url(#pathGlow)"
            opacity={0.5}
          />

          {/* Path trail (main visible line) */}
          <path
            d={pathD}
            stroke="url(#pathGrad)"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />

          {/* Path dots overlay */}
          <path
            d={pathD}
            stroke="white"
            strokeWidth={1}
            strokeLinecap="round"
            strokeDasharray="2 14"
            fill="none"
            opacity={0.15}
          />

          {/* Glow circles behind special nodes */}
          {questDays.map((day, i) => {
            const status = getNodeStatus(day, completedDayIds, todayDayNumber)
            const pos = getNodeCenter(i)
            if (status === 'today-pending') {
              return <circle key={`glow-${i}`} cx={pos.x} cy={pos.y} r={36} filter="url(#glowGold)" fill="#FFB830" />
            }
            if (status === 'today-done') {
              return <circle key={`glow-${i}`} cx={pos.x} cy={pos.y} r={36} filter="url(#glowTeal)" fill="#00C9A7" />
            }
            if (day.is_milestone && (status === 'completed')) {
              return <circle key={`glow-${i}`} cx={pos.x} cy={pos.y} r={32} filter="url(#glowPurple)" fill="#8B5CF6" />
            }
            return null
          })}
        </svg>

        {/* Node elements (HTML for better interaction + styling) */}
        {questDays.map((day, i) => {
          const status = getNodeStatus(day, completedDayIds, todayDayNumber)
          const isMilestone = day.is_milestone
          const isToday = status === 'today-done' || status === 'today-pending'
          const isPast = status === 'completed' || status === 'today-done'
          const isClickable = status === 'today-pending'
          // "Next unread" = first future node that isn't today-pending
          const isNextUnread = status === 'future' && i > 0 &&
            getNodeStatus(questDays[i - 1], completedDayIds, todayDayNumber) !== 'future'
          const pos = getNodeCenter(i)

          const size = isToday ? NODE_SIZE_TODAY : isMilestone ? NODE_SIZE_MILESTONE : NODE_SIZE

          return (
            <div
              key={day.id}
              ref={isToday ? todayRef : undefined}
              className="absolute"
              style={{
                left: pos.x - size / 2,
                top: pos.y - size / 2,
                width: size,
                height: size,
              }}
            >
              <button
                type="button"
                onClick={() => isClickable && onDayClick(day)}
                disabled={!isClickable}
                className={[
                  'w-full h-full rounded-full flex items-center justify-center',
                  'transition-all duration-300 relative',
                  isClickable ? 'cursor-pointer active:scale-90' : 'cursor-default',
                  // Base styles per status
                  status === 'completed' && !isMilestone
                    ? 'bg-gradient-to-br from-tq-teal to-tq-teal-dark shadow-lg shadow-tq-teal/20 ring-2 ring-tq-teal/20'
                    : '',
                  status === 'completed' && isMilestone
                    ? 'bg-gradient-to-br from-tq-purple to-tq-purple-dark shadow-lg shadow-tq-purple/20 ring-[3px] ring-tq-purple/30'
                    : '',
                  status === 'today-done'
                    ? 'bg-gradient-to-br from-tq-teal to-tq-teal-dark shadow-xl shadow-tq-teal/30 ring-[3px] ring-tq-teal/30'
                    : '',
                  status === 'today-pending'
                    ? 'bg-gradient-to-br from-tq-gold to-tq-gold-dark shadow-xl shadow-tq-gold/40 ring-[3px] ring-tq-gold/30 animate-gold-pulse'
                    : '',
                  status === 'future' && isNextUnread
                    ? 'bg-tq-surface-2 border-2 border-tq-teal/50 animate-next-node-pulse'
                    : '',
                  status === 'future' && !isNextUnread
                    ? 'bg-tq-surface-2 border-2 border-tq-border/40'
                    : '',
                ].join(' ')}
              >
                {/* Inner icon */}
                {status === 'completed' && !isMilestone && (
                  <Check size={22} className="text-white" strokeWidth={3} />
                )}
                {status === 'completed' && isMilestone && (
                  <Trophy size={22} className="text-white" />
                )}
                {status === 'today-done' && (
                  <Check size={26} className="text-white" strokeWidth={3} />
                )}
                {status === 'today-pending' && (
                  <BookOpen size={24} className="text-tq-bg" strokeWidth={2.5} />
                )}
                {status === 'future' && !isMilestone && (
                  <span className="text-sm font-bold text-tq-text-muted tabular-nums">
                    {day.day_number}
                  </span>
                )}
                {status === 'future' && isMilestone && (
                  <Star size={20} className="text-tq-text-muted" />
                )}
              </button>

              {/* Label below node */}
              <div
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-center"
                style={{ top: size + 4 }}
              >
                {/* Day number for completed/today */}
                {(isPast || isToday) && (
                  <p className={[
                    'text-[11px] font-bold',
                    status === 'today-pending' ? 'text-tq-gold' : '',
                    status === 'today-done' ? 'text-tq-teal' : '',
                    status === 'completed' && !isMilestone ? 'text-tq-teal/70' : '',
                    status === 'completed' && isMilestone ? 'text-tq-purple' : '',
                  ].join(' ')}>
                    Day {day.day_number}
                  </p>
                )}

                {/* Passage reference */}
                {day.passage_reference && (isPast || isToday) && (
                  <p className={[
                    'text-[10px] mt-0.5',
                    isToday ? 'text-tq-text-sec font-semibold' : 'text-tq-text-muted',
                  ].join(' ')}>
                    {day.passage_reference}
                  </p>
                )}

                {/* Today tap hint */}
                {status === 'today-pending' && (
                  <p className="text-[10px] text-tq-gold/70 font-semibold mt-0.5">
                    Tap to read
                  </p>
                )}

                {/* Milestone label */}
                {isMilestone && status === 'future' && (
                  <p className="text-[10px] text-tq-text-muted mt-0.5">
                    Milestone
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {/* Finish flag at the bottom */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ top: PADDING_TOP + (questDays.length - 1) * NODE_GAP_Y + 60 }}
        >
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-tq-text-muted/30 to-transparent" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-tq-text-muted">
            {completedDayIds.size} / {questDays.length} complete
          </span>
        </div>
      </div>
    </div>
  )
}
