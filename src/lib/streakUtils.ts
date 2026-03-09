/**
 * Returns true if last_completed_at is today (local time).
 */
export function isCompletedToday(lastCompletedAt: string | null): boolean {
  if (!lastCompletedAt) return false
  const last = new Date(lastCompletedAt)
  const today = new Date()
  return (
    last.getFullYear() === today.getFullYear() &&
    last.getMonth() === today.getMonth() &&
    last.getDate() === today.getDate()
  )
}

/**
 * Returns a local date string "YYYY-MM-DD" for a given Date.
 */
export function toLocalDateString(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/**
 * Returns the ISO weekday index (0=Mon … 6=Sun) for a given Date.
 * Standard JS getDay() returns 0=Sun, so we remap.
 */
export function getWeekDayIndex(date: Date = new Date()): number {
  return (date.getDay() + 6) % 7
}

/**
 * Returns the local Date objects for Mon–Sun of the current week.
 */
export function getCurrentWeekDays(): Date[] {
  const today = new Date()
  const dayIndex = getWeekDayIndex(today) // 0=Mon
  const monday = new Date(today)
  monday.setDate(today.getDate() - dayIndex)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}
