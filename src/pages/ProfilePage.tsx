import { useState } from 'react'
import { Snowflake, Pencil } from 'lucide-react'
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

export function ProfilePage() {
  const { signOut, patchProfile } = useAuth()
  const { profile, completions, loading, refetch } = useProfile()
  const { allBadges, earnedBadges } = useBadges()
  const [editingAvatar, setEditingAvatar] = useState(false)

  if (loading || !profile) {
    return (
      <div className="px-4 py-6 space-y-6">
        {/* Skeleton: Avatar + name */}
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="skeleton w-20 h-20 rounded-full" />
          <div className="skeleton h-7 w-40" />
          <div className="skeleton h-4 w-20" />
          <div className="skeleton h-1.5 w-40 mt-1" />
        </div>
        {/* Skeleton: Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map(i => (
            <Card key={i}><div className="space-y-2"><div className="skeleton h-5 w-5 rounded-full" /><div className="skeleton h-7 w-12" /><div className="skeleton h-3 w-20" /></div></Card>
          ))}
        </div>
        {/* Skeleton: Calendar */}
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

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="animate-fade-up">
        <ProfileHeader profile={profile} />
      </div>

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
          <BadgesGrid allBadges={allBadges} earnedBadges={earnedBadges} />
        </Card>
      </section>

      {/* Streak Calendar */}
      <section aria-label="Streak calendar" className="animate-fade-up" style={{ animationDelay: '300ms' }}>
        <Card>
          <h2 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-4">
            Streak Calendar
          </h2>
          <StreakCalendar completions={completions} />
        </Card>
      </section>

      {/* Settings */}
      <section aria-label="Settings" className="animate-fade-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-3">
          Settings
        </h2>
        <Button
          variant="danger"
          fullWidth
          onClick={signOut}
        >
          Sign Out
        </Button>
      </section>

      <div className="h-4" />
    </div>
  )
}
