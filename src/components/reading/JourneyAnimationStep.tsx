import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../profile/Avatar'
import type { Profile } from '../../types/database'

interface JourneyAnimationStepProps {
  profile: Profile
  fromDayNumber: number
  toDayNumber: number
  onComplete: () => void
}

// Simplified layout matching JourneyMap's S-curve
const X_PATTERN = [0.5, 0.78, 0.5, 0.22]
const MAP_WIDTH = 300
const NODE_GAP = 90
const PADDING_TOP = 60

function getPos(dayIndex: number) {
  const x = X_PATTERN[dayIndex % X_PATTERN.length] * MAP_WIDTH
  const y = PADDING_TOP + dayIndex * NODE_GAP
  return { x, y }
}

function interpolate(fromIdx: number, toIdx: number, t: number) {
  const from = getPos(fromIdx)
  const to = getPos(toIdx)
  const midY = (from.y + to.y) / 2
  const u = 1 - t
  return {
    x: u * u * u * from.x + 3 * u * u * t * from.x + 3 * u * t * t * to.x + t * t * t * to.x,
    y: u * u * u * from.y + 3 * u * u * t * midY + 3 * u * t * t * midY + t * t * t * to.y,
  }
}

export function JourneyAnimationStep({ profile, fromDayNumber, toDayNumber, onComplete }: JourneyAnimationStepProps) {
  const hasStarted = useRef(false)
  const [avatarPos, setAvatarPos] = useState<{ x: number; y: number } | null>(null)
  const [trail, setTrail] = useState<{ x: number; y: number; id: number }[]>([])
  const [showBurst, setShowBurst] = useState(false)
  const [done, setDone] = useState(false)
  const trailId = useRef(0)

  const fromIdx = fromDayNumber - 1
  const toIdx = toDayNumber - 1

  // Show 3 nodes: previous completed, current destination, and next
  const visibleNodes = [
    { idx: fromIdx, label: `Day ${fromDayNumber}`, completed: true },
    { idx: toIdx, label: `Day ${toDayNumber}`, completed: false },
  ]
  if (toIdx + 1 < 79) {
    visibleNodes.push({ idx: toIdx + 1, label: `Day ${toDayNumber + 1}`, completed: false })
  }

  const totalHeight = PADDING_TOP + (visibleNodes.length) * NODE_GAP + 40

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDone(true)
      setTimeout(onComplete, 500)
      return
    }

    // Start avatar at the "from" node
    setAvatarPos(getPos(0)) // index 0 in our visible nodes = fromIdx position

    const duration = 1500
    let start: number | null = null
    let rafId: number

    function step(timestamp: number) {
      if (start === null) start = timestamp
      const elapsed = timestamp - start
      const rawT = Math.min(elapsed / duration, 1)
      // Ease-out cubic with spring overshoot
      const t = rawT < 1
        ? 1 - Math.pow(1 - rawT, 3) + (rawT > 0.85 ? Math.sin((rawT - 0.85) * Math.PI * 6) * 0.02 : 0)
        : 1

      const pos = interpolate(0, 1, Math.min(t, 1)) // animate between first two visible nodes
      setAvatarPos(pos)

      // Emit golden trail spark every ~60ms
      if (rawT < 1 && elapsed % 60 < 18) {
        const id = trailId.current++
        const ox = (Math.random() - 0.5) * 16
        const oy = (Math.random() - 0.5) * 16
        setTrail(prev => [...prev.slice(-10), { x: pos.x + ox, y: pos.y + oy, id }])
      }

      if (rawT < 1) {
        rafId = requestAnimationFrame(step)
      } else {
        setShowBurst(true)
        setDone(true)
        setTimeout(() => {
          setAvatarPos(null)
          setTrail([])
          onComplete()
        }, 1500)
      }
    }

    // Delay start so the screen renders first
    setTimeout(() => {
      rafId = requestAnimationFrame(step)
    }, 600)

    return () => cancelAnimationFrame(rafId)
  }, [onComplete])

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 py-8">
      {/* Title */}
      <div className="text-center mb-6 animate-fade-up">
        <h2 className="text-xl font-extrabold text-tq-text">Your Journey</h2>
        <p className="text-tq-text-sec text-sm mt-1">
          {done ? `Day ${toDayNumber} complete!` : 'Advancing...'}
        </p>
      </div>

      {/* Mini journey map */}
      <div className="relative" style={{ width: MAP_WIDTH, height: totalHeight }}>
        {/* Path line between visible nodes */}
        <svg width={MAP_WIDTH} height={totalHeight} className="absolute inset-0">
          <defs>
            <linearGradient id="miniPathGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#FFB830" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#2D3154" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {visibleNodes.slice(1).map((_node, i) => {
            const prev = getPos(i)
            const curr = getPos(i + 1)
            const midY = (prev.y + curr.y) / 2
            return (
              <path
                key={i}
                d={`M ${prev.x} ${prev.y} C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`}
                stroke="url(#miniPathGrad)"
                strokeWidth={4}
                strokeLinecap="round"
                fill="none"
              />
            )
          })}
        </svg>

        {/* Nodes */}
        {visibleNodes.map((node, i) => {
          const pos = getPos(i)
          const isCurrent = i === 1 && done
          return (
            <div
              key={node.idx}
              className="absolute"
              style={{ left: pos.x - 24, top: pos.y - 24, width: 48, height: 48 }}
            >
              <div className={[
                'w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold',
                'transition-all duration-500',
                node.completed ? 'bg-gradient-to-br from-tq-teal to-tq-teal-dark ring-2 ring-tq-teal/30 text-white' : '',
                isCurrent ? 'bg-gradient-to-br from-tq-teal to-tq-teal-dark ring-2 ring-tq-teal/30 text-white scale-110' : '',
                !node.completed && !isCurrent ? 'bg-tq-surface-2 border-2 border-tq-border/40 text-tq-text-muted' : '',
              ].join(' ')}>
                {node.completed || isCurrent ? '✓' : node.idx + 1}
              </div>
              <p className="text-[10px] font-bold text-tq-text-sec text-center mt-1 whitespace-nowrap">
                {node.label}
              </p>
            </div>
          )
        })}

        {/* Golden trail sparks */}
        {trail.map((spark, i) => {
          const age = (trail.length - i) / trail.length
          return (
            <div
              key={spark.id}
              className="absolute pointer-events-none rounded-full"
              style={{
                left: spark.x - 5,
                top: spark.y - 5,
                width: 10,
                height: 10,
                background: `rgba(255, 184, 48, ${0.8 * (1 - age)})`,
                boxShadow: `0 0 ${8 + age * 8}px rgba(255, 184, 48, ${0.6 * (1 - age)})`,
                transform: `scale(${1 - age * 0.4})`,
              }}
            />
          )
        })}

        {/* Traveling avatar */}
        {avatarPos && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{ left: avatarPos.x - 22, top: avatarPos.y - 22, width: 44, height: 44 }}
          >
            <div className="w-11 h-11 rounded-full ring-2 ring-tq-gold shadow-lg shadow-tq-gold/50 overflow-hidden">
              <Avatar profile={profile} size="sm" className="!w-11 !h-11" />
            </div>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,184,48,0.35) 0%, transparent 70%)',
                transform: 'scale(2.5)',
              }}
            />
          </div>
        )}

        {/* Burst on arrival */}
        {showBurst && (() => {
          const burstPos = getPos(1)
          return (
            <div
              className="absolute z-10 pointer-events-none"
              style={{ left: burstPos.x - 36, top: burstPos.y - 36, width: 72, height: 72 }}
            >
              <div className="absolute inset-0 rounded-full border-2 border-tq-gold animate-ring-burst" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                <div
                  key={angle}
                  className="absolute w-2 h-2 rounded-full bg-tq-gold"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-30px)`,
                    opacity: 0,
                    animation: 'ring-burst 600ms ease-out forwards',
                  }}
                />
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
