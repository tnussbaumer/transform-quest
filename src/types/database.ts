// Database types matching the Supabase schema

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
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
  current_streak: number
  last_completed_at: string | null
  level_title: string
}

export interface FriendWithProfile extends Friendship {
  friend: FriendProfile
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
