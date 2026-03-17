import { useState } from 'react'
import { Users, Flame, TrendingUp, BarChart3, Send } from 'lucide-react'
import { useAdminStats } from '../../hooks/useAdminStats'
import { isCompletedToday } from '../../lib/streakUtils'
import { supabase } from '../../lib/supabase'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export function EngagementDashboard() {
  const { totalUsers, activeToday, avgStreak, completionRate, profiles, loading } = useAdminStats()
  const [nudging, setNudging] = useState(false)
  const [nudgeResult, setNudgeResult] = useState<string | null>(null)

  const streakLeaders = profiles
    .filter(p => p.current_streak > 0)
    .slice(0, 10)

  const inactiveUsers = profiles.filter(p => !isCompletedToday(p.last_completed_at))

  async function handleNudgeAll() {
    setNudging(true)
    setNudgeResult(null)
    try {
      // Get today's quest day
      const today = new Date().toISOString().split('T')[0]
      const { data: quests } = await supabase
        .from('quests')
        .select('id')
        .eq('is_active', true)
        .lte('start_date', today)
        .gte('end_date', today)
        .limit(1)

      if (!quests || quests.length === 0) {
        setNudgeResult('No active quest today')
        return
      }

      const questId = (quests[0] as { id: string }).id
      const { data: days } = await supabase
        .from('quest_days')
        .select('id')
        .eq('quest_id', questId)
        .limit(1)

      if (!days || days.length === 0) {
        setNudgeResult('No quest days found')
        return
      }

      const questDayId = (days[0] as { id: string }).id
      let sent = 0

      for (const user of inactiveUsers) {
        const { error } = await supabase.rpc('send_nudge', {
          p_to_user_id: user.id,
          p_quest_day_id: questDayId,
        })
        if (!error) sent++
      }

      setNudgeResult(`Nudged ${sent} user${sent !== 1 ? 's' : ''}`)
    } catch {
      setNudgeResult('Failed to send nudges')
    } finally {
      setNudging(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-tq-text-muted text-sm">Loading stats...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tq-teal/20 flex items-center justify-center">
              <Users size={20} className="text-tq-teal" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-tq-text">{totalUsers}</p>
              <p className="text-xs text-tq-text-muted">Total Users</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tq-success/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-tq-success" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-tq-text">{activeToday}</p>
              <p className="text-xs text-tq-text-muted">Active Today</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tq-gold/20 flex items-center justify-center">
              <Flame size={20} className="text-tq-gold" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-tq-text">{avgStreak}</p>
              <p className="text-xs text-tq-text-muted">Avg Streak</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tq-purple/20 flex items-center justify-center">
              <BarChart3 size={20} className="text-tq-purple" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-tq-text">{completionRate}%</p>
              <p className="text-xs text-tq-text-muted">Today&apos;s Rate</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Streak Leaderboard */}
      <section>
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-sec mb-3">
          Streak Leaderboard
        </h2>
        <Card>
          {streakLeaders.length > 0 ? (
            <div className="space-y-3">
              {streakLeaders.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="w-6 text-center text-sm font-bold text-tq-text-muted">
                    {i + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-tq-purple/30 flex items-center justify-center text-sm font-bold text-tq-text">
                    {p.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-tq-text truncate">
                    {p.display_name}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-tq-gold">
                    <Flame size={14} />
                    {p.current_streak}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-tq-text-muted text-sm text-center py-4">
              No active streaks yet
            </p>
          )}
        </Card>
      </section>

      {/* Inactive Users + Nudge All */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-sec">
            Haven&apos;t Read Today ({inactiveUsers.length})
          </h2>
          {inactiveUsers.length > 0 && (
            <Button
              variant="secondary"
              onClick={handleNudgeAll}
              disabled={nudging}
              className="!h-8 !px-3 !text-xs"
            >
              <Send size={12} />
              {nudging ? 'Sending...' : 'Nudge All'}
            </Button>
          )}
        </div>

        {nudgeResult && (
          <p className="text-xs text-tq-teal font-semibold mb-2">{nudgeResult}</p>
        )}

        <Card>
          {inactiveUsers.length > 0 ? (
            <div className="space-y-2">
              {inactiveUsers.slice(0, 20).map(p => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-tq-surface-2 flex items-center justify-center text-xs font-bold text-tq-text-muted">
                    {p.display_name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm text-tq-text truncate">
                    {p.display_name}
                  </span>
                  <span className="text-xs text-tq-text-muted">
                    {p.current_streak > 0 ? `${p.current_streak}d streak` : 'No streak'}
                  </span>
                </div>
              ))}
              {inactiveUsers.length > 20 && (
                <p className="text-xs text-tq-text-muted text-center pt-2">
                  +{inactiveUsers.length - 20} more
                </p>
              )}
            </div>
          ) : (
            <p className="text-tq-success text-sm text-center py-4 font-semibold">
              Everyone has read today!
            </p>
          )}
        </Card>
      </section>
    </div>
  )
}
