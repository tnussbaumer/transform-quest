// Database types matching the Supabase schema

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  avatar_type: 'preset' | 'custom'
  avatar_preset: string
  role: 'youth' | 'leader' | 'admin'
  current_streak: number
  longest_streak: number
  total_xp: number
  level_title: string
  last_completed_at: string | null
  streak_freezes_available: number
  daily_reminder_time: string
  push_subscription: Record<string, unknown> | null
  invite_code: string | null
  onboarding_completed: boolean
  created_at: string
}

export interface Quest {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  quest_type: 'reading' | 'discipline' | 'event'
  created_by: string | null
  badge_name: string | null
  badge_icon: string | null
  is_active: boolean
  created_at: string
}

export interface QuestDay {
  id: string
  quest_id: string
  day_number: number
  passage_reference: string | null
  passage_text: string | null
  is_milestone: boolean
  milestone_note: string | null
  reading_hint: string | null
}

export interface Completion {
  id: string
  user_id: string
  quest_day_id: string
  answer_1: string
  answer_2: string
  answer_3: string
  xp_earned: number
  completed_at: string
}

export interface NewBadge {
  id: string
  name: string
  icon: string | null
}

export interface CompleteReadingResult {
  new_streak: number
  new_xp: number
  new_level: string
  new_badges: NewBadge[]
  xp_earned: number
  milestone_bonus: number
  quest_complete: boolean
  freeze_earned: boolean
}

export interface Announcement {
  id: string
  title: string
  body: string | null
  created_by: string | null
  is_active: boolean
  created_at: string
  expires_at: string | null
}

export interface StreakFreezeUsed {
  id: string
  user_id: string
  used_on: string
  created_at: string
}

export interface Friendship {
  id: string
  user_a: string
  user_b: string
  mutual_streak: number
  status: 'pending' | 'accepted'
  created_at: string
}

export interface Nudge {
  id: string
  from_user: string
  to_user: string
  quest_day_id: string
  nudged_at: string
}

export interface Badge {
  id: string
  name: string
  description: string | null
  icon: string | null
  badge_type: 'streak' | 'quest' | 'monthly' | 'special'
  requirement_value: number | null
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
}

// FriendWithProfile — friendship row + the friend's public profile data
export interface FriendProfile {
  id: string
  display_name: string
  avatar_url: string | null
  avatar_type: 'preset' | 'custom'
  avatar_preset: string
  current_streak: number
  last_completed_at: string | null
  level_title: string
}

export interface FriendWithProfile extends Friendship {
  friend: FriendProfile
}

export interface WallPost {
  id: string
  user_id: string
  quest_day_id: string
  post_type: 'reflection' | 'thought'
  visibility: 'friends' | 'everyone'
  share_answer_1: boolean
  share_answer_2: boolean
  share_answer_3: boolean
  thought_text: string | null
  created_at: string
  // Joined fields from get_wall_feed RPC
  author_name: string
  author_avatar_type: string
  author_avatar_preset: string
  author_avatar_url: string | null
  answer_1: string | null
  answer_2: string | null
  answer_3: string | null
  reactions: Record<string, number>
  my_reactions: string[]
  is_mine: boolean
}

export interface WallReaction {
  id: string
  post_id: string
  user_id: string
  reaction_type: 'heart' | 'prayer' | 'fire' | 'me_too'
  created_at: string
}

export interface CreateWallPostResult {
  post_id: string
  xp_earned: number
}

// Supabase Database type for typed client (v2 format)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Profile, 'id'>>
        Relationships: []
      }
      quests: {
        Row: Quest
        Insert: Omit<Quest, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<Quest, 'id'>>
        Relationships: []
      }
      quest_days: {
        Row: QuestDay
        Insert: Omit<QuestDay, 'id'> & { id?: string }
        Update: Partial<Omit<QuestDay, 'id'>>
        Relationships: []
      }
      completions: {
        Row: Completion
        Insert: Omit<Completion, 'id' | 'completed_at'> & { id?: string; completed_at?: string }
        Update: Partial<Omit<Completion, 'id'>>
        Relationships: []
      }
    }
    Views: Record<never, never>
    Functions: {
      complete_reading: {
        Args: {
          p_quest_day_id: string
          p_answer_1: string
          p_answer_2: string
          p_answer_3: string
          p_xp_earned: number
        }
        Returns: CompleteReadingResult
      }
      xp_to_level: {
        Args: { p_xp: number }
        Returns: string
      }
    }
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
