import { useState, useEffect } from 'react'

interface BadgeRevealCardProps {
  badge: { name: string; icon: string | null }
  delay: number
  onRevealed?: () => void
}

export function BadgeRevealCard({ badge, delay, onRevealed }: BadgeRevealCardProps) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = setTimeout(() => {
      setFlipped(true)
      onRevealed?.()
    }, prefersReducedMotion ? 0 : delay)
    return () => clearTimeout(timer)
  }, [delay, onRevealed])

  return (
    <div className="w-20" style={{ perspective: '600px' }}>
      <div
        className="relative w-20 h-24 transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front — mystery */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center bg-tq-surface-2 rounded-xl border border-tq-border"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-2xl text-tq-purple">?</span>
        </div>

        {/* Back — revealed badge */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-tq-surface rounded-xl border border-tq-purple/40"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <span className="text-2xl">{badge.icon ?? '🏅'}</span>
          <span className="text-[9px] font-bold text-tq-text text-center leading-tight px-1">
            {badge.name}
          </span>
          <span className="text-[8px] font-bold text-tq-gold">Earned!</span>
        </div>
      </div>
    </div>
  )
}
