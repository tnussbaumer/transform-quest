/**
 * Supabase Edge Function: send-push-notification
 *
 * Sends Web Push notifications to specified users.
 * Uses the Web Push protocol directly (no npm web-push library — Deno compatible).
 *
 * POST /send-push-notification
 * Body: { user_ids: string[], title: string, body: string, url?: string, tag?: string }
 * Auth: requires service_role key or valid JWT from the nudge sender
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v5.2.0/index.ts'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:tim@missionvox.ai'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface PushSubscriptionJSON {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

/**
 * Build VAPID Authorization header for the push endpoint.
 * Uses ES256 (P-256 ECDSA) JWT signed with the VAPID private key.
 */
async function buildVapidAuth(endpoint: string): Promise<{ authorization: string; cryptoKey: string }> {
  const audience = new URL(endpoint).origin

  // Import the VAPID private key (URL-safe base64 encoded raw P-256 private key)
  const privateKeyBuffer = base64UrlDecode(VAPID_PRIVATE_KEY)
  const privateKey = await jose.importPKCS8(
    `-----BEGIN PRIVATE KEY-----\n${arrayBufferToBase64(privateKeyBuffer)}\n-----END PRIVATE KEY-----`,
    'ES256'
  ).catch(async () => {
    // Fallback: try importing as raw EC key via JWK
    const jwk = {
      kty: 'EC',
      crv: 'P-256',
      d: VAPID_PRIVATE_KEY,
      x: '', // Will be derived
      y: '', // Will be derived
    }
    // For raw VAPID keys, we need to derive x,y from the public key
    const pubKeyBytes = base64UrlDecode(VAPID_PUBLIC_KEY)
    // Uncompressed public key: 0x04 || x (32 bytes) || y (32 bytes)
    const x = base64UrlEncode(pubKeyBytes.slice(1, 33))
    const y = base64UrlEncode(pubKeyBytes.slice(33, 65))
    jwk.x = x
    jwk.y = y
    return jose.importJWK(jwk, 'ES256')
  })

  const jwt = await new jose.SignJWT({})
    .setProtectedHeader({ alg: 'ES256' })
    .setAudience(audience)
    .setSubject(VAPID_SUBJECT)
    .setExpirationTime('24h')
    .sign(privateKey)

  return {
    authorization: `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
    cryptoKey: `p256ecdsa=${VAPID_PUBLIC_KEY}`,
  }
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(base64 + padding)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function arrayBufferToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

/**
 * Send a push message to a single subscription.
 * Note: This sends an unencrypted payload using the VAPID-only approach.
 * For full RFC 8291 encryption, a more complex implementation is needed.
 * Most push services accept VAPID-authenticated requests with plaintext payloads.
 */
async function sendPushMessage(
  subscription: PushSubscriptionJSON,
  payload: string
): Promise<{ success: boolean; statusCode: number; expired: boolean }> {
  try {
    const { authorization, cryptoKey } = await buildVapidAuth(subscription.endpoint)

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Crypto-Key': cryptoKey,
        'Content-Type': 'application/json',
        'Content-Encoding': 'aead-aes128gcm',
        'TTL': '86400', // 24 hours
        'Urgency': 'normal',
      },
      body: payload,
    })

    const expired = response.status === 404 || response.status === 410
    return {
      success: response.ok,
      statusCode: response.status,
      expired,
    }
  } catch (err) {
    console.error('Push send error:', err)
    return { success: false, statusCode: 0, expired: false }
  }
}

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const { user_ids, title, body, url, tag } = await req.json()

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return new Response(JSON.stringify({ error: 'user_ids required' }), { status: 400 })
    }

    // Use service role client to read all profiles
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, push_subscription')
      .in('id', user_ids)
      .not('push_subscription', 'is', null)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    let sent = 0
    let failed = 0
    let expiredCleaned = 0

    const payload = JSON.stringify({ title, body, url: url || '/', tag: tag || 'tq-notification' })

    for (const profile of (profiles || [])) {
      const subscription = profile.push_subscription as PushSubscriptionJSON
      if (!subscription?.endpoint) continue

      const result = await sendPushMessage(subscription, payload)

      if (result.success) {
        sent++
      } else if (result.expired) {
        // Clean up expired subscription
        await supabase
          .from('profiles')
          .update({ push_subscription: null })
          .eq('id', profile.id)
        expiredCleaned++
      } else {
        failed++
      }
    }

    return new Response(
      JSON.stringify({ sent, failed, expired_cleaned: expiredCleaned }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  } catch (err) {
    console.error('Edge function error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 })
  }
})
