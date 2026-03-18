import { useState, useCallback } from 'react'
import { MessageCircle, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useQuest } from '../hooks/useQuest'
import { useCommunityFeed } from '../hooks/useCommunityFeed'
import { WallPostCard } from '../components/community/WallPostCard'
import { ComposeModal } from '../components/community/ComposeModal'
import { FriendsTab } from '../components/community/FriendsTab'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import type { CreateWallPostResult } from '../types/database'

type Tab = 'wall' | 'friends'

export function CommunityPage() {
  const { profile, refreshProfile } = useAuth()
  const { quest, questDay, isCurrentDayCompleted, loading: questLoading } = useQuest()
  const { posts, loading: feedLoading, createPost, toggleReaction, deletePost } = useCommunityFeed(questDay?.id)
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState<Tab>('wall')
  const [composeOpen, setComposeOpen] = useState(false)
  const [todaysAnswers, setTodaysAnswers] = useState<{ a1: string; a2: string; a3: string } | null>(null)
  const [xpToast, setXpToast] = useState<number | null>(null)

  // Fetch user's answers for today if they completed the reading
  const fetchAnswers = useCallback(async () => {
    if (!questDay?.id || !profile?.id) return null
    const { data } = await supabase
      .from('completions')
      .select('answer_1, answer_2, answer_3')
      .eq('user_id', profile.id)
      .eq('quest_day_id', questDay.id)
      .maybeSingle()
    if (data) {
      const row = data as { answer_1: string; answer_2: string; answer_3: string }
      setTodaysAnswers({ a1: row.answer_1, a2: row.answer_2, a3: row.answer_3 })
    }
    return data
  }, [questDay?.id, profile?.id])

  async function handleOpenCompose() {
    if (isCurrentDayCompleted) {
      // Always fetch fresh answers (they may have changed since last fetch)
      await fetchAnswers()
    }
    setComposeOpen(true)
  }

  async function handleCreatePost(params: {
    postType: 'reflection' | 'thought'
    visibility: 'friends' | 'everyone'
    shareAnswer1: boolean
    shareAnswer2: boolean
    shareAnswer3: boolean
    thoughtText?: string
  }) {
    if (!questDay?.id) return
    const result: CreateWallPostResult = await createPost({
      questDayId: questDay.id,
      ...params,
    })
    if (result.xp_earned > 0) {
      setXpToast(result.xp_earned)
      refreshProfile()
      setTimeout(() => setXpToast(null), 3000)
    }
  }

  if (!profile) return null

  const loading = questLoading

  return (
    <div className="px-4 py-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-tq-text">Community</h1>

      {/* Segmented control */}
      <div className="flex bg-tq-surface rounded-xl p-1 border border-tq-border/50">
        <button
          onClick={() => setActiveTab('wall')}
          className={[
            'flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200',
            activeTab === 'wall'
              ? 'bg-tq-teal text-tq-bg'
              : 'text-tq-text-sec',
          ].join(' ')}
        >
          {"Today's Wall"}
        </button>
        <button
          onClick={() => setActiveTab('friends')}
          className={[
            'flex-1 py-2 rounded-lg text-sm font-bold transition-all duration-200',
            activeTab === 'friends'
              ? 'bg-tq-teal text-tq-bg'
              : 'text-tq-text-sec',
          ].join(' ')}
        >
          Friends
        </button>
      </div>

      {/* XP toast */}
      {xpToast && (
        <div className="flex justify-center animate-fade-up">
          <div className="bg-tq-gold/20 text-tq-gold text-sm font-bold px-4 py-2 rounded-xl">
            +{xpToast} XP for sharing!
          </div>
        </div>
      )}

      {activeTab === 'wall' && (
        <div className="space-y-4">
          {/* No active quest */}
          {!questLoading && !quest && (
            <Card>
              <div className="py-8 text-center">
                <p className="text-3xl mb-3">📖</p>
                <p className="text-tq-text font-bold">No active quest right now</p>
                <p className="text-tq-text-muted text-sm mt-1">Check back soon!</p>
              </div>
            </Card>
          )}

          {/* Has quest, show feed */}
          {quest && !loading && (
            <>
              {/* Passage reference context */}
              {questDay?.passage_reference && (
                <p className="text-xs font-semibold text-tq-text-muted uppercase tracking-wider">
                  {questDay.passage_reference}
                </p>
              )}

              {/* Hasn't completed banner */}
              {!isCurrentDayCompleted && (
                <Card>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-tq-teal/20 flex items-center justify-center flex-shrink-0">
                      <BookOpen size={20} className="text-tq-teal" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-tq-text">Complete today's reading to share your reflections</p>
                    </div>
                    <Button onClick={() => questDay && navigate(`/read/${questDay.id}`)}>
                      Start
                    </Button>
                  </div>
                </Card>
              )}

              {/* Compose prompt */}
              <button
                onClick={handleOpenCompose}
                className="w-full p-4 rounded-2xl bg-tq-surface border border-tq-border/50 text-left flex items-center gap-3 hover:bg-tq-surface-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-tq-teal/20 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={16} className="text-tq-teal" />
                </div>
                <span className="text-sm text-tq-text-muted">Share a thought...</span>
              </button>

              {/* Feed */}
              {feedLoading ? (
                <div className="py-8 text-center">
                  <span className="text-tq-text-muted text-sm">Loading feed...</span>
                </div>
              ) : posts.length === 0 ? (
                <Card>
                  <div className="py-8 text-center">
                    <MessageCircle size={48} className="text-tq-text-muted mx-auto mb-3" />
                    <p className="text-tq-text font-bold">No one has shared yet today</p>
                    <p className="text-tq-text-muted text-sm mt-1">Be the first!</p>
                    <Button className="mt-4" onClick={handleOpenCompose}>
                      Share a thought
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {posts.map((post, i) => (
                    <WallPostCard
                      key={post.id}
                      post={post}
                      onToggleReaction={toggleReaction}
                      onDelete={deletePost}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {loading && (
            <div className="py-8 text-center">
              <span className="text-tq-text-muted text-sm">Loading...</span>
            </div>
          )}
        </div>
      )}

      {activeTab === 'friends' && <FriendsTab />}

      {/* Compose Modal */}
      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSubmit={handleCreatePost}
        answers={isCurrentDayCompleted ? todaysAnswers : null}
      />
    </div>
  )
}

export default CommunityPage
