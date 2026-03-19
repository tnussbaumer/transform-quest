import { supabase } from './supabase'

/**
 * Convert a base64-encoded VAPID public key to a Uint8Array
 * Required for pushManager.subscribe()
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/** Check if push notifications are supported in this browser */
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/** Check if running as an installed PWA (standalone mode) */
export function isInstalledPWA(): boolean {
  // iOS standalone check
  if ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true) {
    return true
  }
  // Standard display-mode check
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true
  }
  return false
}

/** Check if device is Android (doesn't require install for push) */
export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent)
}

/** Get current notification permission state */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

/**
 * Request permission and subscribe to push notifications.
 * MUST be called from a user gesture (button tap).
 * Returns the PushSubscription or null if denied/failed.
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) {
    console.log('[Push] Push not supported in this browser')
    return null
  }

  const permission = await Notification.requestPermission()
  console.log('[Push] Permission result:', permission)
  if (permission !== 'granted') return null

  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string
  console.log('[Push] VAPID key exists:', !!vapidPublicKey, 'length:', vapidPublicKey?.length ?? 0)
  if (!vapidPublicKey) {
    console.error('[Push] VITE_VAPID_PUBLIC_KEY not configured')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.ready
    console.log('[Push] Service worker ready')
    const keyArray = urlBase64ToUint8Array(vapidPublicKey)
    console.log('[Push] Key array length:', keyArray.length)
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: keyArray.buffer as ArrayBuffer,
    })
    console.log('[Push] Subscription JSON:', JSON.stringify(subscription.toJSON()))
    await savePushSubscription(subscription)
    console.log('[Push] Save completed')
    return subscription
  } catch (err) {
    console.error('[Push] Subscription failed — full error:', err)
    return null
  }
}

/** Unsubscribe from push and clear the subscription from Supabase */
export async function unsubscribeFromPush(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
    }
    await clearPushSubscription()
  } catch (err) {
    console.error('Push unsubscribe failed:', err)
  }
}

/** Save a PushSubscription to the current user's profile */
export async function savePushSubscription(subscription: PushSubscription): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('[Push] savePushSubscription: no authenticated user found')
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({ push_subscription: subscription.toJSON() })
    .eq('id', user.id)

  if (error) {
    console.error('[Push] savePushSubscription: Supabase update failed:', error)
  } else {
    console.log('[Push] savePushSubscription: success for user', user.id)
  }
}

/** Clear the push_subscription from the current user's profile */
export async function clearPushSubscription(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ push_subscription: null })
    .eq('id', user.id)
}

/** Check if the user currently has an active push subscription */
export async function hasActivePushSubscription(): Promise<boolean> {
  if (!isPushSupported()) return false
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch {
    return false
  }
}
