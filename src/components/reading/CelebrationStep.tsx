import { Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

interface CelebrationStepProps {
  streak: number
  xpEarned: number
}

export function CelebrationStep({ streak, xpEarned }: CelebrationStepProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-6 py-12 text-center">
      <div className="space-y-8 w-full max-w-xs">
        {/* Fire icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-full gradient-fire flex items-center justify-center glow-gold">
            <Flame size={52} className="text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Streak display */}
        <div className="space-y-1">
          <div
            className="text-tq-gold tabular-nums leading-none font-black"
            style={{ fontSize: '4rem' }}
          >
            {streak}
          </div>
          <p className="text-2xl font-extrabold text-tq-gold">day streak!</p>
        </div>

        {/* XP earned */}
        <div className="bg-tq-surface rounded-2xl px-6 py-4 border border-tq-border/50">
          <p className="text-3xl font-extrabold text-tq-gold">+{xpEarned} XP</p>
          <p className="text-tq-text-sec text-sm font-semibold mt-1">earned today</p>
        </div>

        {/* Continue button */}
        <Button fullWidth onClick={() => navigate('/', { replace: true })}>
          Continue
        </Button>
      </div>
    </div>
  )
}
