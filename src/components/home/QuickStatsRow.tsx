import { Flame, Zap, BookOpen } from 'lucide-react'
import { useCountUp } from '../../hooks/useCountUp'
import { formatXp } from '../../lib/levelUtils'

interface QuickStatsRowProps {
  streak: number
  totalXp: number
  dayNumber: number
  totalDays: number
}

export function QuickStatsRow({ streak, totalXp, dayNumber, totalDays }: QuickStatsRowProps) {
  const animStreak = useCountUp(streak)
  const animXp = useCountUp(totalXp)
  const animDay = useCountUp(dayNumber)

  const stats = [
    {
      icon: <Flame size={20} className={`text-tq-gold ${streak > 0 ? 'animate-fire-pulse' : ''}`} />,
      value: String(animStreak),
      label: 'day streak',
    },
    {
      icon: <Zap size={20} className="text-tq-gold" />,
      value: formatXp(animXp),
      label: 'total XP',
    },
    {
      icon: <BookOpen size={20} className="text-tq-teal" />,
      value: `${animDay}/${totalDays}`,
      label: 'quest days',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ icon, value, label }) => (
        <div
          key={label}
          className="bg-tq-surface rounded-xl p-3 flex flex-col items-center gap-1 border border-tq-border/50"
        >
          {icon}
          <span className="text-lg font-extrabold text-tq-text tabular-nums leading-tight">
            {value}
          </span>
          <span className="text-xs font-semibold text-tq-text-muted text-center leading-tight">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
