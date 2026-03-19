/**
 * Supabase Edge Function: send-push-notification
 *
 * Sends Web Push notifications to specified users.
 * Implements RFC 8291 payload encryption using Deno Web Crypto API.
 *
 * POST /send-push-notification
 * Body: { user_ids: string[], title: string, body: string, url?: string, tag?: string }
 * Auth: requires service_role key or valid JWT from the nudge sender
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

// ============================================================
// Base64 URL helpers
// ============================================================

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

function concatUint8Arrays(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, a) => sum + a.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

// ============================================================
// VAPID JWT signing (ES256 with raw P-256 private key)
// ============================================================

/**
 * Build VAPID Authorization header.
 * The VAPID private key from web-push generate-vapid-keys is a raw 32-byte
 * P-256 scalar, URL-safe base64 encoded. We import it as a JWK.
 */
async function buildVapidAuth(endpoint: string): Promise<string> {
  const audience = new URL(endpoint).origin

  // Decode the raw 32-byte private key scalar
  const privateKeyRaw = base64UrlDecode(VAPID_PRIVATE_KEY)
  // Decode the 65-byte uncompressed public key (0x04 || x || y)
  const publicKeyRaw = base64UrlDecode(VAPID_PUBLIC_KEY)

  const x = base64UrlEncode(publicKeyRaw.slice(1, 33))
  const y = base64UrlEncode(publicKeyRaw.slice(33, 65))
  const d = base64UrlEncode(privateKeyRaw)

  // Import as ECDSA key for JWT signing
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', x, y, d },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  // Build JWT manually (header.payload.signature)
  const header = { typ: 'JWT', alg: 'ES256' }
  const now = Math.floor(Date.now() / 1000)
  const payload = {
    aud: audience,
    exp: now + 86400, // 24 hours
    sub: VAPID_SUBJECT,
  }

  const encodedHeader = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)))
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const signatureBuffer = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    new TextEncoder().encode(signingInput)
  )

  // ECDSA signature from Web Crypto is DER-encoded, but JWT needs raw r||s (64 bytes)
  const signature = derToRaw(new Uint8Array(signatureBuffer))
  const encodedSignature = base64UrlEncode(signature)
  const jwt = `${signingInput}.${encodedSignature}`

  return `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`
}

/**
 * Convert DER-encoded ECDSA signature to raw r||s format (64 bytes).
 * Web Crypto on some runtimes returns DER, JWT needs raw.
 */
function derToRaw(der: Uint8Array): Uint8Array {
  // If it's already 64 bytes, it's already raw
  if (der.length === 64) return der

  // DER: 0x30 <len> 0x02 <rLen> <r> 0x02 <sLen> <s>
  const raw = new Uint8Array(64)
  let offset = 2 // skip 0x30 and total length

  // Read r
  offset++ // skip 0x02
  const rLen = der[offset++]
  const rStart = rLen > 32 ? offset + (rLen - 32) : offset
  const rDest = rLen < 32 ? 32 - rLen : 0
  raw.set(der.slice(rStart, offset + rLen), rDest)
  offset += rLen

  // Read s
  offset++ // skip 0x02
  const sLen = der[offset++]
  const sStart = sLen > 32 ? offset + (sLen - 32) : offset
  const sDest = sLen < 32 ? 64 - sLen : 32
  raw.set(der.slice(sStart, offset + sLen), sDest)

  return raw
}

// ============================================================
// RFC 8291 Web Push Encryption (aes128gcm)
// ============================================================

/**
 * HKDF-SHA256: Extract-then-Expand
 */
