import { useState, useEffect } from 'react'
import { getLevelProgress } from '../../lib/levels'
import { formatXp } from '../../lib/levelUtils'

interface XPProgressBarProps {
  totalXp: number
}

export function XPProgressBar({ totalXp }: XPProgressBarProps) {
  const { currentTitle, nextTitle, nextLevelXp, progress } = getLevelProgress(totalXp)
  const [animatedWidth, setAnimatedWidth] = useState(0)

  // Animate from 0 to target on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setAnimatedWidth(progress * 100)
      return
    }
    // 1-frame delay so browser registers 0% first
    const raf = requestAnimationFrame(() => {
      setAnimatedWidth(progress * 100)
    })
    return () => cancelAnimationFrame(raf)
  }, [progress])

  const isMax = nextTitle === null

  return (
    <div className="space-y-1.5">
      {/* Level labels */}
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-bold text-tq-text-sec">{currentTitle}</span>
        {!isMax && (
          <span className="text-xs font-bold text-tq-text-muted">{nextTitle}</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-tq-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full gradient-quest rounded-full"
          style={{
            width: `${animatedWidth}%`,
            transition: 'width 600ms ease-out',
          }}
        />
      </div>

      {/* XP label */}
      <p className="text-xs font-extrabold text-tq-gold tabular-nums text-center">
        {isMax
          ? `${formatXp(totalXp)} XP — Max level!`
          : `${formatXp(totalXp)} / ${formatXp(nextLevelXp!)} XP`
        }
      </p>
    </div>
  )
}
