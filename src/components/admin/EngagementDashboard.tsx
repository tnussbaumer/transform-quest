import { useState, useEffect } from 'react'
import { Users, Flame, TrendingUp, BarChart3, Send, Trash2, MessageCircle, Lock, Globe } from 'lucide-react'
import { useAdminStats } from '../../hooks/useAdminStats'
import { isCompletedToday } from '../../lib/streakUtils'
import { supabase } from '../../lib/supabase'
import { Avatar } from '../profile/Avatar'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface AdminPost {
  id: string
  user_id: string
  post_type: string
  visibility: string
  thought_text: string | null
  share_answer_1: boolean
  share_answer_2: boolean
  share_answer_3: boolean
  created_at: string
  author_name?: string
}

export function EngagementDashboard() {
  const { totalUsers, activeToday, avgStreak, completionRate, profiles, loading } = useAdminStats()
  const [nudging, setNudging] = useState(false)
  const [nudgeResult, setNudgeResult] = useState<string | null>(null)
  const [recentPosts, setRecentPosts] = useState<AdminPost[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)

  useEffect(() => {
    fetchRecentPosts()
  }, [])

  async function fetchRecentPosts() {
    setPostsLoading(true)
    try {
      const { data } = await supabase
        .from('wall_posts')
        .select('id, user_id, post_type, visibility, thought_text, share_answer_1, share_answer_2, share_answer_3, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      const posts = (data as AdminPost[] | null) ?? []
      // Fetch author names
      const userIds = [...new Set(posts.map(p => p.user_id))]
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds)
        const nameMap = new Map((profs as { id: string; display_name: string }[] ?? []).map(p => [p.id, p.display_name]))
        for (const post of posts) {
          post.author_name = nameMap.get(post.user_id) ?? 'Unknown'
        }
      }
      setRecentPosts(posts)
    } catch (err) {
      console.error('Failed to fetch recent posts:', err)
    } finally {
      setPostsLoading(false)
    }
  }

  async function handleDeletePost(postId: string) {
    setDeletingPostId(postId)
    try {
      await supabase.from('wall_posts').delete().eq('id', postId)
      setRecentPosts(prev => prev.filter(p => p.id !== postId))
    } catch (err) {
      console.error('Failed to delete post:', err)
    } finally {
      setDeletingPostId(null)
    }
  }

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
                  <Avatar profile={p} size="sm" />
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
                  <Avatar profile={p} size="sm" />
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

      {/* Recent Wall Posts (moderation) */}
      <section>
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-sec mb-3">
          <span className="flex items-center gap-1.5">
            <MessageCircle size={14} />
            Recent Wall Posts
          </span>
        </h2>
        <Card>
          {postsLoading ? (
            <p className="text-tq-text-muted text-sm text-center py-4">Loading posts...</p>
          ) : recentPosts.length === 0 ? (
            <p className="text-tq-text-muted text-sm text-center py-4">No wall posts yet</p>
          ) : (
            <div className="divide-y divide-tq-border/40">
              {recentPosts.map(post => (
                <div key={post.id} className="py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-tq-text truncate">{post.author_name}</span>
                      <span className="text-xs text-tq-text-muted capitalize">{post.post_type}</span>
                      {post.visibility === 'friends' ? (
                        <Lock size={10} className="text-tq-text-muted" />
                      ) : (
                        <Globe size={10} className="text-tq-text-muted" />
                      )}
                      <span className="text-xs text-tq-text-muted">
                        {new Date(post.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-tq-text-sec truncate">
                      {post.post_type === 'thought'
                        ? post.thought_text ?? ''
                        : [
                            post.share_answer_1 && 'A1',
                            post.share_answer_2 && 'A2',
                            post.share_answer_3 && 'A3',
                          ].filter(Boolean).join(', ') + ' shared'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletingPostId === post.id}
                    className="p-2 rounded-lg text-tq-text-muted hover:text-tq-error hover:bg-tq-error/10 transition-colors flex-shrink-0"
                    aria-label="Delete post"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