async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  // Extract: PRK = HMAC-SHA256(salt, IKM)
  const prkKey = await crypto.subtle.importKey(
    'raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const prk = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, ikm))

  // Expand: OKM = HMAC-SHA256(PRK, info || 0x01)
  const infoWithCounter = concatUint8Arrays(info, new Uint8Array([1]))
  const okmKey = await crypto.subtle.importKey(
    'raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const okm = new Uint8Array(await crypto.subtle.sign('HMAC', okmKey, infoWithCounter))

  return okm.slice(0, length)
}

/**
 * Build the "info" parameter for HKDF per RFC 8291 / draft-ietf-webpush-encryption.
 *
 * For the Content-Encryption-Key:
 *   info = "Content-Encoding: aes128gcm" || 0x00
 *
 * For the nonce:
 *   info = "Content-Encoding: nonce" || 0x00
 *
 * But the IKM derivation info is:
 *   info = "WebPush: info" || 0x00 || ua_public || as_public
 */
function buildWebPushInfo(uaPublic: Uint8Array, asPublic: Uint8Array): Uint8Array {
  const infoStr = new TextEncoder().encode('WebPush: info\0')
  return concatUint8Arrays(infoStr, uaPublic, asPublic)
}

/**
 * Encrypt a push message payload per RFC 8291 (aes128gcm content encoding).
 *
 * Returns the full encrypted body including the aes128gcm header.
 */
async function encryptPayload(
  payload: string,
  subscriptionKeys: { p256dh: string; auth: string }
): Promise<Uint8Array> {
  const plaintext = new TextEncoder().encode(payload)

  // Decode the subscriber's public key (p256dh) and auth secret
  const uaPublicBytes = base64UrlDecode(subscriptionKeys.p256dh)  // 65 bytes uncompressed
  const authSecret = base64UrlDecode(subscriptionKeys.auth)       // 16 bytes

  // Import subscriber's public key for ECDH
  const uaPublicKey = await crypto.subtle.importKey(
    'raw',
    uaPublicBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )

  // Generate ephemeral ECDH key pair (application server key pair for this message)
  const asKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )

  // Export the ephemeral public key (uncompressed, 65 bytes)
  const asPublicBytes = new Uint8Array(
    await crypto.subtle.exportKey('raw', asKeyPair.publicKey)
  )

  // ECDH shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: uaPublicKey },
    asKeyPair.privateKey,
    256
  )
  const sharedSecret = new Uint8Array(sharedSecretBits)

  // Generate 16-byte random salt
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Step 1: Derive the input keying material (IKM) via HKDF
  //   IKM = HKDF(auth_secret, ecdh_secret, "WebPush: info" || 0x00 || ua_public || as_public, 32)
  const webPushInfo = buildWebPushInfo(uaPublicBytes, asPublicBytes)
  const ikm = await hkdf(authSecret, sharedSecret, webPushInfo, 32)

  // Step 2: Derive the content encryption key (CEK) — 16 bytes
  //   CEK = HKDF(salt, IKM, "Content-Encoding: aes128gcm" || 0x00, 16)
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0')
  const cek = await hkdf(salt, ikm, cekInfo, 16)

  // Step 3: Derive the nonce — 12 bytes
  //   nonce = HKDF(salt, IKM, "Content-Encoding: nonce" || 0x00, 12)
  const nonceInfo = new TextEncoder().encode('Content-Encoding: nonce\0')
  const nonce = await hkdf(salt, ikm, nonceInfo, 12)

  // Step 4: Pad the plaintext (add a delimiter byte 0x02 for the final record)
  const paddedPlaintext = concatUint8Arrays(plaintext, new Uint8Array([2]))

  // Step 5: Encrypt with AES-128-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw', cek, { name: 'AES-GCM' }, false, ['encrypt']
  )
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      aesKey,
      paddedPlaintext
    )
  )

  // Step 6: Build the aes128gcm header:
  //   salt (16) || rs (4, big-endian uint32) || idlen (1) || keyid (65 = ephemeral public key)
  const rs = 4096 // record size
  const rsBytes = new Uint8Array(4)
  new DataView(rsBytes.buffer).setUint32(0, rs, false) // big-endian
  const idlen = new Uint8Array([asPublicBytes.length]) // 65

  const header = concatUint8Arrays(salt, rsBytes, idlen, asPublicBytes)

  // Final body = header || encrypted content (ciphertext + 16-byte GCM tag)
  return concatUint8Arrays(header, encrypted)
}

// ============================================================
// Send push message
// ============================================================

async function sendPushMessage(
  subscription: PushSubscriptionJSON,
  payload: string
): Promise<{ success: boolean; statusCode: number; expired: boolean }> {
  try {
    const authorization = await buildVapidAuth(subscription.endpoint)

    // Encrypt the payload per RFC 8291
    const encryptedBody = await encryptPayload(payload, subscription.keys)

    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authorization,
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': String(encryptedBody.length),
        'TTL': '86400',
        'Urgency': 'normal',
      },
      body: encryptedBody,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error(`Push delivery failed: ${response.status} ${response.statusText}`, text)
    }

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

// ============================================================
// HTTP handler
// ============================================================

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
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        console.warn('Skipping profile with incomplete subscription:', profile.id)
        failed++
        continue
      }

      const result = await sendPushMessage(subscription, payload)

      if (result.success) {
        sent++
      } else if (result.expired) {
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
