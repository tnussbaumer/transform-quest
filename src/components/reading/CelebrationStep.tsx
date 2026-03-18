import { useState, useEffect } from 'react'
import { Flame } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Button } from '../ui/Button'
import { ShareButton } from './ShareButton'
import type { QuestDay, NewBadge } from '../../types/database'

interface CelebrationStepProps {
  streak: number
  xpEarned: number
  questDay: QuestDay | null
  dayNumber: number
  answers: { a1: string; a2: string; a3: string }
  newBadges: NewBadge[]
  onContinue: () => void
}

const CONFETTI_COLORS = ['#00C9A7', '#FFB830', '#8B5CF6', '#34D399']

export function CelebrationStep({
  streak,
  xpEarned,
  questDay,
  dayNumber,
  answers,
  newBadges,
  onContinue,
}: CelebrationStepProps) {
  const [displayStreak, setDisplayStreak] = useState(Math.max(streak - 1, 0))
  const [streakBouncing, setStreakBouncing] = useState(false)
  const [xpAnimating, setXpAnimating] = useState(false)
  const isMilestone = questDay?.is_milestone ?? false

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!prefersReducedMotion) {
      // Fire confetti
      confetti({
        particleCount: isMilestone ? 120 : 80,
        spread: isMilestone ? 90 : 70,
        colors: CONFETTI_COLORS,
        origin: { y: 0.6 },
      })

      if (isMilestone) {
        setTimeout(() => {
          confetti({
            particleCount: 60,
            spread: 120,
            colors: CONFETTI_COLORS,
            origin: { y: 0.4 },
            angle: 60,
          })
          confetti({
            particleCount: 60,
            spread: 120,
            colors: CONFETTI_COLORS,
            origin: { y: 0.4 },
            angle: 120,
          })
        }, 400)
      }
    }

    // Streak count-up animation after a brief delay
    const t1 = setTimeout(() => {
      setStreakBouncing(true)
      setDisplayStreak(streak)
      // Remove bounce class after animation
      setTimeout(() => setStreakBouncing(false), 500)
    }, prefersReducedMotion ? 0 : 300)

    // XP fly-up animation
    const t2 = setTimeout(() => {
      setXpAnimating(true)
    }, prefersReducedMotion ? 0 : 600)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 py-12 text-center">
      <div className="space-y-6 w-full max-w-xs">

        {/* Milestone banner */}
        {isMilestone && (
          <div className="space-y-1">
            <p className="text-tq-purple text-lg font-extrabold">🎉 Quest Milestone!</p>
            <p className="text-tq-gold text-sm font-bold">+100 XP Bonus!</p>
          </div>
        )}

        {/* Fire icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full gradient-fire flex items-center justify-center glow-gold">
            <Flame size={52} className="text-white animate-fire-pulse" strokeWidth={2} />
          </div>
        </div>

        {/* Streak display */}
        <div className="space-y-1">
          <div
            className={`text-tq-gold tabular-nums leading-none font-black transition-all duration-300 ${streakBouncing ? 'animate-streak-bounce' : ''}`}
            style={{ fontSize: '4rem' }}
          >
            {displayStreak}
          </div>
          <p className="text-2xl font-extrabold text-tq-gold">day streak!</p>
        </div>

        {/* XP fly-up + static card */}
        <div className="relative">
          {/* Animated fly-up */}
          {xpAnimating && (
            <div
              className="absolute inset-x-0 flex justify-center pointer-events-none"
              style={{ top: '-8px' }}
            >
              <span className="text-2xl font-extrabold text-tq-gold glow-gold animate-xp-flyup">
                +{xpEarned} XP
              </span>
            </div>
          )}

          {/* Static XP card */}
          <div className="bg-tq-surface rounded-2xl px-6 py-4 border border-tq-border/50">
            <p className="text-3xl font-extrabold text-tq-gold">+{xpEarned} XP</p>
            <p className="text-tq-text-sec text-sm font-semibold mt-1">earned today</p>
          </div>
        </div>

        {/* New badges earned */}
        {newBadges.length > 0 && (
          <div className="bg-tq-surface rounded-2xl px-4 py-4 border border-tq-purple/40 space-y-3">
            <p className="text-tq-purple font-extrabold text-sm">🏆 New Badge{newBadges.length > 1 ? 's' : ''} Earned!</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {newBadges.map(b => (
                <div key={b.id} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full bg-tq-surface-2 ring-2 ring-tq-purple flex items-center justify-center">
                    <span className="text-xl">{b.icon ?? '🏅'}</span>
                  </div>
                  <span className="text-tq-text-sec text-xs font-semibold max-w-[56px] text-center leading-tight">
                    {b.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <ShareButton
            dayNumber={dayNumber}
            passageReference={questDay?.passage_reference ?? ''}
            answers={answers}
            streakCount={streak}
            fullWidth
          />
          <Button fullWidth onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
