import { Flame, Zap, BookOpen, Trophy } from 'lucide-react'
import { formatXp } from '../../lib/levelUtils'
import type { Profile } from '../../types/database'

interface StatsGridProps {
  profile: Profile
  passagesRead: number
}

export function StatsGrid({ profile, passagesRead }: StatsGridProps) {
  const stats = [
    {
      icon: <Flame size={22} className="text-tq-gold" />,
      value: String(profile.current_streak),
      label: 'day streak',
    },
    {
      icon: <Zap size={22} className="text-tq-gold" />,
      value: formatXp(profile.total_xp),
      label: 'total XP',
    },
    {
      icon: <BookOpen size={22} className="text-tq-teal" />,
      value: String(passagesRead),
      label: 'passages read',
    },
    {
      icon: <Trophy size={22} className="text-tq-purple" />,
      value: String(profile.longest_streak),
      label: 'longest streak',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map(({ icon, value, label }) => (
        <div
          key={label}
          className="bg-tq-surface rounded-2xl p-4 flex flex-col gap-2 border border-tq-border/50"
        >
          {icon}
          <span className="text-2xl font-extrabold text-tq-text tabular-nums leading-tight">
            {value}
          </span>
          <span className="text-xs font-semibold text-tq-text-muted capitalize">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
