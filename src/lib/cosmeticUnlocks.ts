import type { Profile } from '../types/database'

export type CosmeticUnlock = 'animated_flame' | 'gold_badge_border' | 'avatar_glow'

export function hasUnlock(profile: Profile, unlock: CosmeticUnlock): boolean {
  switch (unlock) {
    case 'animated_flame':
      return (profile.current_streak ?? 0) >= 3 || (profile.longest_streak ?? 0) >= 3
    default:
      return false
  }
}
