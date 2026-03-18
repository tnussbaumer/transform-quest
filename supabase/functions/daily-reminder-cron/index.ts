/**
 * Supabase Edge Function: daily-reminder-cron
 *
 * Runs every 15 minutes via Supabase cron.
 * Sends daily reading reminders to users who:
 *   1. Have a push subscription
 *   2. Haven't completed today's reading
 *   3. Have a daily_reminder_time falling in the current 15-minute window
 *
 * Schedule: 0/15 * * * * (every 15 minutes)
 * Configure via: Supabase Dashboard → Edge Functions → Schedules
 *
 * TIMEZONE ASSUMPTION (v1): All users are in Central Time (America/Chicago).
 * Clay's youth group is in Andover, MN. This avoids needing a timezone column
 * on profiles. TODO: Add user timezone support for broader rollout.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Allow manual invocation via POST, and also accept GET from cron
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
      },
    })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get current time in Central Time
    const now = new Date()
    const centralTime = new Date(
      now.toLocaleString('en-US', { timeZone: 'America/Chicago' })
    )
    const currentHour = centralTime.getHours()
    const currentMinute = centralTime.getMinutes()

    // Round to 15-minute window: e.g., if it's 19:07, window is 19:00-19:14
    const windowStart = currentMinute - (currentMinute % 15)
    const windowEnd = windowStart + 14

    // Format window bounds as HH:MM for comparison with daily_reminder_time TIME column
    const padTwo = (n: number) => String(n).padStart(2, '0')
    const timeStart = `${padTwo(currentHour)}:${padTwo(windowStart)}:00`
    const timeEnd = `${padTwo(currentHour)}:${padTwo(windowEnd)}:59`

    console.log(`Checking reminders for window: ${timeStart} - ${timeEnd} Central`)

    // Find users with push subscriptions whose reminder time is in this window
    const { data: candidates, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, current_streak, daily_reminder_time')
      .not('push_subscription', 'is', null)
      .gte('daily_reminder_time', timeStart)
      .lte('daily_reminder_time', timeEnd)

    if (profileError) {
      console.error('Error fetching candidates:', profileError)
      return new Response(JSON.stringify({ error: profileError.message }), { status: 500 })
    }

    if (!candidates || candidates.length === 0) {
      return new Response(JSON.stringify({ message: 'No users in this window', sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get the active quest and today's quest day
    const { data: quests } = await supabase
      .from('quests')
      .select('id, start_date')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)

    if (!quests || quests.length === 0) {
      return new Response(JSON.stringify({ message: 'No active quest', sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const quest = quests[0]
    const startDate = new Date(quest.start_date)
    const today = new Date()
    startDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const currentDay = Math.max(1, Math.min(diffDays + 1, 30))

    // Get today's quest day
    const { data: questDays } = await supabase
      .from('quest_days')
      .select('id')
      .eq('quest_id', quest.id)
      .eq('day_number', currentDay)
      .limit(1)

    if (!questDays || questDays.length === 0) {
      return new Response(JSON.stringify({ message: 'No quest day found', sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const questDayId = questDays[0].id

    // Get user IDs who already completed today
    const candidateIds = candidates.map((p: { id: string }) => p.id)
    const { data: completions } = await supabase
      .from('completions')
      .select('user_id')
      .eq('quest_day_id', questDayId)
      .in('user_id', candidateIds)

    const completedIds = new Set(
      (completions || []).map((c: { user_id: string }) => c.user_id)
    )

    // Filter to users who haven't completed
    const usersToNotify = candidates.filter(
      (p: { id: string }) => !completedIds.has(p.id)
    )

    if (usersToNotify.length === 0) {
      return new Response(JSON.stringify({ message: 'All candidates already completed', sent: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Call send-push-notification for these users
    const userIds = usersToNotify.map((u: { id: string }) => u.id)

    // Build personalized messages (batch by common message for efficiency)
    // For v1, send a generic message to all users in this batch
    const firstUser = usersToNotify[0] as { display_name: string; current_streak: number }
    const streakText = firstUser.current_streak > 0
      ? ` Don't break your ${firstUser.current_streak}-day streak!`
      : ''

    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-push-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        user_ids: userIds,
        title: 'Transform Quest',
        body: `Hey! Today's reading is ready.${streakText}`,
        url: '/',
        tag: 'tq-daily-reminder',
      }),
    })

    const result = await response.json()

    return new Response(
      JSON.stringify({
        candidates_found: candidates.length,
        already_completed: completedIds.size,
        notifications_sent: result.sent || 0,
        ...result,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('Cron error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
})
