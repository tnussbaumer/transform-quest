import { useState, useEffect } from 'react'
import { Snowflake, Pencil, Bell, BellOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { useBadges } from '../hooks/useBadges'
import { ProfileHeader } from '../components/profile/ProfileHeader'
import { StatsGrid } from '../components/profile/StatsGrid'
import { StreakCalendar } from '../components/profile/StreakCalendar'
import { BadgesGrid } from '../components/profile/BadgesGrid'
import { AvatarPicker } from '../components/profile/AvatarPicker'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { XPProgressBar } from '../components/ui/XPProgressBar'
import { AvatarLightbox } from '../components/ui/AvatarLightbox'
import { BibleReadingGuide } from '../components/reading/BibleReadingGuide'
import { JournalSection } from '../components/profile/JournalSection'
import { useJournal } from '../hooks/useJournal'
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  hasActivePushSubscription,
} from '../lib/pushNotifications'

export function ProfilePage() {
  const { signOut, patchProfile } = useAuth()
  const { profile, completions, loading, refetch } = useProfile()
  const { allBadges, earnedBadges } = useBadges()
  const { entries: journalEntries, loading: journalLoading } = useJournal()
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)

  // Notification settings state
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [notifToggling, setNotifToggling] = useState(false)
  const [reminderTime, setReminderTime] = useState('19:00')
  const [savingTime, setSavingTime] = useState(false)

  const pushSupported = isPushSupported()
  const permissionState = pushSupported ? getNotificationPermission() : 'denied'

  // Check current subscription status
  useEffect(() => {
    if (!pushSupported) return
    hasActivePushSubscription().then(setNotifEnabled)
  }, [pushSupported])

  // Sync reminder time from profile
  useEffect(() => {
    if (profile?.daily_reminder_time) {
      // Convert HH:MM:SS to HH:MM for input
      setReminderTime(profile.daily_reminder_time.slice(0, 5))
    }
  }, [profile?.daily_reminder_time])

  if (loading || !profile) {
    return (
      <div className="px-4 py-6 space-y-6">
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="skeleton w-20 h-20 rounded-full" />
          <div className="skeleton h-7 w-40" />
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-1.5 w-40 mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(i => (
            <Card key={i}><div className="space-y-2"><div className="skeleton h-5 w-5 rounded-full" /><div className="skeleton h-7 w-12" /><div className="skeleton h-3 w-20" /></div></Card>
          ))}
        </div>
        <Card><div className="skeleton h-48 w-full" /></Card>
      </div>
    )
  }

  async function handleAvatarSelect(update: { avatar_type: 'preset' | 'custom'; avatar_preset: string; avatar_url: string | null }) {
    if (!profile) return
    await supabase
      .from('profiles')
      .update(update)
      .eq('id', profile.id)
    patchProfile(update)
    await refetch()
    setEditingAvatar(false)
  }

  async function handleToggleNotifications() {
    setNotifToggling(true)
    if (notifEnabled) {
      await unsubscribeFromPush()
      patchProfile({ push_subscription: null })
      setNotifEnabled(false)
    } else {
      const subscription = await subscribeToPush()
      if (subscription) {
        patchProfile({ push_subscription: subscription.toJSON() as Record<string, unknown> })
        setNotifEnabled(true)
      }
    }
    setNotifToggling(false)
  }

  async function handleReminderTimeChange(newTime: string) {
    setReminderTime(newTime)
    setSavingTime(true)
    await supabase
      .from('profiles')
      .update({ daily_reminder_time: newTime })
      .eq('id', profile!.id)
    patchProfile({ daily_reminder_time: newTime })
    setSavingTime(false)
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="animate-fade-up">
        <ProfileHeader profile={profile} onAvatarTap={() => setLightboxOpen(true)} />
      </div>

      <AvatarLightbox
        user={lightboxOpen ? { ...profile, level_title: profile.level_title } : null}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Edit Avatar button */}
      <div className="flex justify-center -mt-4 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <button
          onClick={() => setEditingAvatar(!editingAvatar)}
          className="flex items-center gap-1.5 text-xs font-bold text-tq-teal hover:text-tq-teal-light transition-colors"
        >
          <Pencil size={12} />
          {editingAvatar ? 'Close' : 'Edit Avatar'}
        </button>
      </div>

      {/* XP Progress Bar */}
      <div className="animate-fade-up -mt-2" style={{ animationDelay: '75ms' }}>
        <Card>
          <XPProgressBar totalXp={profile.total_xp} />
        </Card>
      </div>

      {editingAvatar && (
        <Card>
          <AvatarPicker
            userId={profile.id}
            currentPreset={profile.avatar_preset}
            currentAvatarUrl={profile.avatar_url}
            currentAvatarType={profile.avatar_type}
            onSelect={handleAvatarSelect}
          />
        </Card>
      )}

      {/* Stats Grid */}
      <section aria-label="Statistics" className="animate-fade-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-3">
          Your Stats
        </h2>
        <StatsGrid profile={profile} passagesRead={completions.length} />
      </section>

      {/* Streak Freezes */}
      {profile.streak_freezes_available > 0 && (
        <div className="flex items-center gap-2 px-1 animate-fade-up" style={{ animationDelay: '150ms' }}>
          <Snowflake size={16} className="text-tq-teal" />
          <span className="text-tq-text-sec text-sm font-semibold">
            {profile.streak_freezes_available} Two-Day Rule freeze{profile.streak_freezes_available !== 1 ? 's' : ''} available
          </span>
        </div>
      )}

      {/* Badges */}
      <section aria-label="Badges" className="animate-fade-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-3">
          Badges
        </h2>
        <Card>
          <BadgesGrid allBadges={allBadges} earnedBadges={earnedBadges} currentStreak={profile.current_streak} />
        </Card>
      </section>

      {/* My Journal */}
      <div className="animate-fade-up" style={{ animationDelay: '250ms' }}>
        <JournalSection entries={journalEntries} loading={journalLoading} />
      </div>

      {/* Streak Calendar */}
      <section aria-label="Streak calendar" className="animate-fade-up" style={{ animationDelay: '350ms' }}>
        <Card>
          <h2 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-4">
            Streak Calendar
          </h2>
          <StreakCalendar completions={completions} />
        </Card>
      </section>

      {/* Notifications */}
      <section aria-label="Notifications" className="animate-fade-up" style={{ animationDelay: '350ms' }}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-3">
          Notifications
        </h2>
        <Card>
          <div className="space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {notifEnabled ? (
                  <Bell size={20} className="text-tq-teal" />
                ) : (
                  <BellOff size={20} className="text-tq-text-muted" />
                )}
                <div>
                  <p className="text-sm font-bold text-tq-text">Daily Reminders</p>
                  {!pushSupported ? (
                    <p className="text-xs text-tq-text-muted">Not supported on this device</p>
                  ) : permissionState === 'denied' ? (
                    <p className="text-xs text-tq-text-muted">Blocked — enable in browser settings</p>
                  ) : notifEnabled ? (
                    <p className="text-xs text-tq-success">Enabled</p>
                  ) : (
                    <p className="text-xs text-tq-text-muted">Not enabled</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleToggleNotifications}
                disabled={!pushSupported || permissionState === 'denied' || notifToggling}
                className={[
                  'relative w-12 h-7 rounded-full transition-colors duration-200',
                  notifEnabled ? 'bg-tq-teal' : 'bg-tq-surface-2',
                  (!pushSupported || permissionState === 'denied') ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                ].join(' ')}
                role="switch"
                aria-checked={notifEnabled}
                aria-label="Toggle daily reminders"
              >
                <span
                  className={[
                    'absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-200',
                    notifEnabled ? 'translate-x-6' : 'translate-x-1',
                  ].join(' ')}
                />
              </button>
            </div>

            {/* Reminder time picker (shown when enabled) */}
            {notifEnabled && (
              <div className="flex items-center justify-between pt-2 border-t border-tq-border/40">
                <p className="text-sm text-tq-text-sec">Reminder time</p>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={e => handleReminderTimeChange(e.target.value)}
                    className="bg-tq-surface-2 text-tq-text text-sm font-semibold rounded-lg px-3 py-1.5 border border-tq-border/50 focus:border-tq-teal focus:outline-none"
                    style={{ fontSize: '16px' }}
                  />
                  {savingTime && (
                    <span className="text-xs text-tq-text-muted">Saving...</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* Settings */}
      <section aria-label="Settings" className="animate-fade-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-3">
          Settings
        </h2>
        <div className="space-y-3">
          <button
            onClick={() => setGuideOpen(true)}
            className="w-full bg-tq-surface rounded-xl p-4 border border-tq-border/50 text-left hover:bg-tq-surface-2 transition-colors flex items-center gap-3 min-h-[44px]"
          >
            <span className="text-lg">📖</span>
            <span className="text-sm font-semibold text-tq-text">How to Read the Bible</span>
          </button>
          <Button
            variant="danger"
            fullWidth
            onClick={signOut}
          >
            Sign Out
          </Button>
        </div>
      </section>

      <BibleReadingGuide open={guideOpen} onClose={() => setGuideOpen(false)} />

      <div className="h-4" />
    </div>
  )
}
