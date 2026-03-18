/**
 * Calculate XP earned for completing a reading.
 * - Base: +25 XP
 * - Early bird (before noon local time): +5 XP
 * - Weekend (Sat/Sun): +10 XP
 */
export function calculateXp(completedAt: Date = new Date()): number {
  let xp = 25

  if (completedAt.getHours() < 12) {
    xp += 5 // early bird bonus
  }

  const day = completedAt.getDay()
  if (day === 0 || day === 6) {
    xp += 10 // weekend bonus
  }

  return xp
}
