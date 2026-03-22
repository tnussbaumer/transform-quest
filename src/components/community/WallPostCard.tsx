import { useState } from 'react'
import { Trash2, Lock, Globe } from 'lucide-react'
import { Avatar } from '../profile/Avatar'
import { AvatarLightbox } from '../ui/AvatarLightbox'
import { Card } from '../ui/Card'
import type { WallPost } from '../../types/database'

interface WallPostCardProps {
  post: WallPost
  onToggleReaction: (postId: string, reactionType: string) => void
  onDelete: (postId: string) => void
  index: number
}

const QUESTION_LABELS = ['What it says', 'How it applies', "What I'll do"]

const REACTIONS: { type: string; emoji: string }[] = [
  { type: 'heart', emoji: '❤️' },
  { type: 'prayer', emoji: '🙏' },
  { type: 'fire', emoji: '🔥' },
  { type: 'me_too', emoji: '🤝' },
]

function formatPostTime(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function WallPostCard({ post, onToggleReaction, onDelete, index }: WallPostCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [reactionBusy, setReactionBusy] = useState(false)
  const [bouncingReaction, setBouncingReaction] = useState<string | null>(null)
  const [floatingReaction, setFloatingReaction] = useState<string | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  function handleReaction(postId: string, type: string) {
    if (reactionBusy) return
    setReactionBusy(true)
    const wasActive = post.my_reactions.includes(type)
    onToggleReaction(postId, type)
    // Bounce animation
    setBouncingReaction(type)
    setTimeout(() => setBouncingReaction(null), 200)
    // +1 float for new reactions
    if (!wasActive) {
      setFloatingReaction(type)
      setTimeout(() => setFloatingReaction(null), 600)
    }
    setTimeout(() => setReactionBusy(false), 400)
  }

  const authorProfile = {
    display_name: post.author_name,
    avatar_type: post.author_avatar_type as 'preset' | 'custom',
    avatar_preset: post.author_avatar_preset,
    avatar_url: post.author_avatar_url,
  }

  const sharedAnswers: { label: string; text: string }[] = []
  if (post.post_type === 'reflection') {
    if (post.share_answer_1 && post.answer_1) sharedAnswers.push({ label: QUESTION_LABELS[0], text: post.answer_1 })
    if (post.share_answer_2 && post.answer_2) sharedAnswers.push({ label: QUESTION_LABELS[1], text: post.answer_2 })
    if (post.share_answer_3 && post.answer_3) sharedAnswers.push({ label: QUESTION_LABELS[2], text: post.answer_3 })
  }

  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <Card>
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar profile={authorProfile} size="sm" onTap={() => setLightboxOpen(true)} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-tq-text text-sm truncate">{post.author_name}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {post.visibility === 'friends' ? (
              <Lock size={12} className="text-tq-text-muted" />
            ) : (
              <Globe size={12} className="text-tq-text-muted" />
            )}
            <span className="text-xs text-tq-text-muted">{formatPostTime(post.created_at)}</span>
            {post.is_mine && (
              confirmingDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDelete(post.id)}
                    className="text-xs text-tq-error font-bold px-2 py-1 rounded-lg bg-tq-error/10 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="text-xs text-tq-text-muted font-semibold px-2 py-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="p-1.5 rounded-lg text-tq-text-muted hover:text-tq-error hover:bg-tq-error/10 transition-colors"
                  aria-label="Delete post"
                >
                  <Trash2 size={14} />
                </button>
              )
            )}
          </div>
        </div>

        {/* Body */}
        <div className="mb-3">
          {post.post_type === 'reflection' ? (
            <div className="space-y-2.5">
              {sharedAnswers.map((a, i) => {
                const isLong = a.text.length > 200
                const displayText = isLong && !expanded ? a.text.slice(0, 200) + '...' : a.text
                return (
                  <div key={i}>
                    <p className="text-xs font-semibold text-tq-text-sec mb-0.5">{a.label}</p>
                    <p className="text-sm text-tq-text leading-relaxed">
                      {displayText}
                      {isLong && (
                        <button
                          onClick={() => setExpanded(!expanded)}
                          className="ml-1 text-tq-teal text-xs font-semibold"
                        >
                          {expanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-tq-text leading-relaxed">{post.thought_text}</p>
          )}
        </div>

        {/* Reaction bar */}
        <div className="flex items-center gap-1.5">
          {REACTIONS.map(r => {
            const count = post.reactions[r.type] ?? 0
            const isActive = post.my_reactions.includes(r.type)
            return (
              <button
                key={r.type}
                onClick={() => handleReaction(post.id, r.type)}
                className={[
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold',
                  'transition-all duration-200 active:scale-95',
                  isActive
                    ? 'bg-tq-teal/15 text-tq-teal'
                    : 'bg-tq-surface-2 text-tq-text-muted hover:bg-tq-surface-2/80',
                ].join(' ')}
                aria-label={`${r.type} reaction${isActive ? ' (active)' : ''}`}
              >
                <span className={`relative ${bouncingReaction === r.type ? 'animate-emoji-bounce' : ''}`}>
                  {r.emoji}
                  {floatingReaction === r.type && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-tq-teal animate-plus-one pointer-events-none">+1</span>
                  )}
                </span>
                {count > 0 && <span>{count}</span>}
              </button>
            )
          })}
        </div>
      </Card>

      <AvatarLightbox
        user={lightboxOpen ? {
          display_name: post.author_name,
          avatar_type: post.author_avatar_type as 'preset' | 'custom',
          avatar_preset: post.author_avatar_preset,
          avatar_url: post.author_avatar_url,
        } : null}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
