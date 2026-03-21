import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Compass, Snowflake, Shield } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useQuest } from '../hooks/useQuest'
import { useProfile } from '../hooks/useProfile'
import { useFriends } from '../hooks/useFriends'
import { useStreakFreeze } from '../hooks/useStreakFreeze'
import { hasUnlock } from '../lib/cosmeticUnlocks'
import { supabase } from '../lib/supabase'
import { Avatar } from '../components/profile/Avatar'
import { AvatarLightbox } from '../components/ui/AvatarLightbox'
import { TodaysReadingCard } from '../components/home/TodaysReadingCard'
import { WeeklyStreakBar } from '../components/home/WeeklyStreakBar'
import { QuickStatsRow } from '../components/home/QuickStatsRow'
import { FriendActivitySnippet } from '../components/home/FriendActivitySnippet'
import { AnnouncementBanner } from '../components/home/AnnouncementBanner'
import { NotificationPrompt } from '../components/home/NotificationPrompt'
import { InstallBanner } from '../components/home/InstallBanner'
import { AnimatedFlame } from '../components/ui/AnimatedFlame'
import { XPProgressBar } from '../components/ui/XPProgressBar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export function HomePage() {
  const { profile } = useAuth()
  const { quest, questDay, dayNumber, totalDays, isCurrentDayCompleted, loading: questLoading } = useQuest()
  const { completions, profile: fullProfile } = useProfile()
  const { friends } = useFriends()
  const { needsFreeze, freezesAvailable, useFreeze, dismiss } = useStreakFreeze()
  const navigate = useNavigate()

  const isAdmin = profile?.role === 'leader' || profile?.role === 'admin'
  const displayName = profile?.display_name ?? 'friend'
  const streak = fullProfile?.current_streak ?? profile?.current_streak ?? 0
  const totalXp = fullProfile?.total_xp ?? profile?.total_xp ?? 0
  const showAnimatedFlame = profile ? hasUnlock(profile, 'animated_flame') : false

  const [completedTodayIds, setCompletedTodayIds] = useState<Set<string>>(new Set())
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Fetch who completed today's quest day (for friend activity snippet)
  useEffect(() => {
    if (!questDay?.id) return
    supabase
      .from('completions')
      .select('user_id')
      .eq('quest_day_id', questDay.id)
      .then(({ data }) => {
        setCompletedTodayIds(new Set(((data as { user_id: string }[]) ?? []).map(c => c.user_id)))
      })
  }, [questDay?.id])

  const loading = questLoading

  return (
    <div className="px-4 pb-6 space-y-6">
      {/* Header with subtle gradient + safe area padding for notch */}
      <header
        className="flex items-center justify-between animate-fade-up pt-safe"
        style={{
          background: 'linear-gradient(180deg, rgba(139,92,246,0.06) 0%, transparent 100%)',
          margin: '0 -16px 0',
          padding: '16px 16px 0',
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
          borderRadius: '0 0 24px 24px',
        }}
      >
        {/* Avatar + greeting */}
        <div className="flex items-center gap-3">
          {profile && (
            <Avatar
              profile={profile}
              size="md"
              onTap={() => setLightboxOpen(true)}
            />
          )}
          <div>
            <h1 className="text-xl font-extrabold text-tq-text leading-tight">
              Hey {displayName}!
            </h1>
            <p className="text-tq-text-sec text-xs font-semibold">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Right side: admin + streak */}
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
            {showAnimatedFlame ? (
              <AnimatedFlame size={20} />
            ) : (
              <Flame size={20} className={`text-tq-gold ${streak > 0 ? 'animate-fire-pulse' : ''}`} aria-hidden="true" />
            )}
            <span className="text-lg font-extrabold text-tq-gold tabular-nums">{streak}</span>
          </div>
        </div>
      </header>

      {/* Avatar Lightbox */}
      {profile && (
        <AvatarLightbox
          user={lightboxOpen ? { ...profile, level_title: profile.level_title } : null}
          onClose={() => setLightboxOpen(false)}
        />
      )}

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

      {/* Install Banner (shows when app not installed) */}
      <InstallBanner />

      {/* Notification Prompt (shows after 2+ completions) */}
      <NotificationPrompt />

      {/* Today's Reading Card */}
      {loading ? (
        <div className="animate-fade-up" style={{ animationDelay: '50ms' }}>
          <Card>
            <div className="space-y-4">
              <div className="skeleton h-4 w-32" />
              <div className="skeleton h-7 w-48" />
              <div className="skeleton h-4 w-24" />
              <div className="skeleton h-12 w-full rounded-xl" />
            </div>
          </Card>
        </div>
      ) : quest && questDay ? (
        <div className="animate-fade-up" style={{ animationDelay: '50ms' }}>
          <TodaysReadingCard
            quest={quest}
            questDay={questDay}
            dayNumber={dayNumber}
            totalDays={totalDays}
            isCompleted={isCurrentDayCompleted}
          />
        </div>
      ) : (
        <div className="animate-fade-up" style={{ animationDelay: '50ms' }}>
          <Card>
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-tq-surface-2 flex items-center justify-center">
                <Compass size={32} className="text-tq-text-muted" />
              </div>
              <p className="text-tq-text font-bold text-lg">No active quest right now</p>
              <p className="text-tq-text-sec text-sm max-w-[240px]">
                Check back soon!
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Weekly Streak Bar */}
      <div className="animate-fade-up" style={{ animationDelay: '150ms' }}>
        <Card>
          <WeeklyStreakBar completions={completions} />
        </Card>
      </div>

      {/* Quick Stats Row */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '250ms' }}>
          {[0, 1, 2].map(i => (
            <Card key={i}><div className="space-y-2"><div className="skeleton h-5 w-5 rounded-full" /><div className="skeleton h-7 w-12" /><div className="skeleton h-3 w-16" /></div></Card>
          ))}
        </div>
      ) : (
        <div className="animate-fade-up" style={{ animationDelay: '250ms' }}>
          <QuickStatsRow
            streak={streak}
            totalXp={totalXp}
            dayNumber={dayNumber}
            totalDays={totalDays}
          />
        </div>
      )}

      {/* XP Progress Bar */}
      {!loading && (
        <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
          <Card>
            <XPProgressBar totalXp={totalXp} />
          </Card>
        </div>
      )}

      {/* Friend Activity */}
      <div className="animate-fade-up" style={{ animationDelay: '350ms' }}>
        <FriendActivitySnippet friends={friends} completedTodayIds={completedTodayIds} />
      </div>
    </div>
  )
}
