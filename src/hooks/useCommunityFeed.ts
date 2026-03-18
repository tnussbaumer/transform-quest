import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { WallPost, CreateWallPostResult } from '../types/database'

interface CreatePostParams {
  questDayId: string
  postType: 'reflection' | 'thought'
  visibility: 'friends' | 'everyone'
  shareAnswer1?: boolean
  shareAnswer2?: boolean
  shareAnswer3?: boolean
  thoughtText?: string
}

interface CommunityFeedState {
  posts: WallPost[]
  loading: boolean
  refetch: () => Promise<void>
  createPost: (params: CreatePostParams) => Promise<CreateWallPostResult>
  toggleReaction: (postId: string, reactionType: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
}

export function useCommunityFeed(questDayId: string | undefined): CommunityFeedState {
  const [posts, setPosts] = useState<WallPost[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFeed = useCallback(async () => {
    if (!questDayId) {
      setPosts([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_wall_feed', {
        p_quest_day_id: questDayId,
      })
      if (error) throw error
      setPosts((data as WallPost[]) ?? [])
    } catch (err) {
      console.error('Failed to fetch wall feed:', err)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [questDayId])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  async function createPost(params: CreatePostParams): Promise<CreateWallPostResult> {
    const { data, error } = await supabase.rpc('create_wall_post', {
      p_quest_day_id: params.questDayId,
      p_post_type: params.postType,
      p_visibility: params.visibility,
      p_share_answer_1: params.shareAnswer1 ?? false,
      p_share_answer_2: params.shareAnswer2 ?? false,
      p_share_answer_3: params.shareAnswer3 ?? false,
      p_thought_text: params.thoughtText ?? null,
    })
    if (error) throw error
    const result = data as CreateWallPostResult
    await fetchFeed()
    return result
  }

  async function toggleReaction(postId: string, reactionType: string) {
    // Optimistic update
    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post
        const hasReaction = post.my_reactions.includes(reactionType)
        const newMyReactions = hasReaction
          ? post.my_reactions.filter(r => r !== reactionType)
          : [...post.my_reactions, reactionType]
        const newReactions = { ...post.reactions }
        const currentCount = newReactions[reactionType] ?? 0
        if (hasReaction) {
          newReactions[reactionType] = Math.max(0, currentCount - 1)
          if (newReactions[reactionType] === 0) delete newReactions[reactionType]
        } else {
          newReactions[reactionType] = currentCount + 1
        }
        return { ...post, my_reactions: newMyReactions, reactions: newReactions }
      })
    )

    try {
      await supabase.rpc('toggle_reaction', {
        p_post_id: postId,
        p_reaction_type: reactionType,
      })
    } catch (err) {
      console.error('Failed to toggle reaction:', err)
      // Revert on error
      await fetchFeed()
    }
  }

  async function deletePost(postId: string) {
    // Optimistic removal
    setPosts(prev => prev.filter(p => p.id !== postId))
    try {
      const { error } = await supabase
        .from('wall_posts')
        .delete()
        .eq('id', postId)
      if (error) throw error
    } catch (err) {
      console.error('Failed to delete post:', err)
      await fetchFeed()
    }
  }

  return { posts, loading, refetch: fetchFeed, createPost, toggleReaction, deletePost }
}
