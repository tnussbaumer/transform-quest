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
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-tq-text-muted text-sm">Loading profile...</span>
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
      <ProfileHeader profile={profile} />

      {/* Edit Avatar button */}
      <div className="flex justify-center -mt-4">
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
      <section aria-label="Statistics">
        <h2 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-3">
          Your Stats
        </h2>
        <StatsGrid profile={profile} passagesRead={completions.length} />
      </section>

      {/* Streak Freezes — "The Two-Day Rule" */}
      {profile && profile.streak_freezes_available > 0 && (
        <div className="flex items-center gap-2 px-1">
          <Snowflake size={16} className="text-tq-teal" />
          <span className="text-tq-text-sec text-sm font-semibold">
            {profile.streak_freezes_available} Two-Day Rule freeze{profile.streak_freezes_available !== 1 ? 's' : ''} available
          </span>
        </div>
      )}

      {/* Badges */}
      <section aria-label="Badges">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-3">
          Badges
        </h2>
        <Card>
          <BadgesGrid allBadges={allBadges} earnedBadges={earnedBadges} />
        </Card>
      </section>

      {/* Streak Calendar */}
      <section aria-label="Streak calendar">
        <Card>
          <h2 className="text-xs font-bold uppercase tracking-widest text-tq-text-muted mb-4">
            Streak Calendar
          </h2>
          <StreakCalendar completions={completions} />
        </Card>
      </section>

      {/* Settings */}
      <section aria-label="Settings">
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
