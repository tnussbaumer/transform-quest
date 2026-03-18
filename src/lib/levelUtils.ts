/**
 * Returns the level title for a given total XP amount.
 * Clay's custom level titles with thresholds for base 25 XP/day.
 */
export function getLevelTitle(totalXp: number): string {
  if (totalXp >= 25000) return 'Scripture Master'
  if (totalXp >= 10000) return 'Word Warrior'
  if (totalXp >= 5000)  return 'Kingdom Builder'
  if (totalXp >= 2000)  return 'Disciple'
  if (totalXp >= 500)   return 'Explorer'
  return 'Seeker'
}

/**
 * Returns XP needed for the next level, or null if at max.
 */
export function xpToNextLevel(totalXp: number): number | null {
  if (totalXp < 500)   return 500 - totalXp
  if (totalXp < 2000)  return 2000 - totalXp
  if (totalXp < 5000)  return 5000 - totalXp
  if (totalXp < 10000) return 10000 - totalXp
  if (totalXp < 25000) return 25000 - totalXp
  return null // max level
}

/**
 * Formats a number with comma separators (e.g. 12345 → "12,345").
 */
export function formatXp(xp: number): string {
  return xp.toLocaleString()
}
