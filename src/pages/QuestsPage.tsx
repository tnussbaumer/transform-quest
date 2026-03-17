import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, ChevronDown, ChevronUp, Trophy } from 'lucide-react'
import { useQuestHistory } from '../hooks/useQuestHistory'
import { useQuest } from '../hooks/useQuest'
import { ActiveQuestCard } from '../components/quest/ActiveQuestCard'
import JourneyMap from '../components/quest/JourneyMap'
import { Card } from '../components/ui/Card'
import type { QuestDay } from '../types/database'

export function QuestsPage() {
  const { activeQuests, completedQuests, completedDayIds, loading, refetch } = useQuestHistory()
  const { dayNumber } = useQuest()
  const navigate = useNavigate()

  const [expandedMaps, setExpandedMaps] = useState<Set<string>>(new Set())

  // Refetch when page becomes visible (navigating back from reading flow)
  const handleFocus = useCallback(() => { refetch() }, [refetch])
  useEffect(() => {
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [handleFocus])

  function toggleMap(questId: string) {
    setExpandedMaps(prev => {
      const next = new Set(prev)
      if (next.has(questId)) {
        next.delete(questId)
      } else {
        next.add(questId)
      }
      return next
    })
  }

  function handleDayClick(questDay: QuestDay) {
    const isCompleted = completedDayIds.has(questDay.id)
    const isToday = questDay.day_number === dayNumber

    if (isToday && !isCompleted) {
      navigate(`/read/${questDay.id}`)
    }
    // For completed or other days, do nothing
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-tq-text">Quests</h1>

      {loading ? (
        <Card>
          <div className="h-32 flex items-center justify-center">
            <span className="text-tq-text-muted text-sm">Loading...</span>
          </div>
        </Card>
      ) : activeQuests.length > 0 ? (
        activeQuests.map(quest => (
          <div key={quest.id} className="space-y-3">
            <ActiveQuestCard
              quest={quest}
              dayNumber={dayNumber}
              totalDays={quest.totalDays}
            />

            <button
              type="button"
              onClick={() => toggleMap(quest.id)}
              className="flex items-center gap-2 text-sm font-semibold text-tq-teal hover:text-tq-teal/80 transition-colors px-1"
            >
              {expandedMaps.has(quest.id) ? (
                <>
                  <ChevronUp size={16} />
                  Hide Journey Map
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show Journey Map
                </>
              )}
            </button>

            {expandedMaps.has(quest.id) && (
              <Card>
                <JourneyMap
                  questDays={quest.questDays}
                  completedDayIds={completedDayIds}
                  todayDayNumber={dayNumber}
                  onDayClick={handleDayClick}
                />
              </Card>
            )}
          </div>
        ))
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

        {completedQuests.length > 0 ? (
          <div className="space-y-3">
            {completedQuests.map(quest => (
              <Card key={quest.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-bold text-tq-text truncate">
                        {quest.title}
                      </h3>
                      <p className="text-xs text-tq-text-muted mt-0.5">
                        {formatDate(quest.start_date)} — {formatDate(quest.end_date)}
                      </p>
                    </div>
                    {quest.badge_icon && quest.badge_name && (
                      <div className="flex items-center gap-1.5 shrink-0 bg-tq-surface-2 rounded-lg px-2.5 py-1.5">
                        <span className="text-base">{quest.badge_icon}</span>
                        <span className="text-xs font-semibold text-tq-text-sec">
                          {quest.badge_name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Completion bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-tq-text-sec flex items-center gap-1">
                        <Trophy size={12} className="text-tq-gold" />
                        Completed
                      </span>
                      <span className="text-xs font-bold text-tq-text tabular-nums">
                        {quest.completedDays}/{quest.totalDays} days ({quest.completionPercent}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-tq-surface-2 rounded-full overflow-hidden">
                      <div
                        className="h-full gradient-quest rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${quest.completionPercent}%` }}
                        role="progressbar"
                        aria-valuenow={quest.completedDays}
                        aria-valuemin={0}
                        aria-valuemax={quest.totalDays}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <p className="text-tq-text-muted text-sm">
                Complete your first quest to see it here!
              </p>
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
