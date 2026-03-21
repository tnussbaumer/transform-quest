/**
 * Returns a warm, encouraging message for students whose streak just reset.
 * NEVER guilt-trip — only acknowledge progress and encourage the comeback.
 */
export function getStreakEncouragement(longestStreak: number, passagesRead: number): string {
  const messages: string[] = []

  if (longestStreak >= 30) {
    messages.push(
      `You built a ${longestStreak}-day streak. That's legendary. The number reset, but you're still the same person who showed up ${longestStreak} days in a row.`,
      `${passagesRead} passages read. ${longestStreak} days of faithfulness. One missed day doesn't change who you are. Let's go.`,
      `Your ${longestStreak}-day streak was incredible. That growth isn't going anywhere. Today is a fresh start.`,
    )
  } else if (longestStreak >= 8) {
    messages.push(
      `Your ${longestStreak}-day streak was amazing. You've read ${passagesRead} passages — that's real growth.`,
      `Streaks restart, but your growth doesn't. ${passagesRead} passages read — that's incredible.`,
      `Missing a day doesn't erase ${longestStreak} days of showing up. Welcome back — today is a fresh start.`,
    )
  } else if (longestStreak >= 3) {
    messages.push(
      `Streaks restart, but your growth doesn't. You've built a real habit — let's keep it going!`,
      `You showed up for ${longestStreak} days in a row. That's awesome. Today is day 1 of an even longer streak.`,
      `Every streak starts at 1. You've done this before — you've got this.`,
    )
  } else {
    messages.push(
      `Welcome back! Every journey has pauses. Let's pick up where you left off.`,
      `You're here — that's what matters. Let's get started.`,
    )
  }

  return messages[Math.floor(Math.random() * messages.length)]
}
