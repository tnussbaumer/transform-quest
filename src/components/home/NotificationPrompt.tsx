import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import {
  isPushSupported,
  isInstalledPWA,
  isAndroid,
  getNotificationPermission,
  subscribeToPush,
} from '../../lib/pushNotifications'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

const DENIED_KEY = 'tq-push-denied'
const DISMISSED_SESSION_KEY = 'tq-push-dismissed'

function formatReminderTime(timeStr: string): string {
  // timeStr is HH:MM:SS or HH:MM format from Supabase TIME column
  const [hours, minutes] = timeStr.split(':').map(Number)
  const h = hours % 12 || 12
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const m = String(minutes).padStart(2, '0')
  return `${h}:${m} ${ampm}`
}

export function NotificationPrompt() {
  const { profile, patchProfile } = useAuth()
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem(DISMISSED_SESSION_KEY) === 'true'
  )
  const [subscribing, setSubscribing] = useState(false)
  const [success, setSuccess] = useState(false)

  // Don't render if conditions aren't met
  if (!profile) return null

  // Push must be supported
  if (!isPushSupported()) return null

  // Permission must be 'default' (not yet asked)
  const permission = getNotificationPermission()
  if (permission !== 'default') return null

  // Don't show if previously denied at browser level
  if (localStorage.getItem(DENIED_KEY) === 'true') return null

  // User must have completed at least 2 readings (50+ XP as proxy)
  if ((profile.total_xp ?? 0) < 50) return null

  // Must be installed as PWA OR on Android (which doesn't require install)
  if (!isInstalledPWA() && !isAndroid()) return null

  // Dismissed this session
  if (dismissed) return null

  // Already has subscription
  if (profile.push_subscription) return null

  if (success) {
    return (
      <Card>
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-full bg-tq-success/20 flex items-center justify-center flex-shrink-0">
            <Check size={20} className="text-tq-success" />
          </div>
          <p className="text-sm font-bold text-tq-success">Reminders enabled!</p>
        </div>
      </Card>
    )
  }

  const reminderTime = profile.daily_reminder_time
    ? formatReminderTime(profile.daily_reminder_time)
    : '7:00 PM'

  async function handleSubscribe() {
    setSubscribing(true)
    const subscription = await subscribeToPush()
    setSubscribing(false)

    if (subscription) {
      patchProfile({ push_subscription: subscription.toJSON() as Record<string, unknown> })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      // Permission was denied
      const perm = getNotificationPermission()
      if (perm === 'denied') {
        localStorage.setItem(DENIED_KEY, 'true')
        setDismissed(true)
      }
    }
  }

  function handleDismiss() {
    sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true')
    setDismissed(true)
  }

  return (
    <Card>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-tq-teal/20 flex items-center justify-center flex-shrink-0">
            <Bell size={20} className="text-tq-teal" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-tq-text">
              Want a daily reminder so you don&apos;t break your streak?
            </p>
            <p className="text-xs text-tq-text-sec mt-1">
              We&apos;ll send a nudge at {reminderTime} if you haven&apos;t read yet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button fullWidth onClick={handleSubscribe} loading={subscribing}>
            Yes, remind me!
          </Button>
        </div>

        <button
          onClick={handleDismiss}
          className="w-full text-center text-tq-text-muted text-xs font-semibold py-1"
        >
          Maybe later
        </button>
      </div>
    </Card>
  )
}
