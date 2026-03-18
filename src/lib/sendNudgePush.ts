import { supabase } from './supabase'

/**
 * Trigger a push notification for a nudge.
 * Called client-side after a successful nudge RPC.
 * Uses the Supabase Edge Function to send the actual push.
 *
 * This is a best-effort fire-and-forget — if it fails, the nudge
 * was still recorded in the DB, so the user sees it next time they open the app.
 */
export async function sendNudgePush(
  toUserId: string,
  fromDisplayName: string,
): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string

    await fetch(`${supabaseUrl}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY as string,
      },
      body: JSON.stringify({
        user_ids: [toUserId],
        title: 'Transform Quest',
        body: `${fromDisplayName} nudged you! Don't break your streak!`,
        url: '/',
        tag: 'tq-nudge',
      }),
    })
  } catch {
    // Fire-and-forget — don't break the nudge flow
    console.warn('Nudge push notification failed (non-critical)')
  }
}
