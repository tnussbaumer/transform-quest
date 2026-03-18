import { useNavigate } from 'react-router-dom'
import { Flame, Compass, Snowflake, Shield } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useQuest } from '../hooks/useQuest'
import { useCompletion } from '../hooks/useCompletion'
import { useProfile } from '../hooks/useProfile'
import { useFriends } from '../hooks/useFriends'
import { useStreakFreeze } from '../hooks/useStreakFreeze'
import { TodaysReadingCard } from '../components/home/TodaysReadingCard'
import { WeeklyStreakBar } from '../components/home/WeeklyStreakBar'
import { QuickStatsRow } from '../components/home/QuickStatsRow'
import { FriendActivitySnippet } from '../components/home/FriendActivitySnippet'
import { AnnouncementBanner } from '../components/home/AnnouncementBanner'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function HomePage() {
  const { profile } = useAuth()
  const { quest, questDay, dayNumber, totalDays, loading: questLoading } = useQuest()
  const { isCompletedToday, loading: completionLoading } = useCompletion(questDay?.id)
  const { completions, profile: fullProfile } = useProfile()
  const { friends } = useFriends()
  const { needsFreeze, freezesAvailable, useFreeze, dismiss } = useStreakFreeze()
  const navigate = useNavigate()

  const isAdmin = profile?.role === 'leader' || profile?.role === 'admin'
  const displayName = profile?.display_name ?? 'friend'
  const streak = fullProfile?.current_streak ?? profile?.current_streak ?? 0
  const totalXp = fullProfile?.total_xp ?? profile?.total_xp ?? 0

  const loading = questLoading || completionLoading

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-tq-text leading-tight">
            Hey {displayName}!
          </h1>
          <p className="text-tq-text-sec text-sm font-semibold">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-xl bg-tq-surface border border-tq-border/50 text-tq-purple hover:text-tq-purple-light hover:bg-tq-surface-2 transition-colors"
              aria-label="Admin Dashboard"
            >
              <Shield size={20} />
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-tq-surface rounded-xl px-3 py-2 border border-tq-border/50">
            <Flame size={20} className="text-tq-gold animate-fire-pulse" aria-hidden="true" />
            <span className="text-lg font-extrabold text-tq-gold tabular-nums">{streak}</span>
          </div>
        </div>
      </header>

      {/* Streak Freeze Modal */}
      {needsFreeze && (
        <Card glow="gold">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-tq-surface-2 flex items-center justify-center">
                <Snowflake size={32} className="text-tq-teal" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-tq-text">The Two-Day Rule</h2>
              <p className="text-tq-text-sec text-sm mt-1">
                Mistakes happen, but don&apos;t let it happen twice in a row! Use a freeze to save your streak.
              </p>
              <p className="text-tq-gold text-sm font-bold mt-1">
                {freezesAvailable} freeze{freezesAvailable !== 1 ? 's' : ''} available
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={dismiss}>
                Let it go
              </Button>
              <Button fullWidth onClick={async () => { await useFreeze() }}>
                Use Freeze
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Announcements */}
      <AnnouncementBanner />

      {/* Today's Reading Card */}
      {loading ? (
        <Card>
          <div className="h-32 flex items-center justify-center">
            <span className="text-tq-text-muted text-sm">Loading today's reading…</span>
          </div>
        </Card>
      ) : quest && questDay ? (
        <TodaysReadingCard
          quest={quest}
          questDay={questDay}
          dayNumber={dayNumber}
          totalDays={totalDays}
          isCompleted={isCompletedToday}
        />
      ) : (
        /* Empty state — no active quest */
        <Card>
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <Compass size={40} className="text-tq-text-muted" />
            <p className="text-tq-text font-bold">No active quest yet</p>
            <p className="text-tq-text-sec text-sm">
              Check back soon — check back soon!
            </p>
          </div>
        </Card>
      )}

      {/* Weekly Streak Bar */}
      <Card>
        <WeeklyStreakBar completions={completions} />
      </Card>

      {/* Quick Stats Row */}
      {!loading && (
        <QuickStatsRow
          streak={streak}
          totalXp={totalXp}
          dayNumber={dayNumber}
          totalDays={totalDays}
        />
      )}

      {/* Friend Activity */}
      <FriendActivitySnippet friends={friends} />
    </div>
  )
}
