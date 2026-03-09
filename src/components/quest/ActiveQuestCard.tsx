import type { Quest } from '../../types/database'

interface ActiveQuestCardProps {
  quest: Quest
  dayNumber: number
  totalDays: number
}

export function ActiveQuestCard({ quest, dayNumber, totalDays }: ActiveQuestCardProps) {
  const progress = totalDays > 0 ? (dayNumber / totalDays) * 100 : 0

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="bg-tq-surface rounded-2xl p-5 border border-tq-border/50 glow-purple space-y-4">
      {/* Quest title & type */}
      <div>
        <p className="text-tq-purple text-xs font-bold uppercase tracking-widest mb-1">
          Active Quest
        </p>
        <h2 className="text-xl font-extrabold text-tq-text leading-tight">
          {quest.title}
        </h2>
        {quest.description && (
          <p className="text-tq-text-sec text-sm mt-1 leading-relaxed">
            {quest.description}
          </p>
        )}
      </div>

      {/* Date range */}
      <p className="text-tq-text-muted text-xs font-semibold">
        {formatDate(quest.start_date)} — {formatDate(quest.end_date)}
      </p>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-tq-text-sec">Progress</span>
          <span className="text-xs font-bold text-tq-text tabular-nums">
            Day {dayNumber} of {totalDays}
          </span>
        </div>
        <div className="h-3 bg-tq-surface-2 rounded-full overflow-hidden">
          <div
            className="h-full gradient-quest rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={dayNumber}
            aria-valuemin={0}
            aria-valuemax={totalDays}
          />
        </div>
      </div>
    </div>
  )
}
