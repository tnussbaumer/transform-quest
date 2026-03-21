import { useEffect, useRef, useMemo, useState } from 'react'
import { Check, BookOpen, Trophy, Star } from 'lucide-react'
import { Avatar } from '../profile/Avatar'
import { useAuth } from '../../hooks/useAuth'
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

/** Interpolate a point along the bezier path between two node centers at t=[0,1] */
function interpolateNodes(fromIdx: number, toIdx: number, t: number) {
  const from = getNodeCenter(fromIdx)
  const to = getNodeCenter(toIdx)
  const midY = (from.y + to.y) / 2
  // Cubic bezier: P0=from, P1=(from.x, midY), P2=(to.x, midY), P3=to
  const u = 1 - t
  const x = u * u * u * from.x + 3 * u * u * t * from.x + 3 * u * t * t * to.x + t * t * t * to.x
  const y = u * u * u * from.y + 3 * u * u * t * midY + 3 * u * t * t * midY + t * t * t * to.y
  return { x, y }
}

const TRAVEL_STORAGE_KEY = 'tq-journey-last-completed-count'

export default function JourneyMap({
  questDays,
  completedDayIds,
  todayDayNumber,
  onDayClick,
}: JourneyMapProps) {
  const { profile } = useAuth()
  const todayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)
  const totalHeight = PADDING_TOP + (questDays.length - 1) * NODE_GAP_Y + PADDING_BOTTOM

  const pathD = useMemo(() => buildPath(questDays.length), [questDays.length])
  const sparkles = useMemo(() => getSparkles(questDays.length), [questDays.length])

  // Travel animation state
  const [travelPos, setTravelPos] = useState<{ x: number; y: number } | null>(null)
  const [travelTrail, setTravelTrail] = useState<{ x: number; y: number; id: number }[]>([])
  const [showBurst, setShowBurst] = useState<number | null>(null) // index of burst node
  const trailIdRef = useRef(0)

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

  // Travel animation: detect new completion and animate avatar along path
  useEffect(() => {
    if (hasAnimated.current || lastCompletedIndex < 1) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const storedCount = parseInt(sessionStorage.getItem(TRAVEL_STORAGE_KEY) || '0', 10)
    const currentCount = completedDayIds.size

    if (currentCount <= storedCount) {
      // No new completion — just update stored count
      sessionStorage.setItem(TRAVEL_STORAGE_KEY, String(currentCount))
      return
    }

    hasAnimated.current = true
    sessionStorage.setItem(TRAVEL_STORAGE_KEY, String(currentCount))

    const fromIdx = lastCompletedIndex - 1
    const toIdx = lastCompletedIndex

    // Scroll destination into view first
    const destPos = getNodeCenter(toIdx)
    const destEl = containerRef.current?.parentElement
    if (destEl) {
      const scrollTarget = destPos.y - window.innerHeight / 2
      destEl.scrollTo({ top: Math.max(0, scrollTarget), behavior: 'smooth' })
    }

    // Animate avatar along the path over 1.2 seconds
    const duration = 1200
    let start: number | null = null
    let rafId: number

    function step(timestamp: number) {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const rawT = Math.min(elapsed / duration, 1)
      // Ease-out with slight overshoot (spring-like)
      const t = rawT < 1
        ? 1 - Math.pow(1 - rawT, 3) + (rawT > 0.8 ? Math.sin((rawT - 0.8) * Math.PI * 5) * 0.03 : 0)
        : 1

      const pos = interpolateNodes(fromIdx, toIdx, Math.min(t, 1))
      setTravelPos(pos)

      // Emit trail spark every ~80ms
      if (rawT < 1 && elapsed % 80 < 20) {
        const sparkId = trailIdRef.current++
        // Offset spark slightly randomly from center
        const ox = (Math.random() - 0.5) * 12
        const oy = (Math.random() - 0.5) * 12
        setTravelTrail(prev => [...prev.slice(-8), { x: pos.x + ox, y: pos.y + oy, id: sparkId }])
      }

      if (rawT < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        // Arrived — show burst, then clean up
        setShowBurst(toIdx)
        setTimeout(() => {
          setTravelPos(null)
          setTravelTrail([])
          setShowBurst(null)
        }, 800)
      }
    }

    // Start after a brief delay to let scroll complete
    setTimeout(() => {
      rafId = requestAnimationFrame(step)
    }, 400)

    return () => cancelAnimationFrame(rafId)
  }, [lastCompletedIndex, completedDayIds.size])

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
      <div ref={containerRef} className="relative mx-auto" style={{ width: MAP_WIDTH, height: totalHeight }}>

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

        {/* Trail sparks behind traveling avatar */}
        {travelTrail.map((spark, i) => {
          const age = (travelTrail.length - i) / travelTrail.length
          return (
            <div
              key={spark.id}
              className="absolute pointer-events-none rounded-full"
              style={{
                left: spark.x - 3,
                top: spark.y - 3,
                width: 6,
                height: 6,
                background: age > 0.5
                  ? `rgba(0, 201, 167, ${0.7 * (1 - age)})`
                  : `rgba(255, 184, 48, ${0.7 * (1 - age)})`,
                boxShadow: `0 0 ${4 + age * 4}px ${age > 0.5 ? 'rgba(0,201,167,0.4)' : 'rgba(255,184,48,0.4)'}`,
                transform: `scale(${1 - age * 0.5})`,
                transition: 'opacity 300ms',
              }}
            />
          )
        })}

        {/* Traveling avatar during animation */}
        {travelPos && profile && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: travelPos.x - 20,
              top: travelPos.y - 20,
              width: 40,
              height: 40,
              transition: 'none',
            }}
          >
            <div className="w-10 h-10 rounded-full ring-2 ring-tq-teal shadow-lg shadow-tq-teal/40 overflow-hidden">
              <Avatar profile={profile} size="sm" className="!w-10 !h-10" />
            </div>
            {/* Glow trail */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0,201,167,0.3) 0%, transparent 70%)',
                transform: 'scale(2)',
              }}
            />
          </div>
        )}

        {/* Burst effect on arrival */}
        {showBurst !== null && (() => {
          const burstPos = getNodeCenter(showBurst)
          return (
            <div
              className="absolute z-10 pointer-events-none"
              style={{ left: burstPos.x - 30, top: burstPos.y - 30, width: 60, height: 60 }}
            >
              {/* Expanding ring */}
              <div className="absolute inset-0 rounded-full border-2 border-tq-teal animate-ring-burst" />
              {/* Particle dots */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                <div
                  key={angle}
                  className="absolute w-1.5 h-1.5 rounded-full bg-tq-teal"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-24px)`,
                    opacity: 0,
                    animation: 'ring-burst 600ms ease-out forwards',
                  }}
                />
              ))}
            </div>
          )
        })()}

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
