import { Compass } from 'lucide-react'
import { useQuest } from '../hooks/useQuest'
import { ActiveQuestCard } from '../components/quest/ActiveQuestCard'
import { Card } from '../components/ui/Card'

export function QuestsPage() {
  const { quest, dayNumber, totalDays, loading } = useQuest()

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-tq-text">Quests</h1>

      {loading ? (
        <Card>
          <div className="h-32 flex items-center justify-center">
            <span className="text-tq-text-muted text-sm">Loading…</span>
          </div>
        </Card>
      ) : quest ? (
        <ActiveQuestCard quest={quest} dayNumber={dayNumber} totalDays={totalDays} />
      ) : (
        <Card>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Compass size={40} className="text-tq-text-muted" />
            <p className="text-tq-text font-bold">No active quest</p>
            <p className="text-tq-text-sec text-sm">
              A new quest will be added soon. Check back!
            </p>
          </div>
        </Card>
      )}

      {/* Completed quests section */}
      <section aria-label="Completed quests">
        <h2 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-3">
          Completed Quests
        </h2>
        <Card>
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="text-tq-text-muted text-sm">
              Complete your first quest to see it here!
            </p>
          </div>
        </Card>
      </section>
    </div>
  )
}
