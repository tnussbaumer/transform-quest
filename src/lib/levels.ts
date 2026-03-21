/** Level thresholds — must match the xp_to_level SQL function */
export const LEVEL_THRESHOLDS: { title: string; xpRequired: number }[] = [
  { title: 'Seeker',          xpRequired: 0 },
  { title: 'Explorer',        xpRequired: 500 },
  { title: 'Disciple',        xpRequired: 2000 },
  { title: 'Kingdom Builder', xpRequired: 5000 },
  { title: 'Word Warrior',    xpRequired: 10000 },
  { title: 'Scripture Master', xpRequired: 25000 },
]

/** Get the current level index (0-based) for a given XP total */
export function getLevelIndex(totalXp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].xpRequired) return i
  }
  return 0
}

/** Get progress info for the XP bar */
export function getLevelProgress(totalXp: number): {
  currentTitle: string
  nextTitle: string | null
  currentXp: number
  levelStartXp: number
  nextLevelXp: number | null
  progress: number // 0–1
} {
  const idx = getLevelIndex(totalXp)
  const current = LEVEL_THRESHOLDS[idx]
  const next = idx < LEVEL_THRESHOLDS.length - 1 ? LEVEL_THRESHOLDS[idx + 1] : null

  if (!next) {
    return {
      currentTitle: current.title,
      nextTitle: null,
      currentXp: totalXp,
      levelStartXp: current.xpRequired,
      nextLevelXp: null,
      progress: 1,
    }
  }

  const range = next.xpRequired - current.xpRequired
  const filled = totalXp - current.xpRequired
  return {
    currentTitle: current.title,
    nextTitle: next.title,
    currentXp: totalXp,
    levelStartXp: current.xpRequired,
    nextLevelXp: next.xpRequired,
    progress: Math.min(filled / range, 1),
  }
}
