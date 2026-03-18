import { useState, useEffect } from 'react'
import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { UserPlus, AlertCircle, Check, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import type { Profile } from '../types/database'

type State =
  | { status: 'loading' }
  | { status: 'not-logged-in' }
  | { status: 'own-code' }
  | { status: 'invalid' }
  | { status: 'already-friends'; name: string }
  | { status: 'sent'; name: string }
  | { status: 'error'; message: string }

export function AddFriendPage() {
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const { user, profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    if (authLoading) return

    if (!user || !profile) {
      setState({ status: 'not-logged-in' })
      return
    }

    if (!inviteCode) {
      setState({ status: 'invalid' })
      return
    }

    // Check if this is the user's own code
    if (profile.invite_code?.toUpperCase() === inviteCode.toUpperCase()) {
      setState({ status: 'own-code' })
      return
    }

    processInvite(inviteCode, user.id)
  }, [authLoading, user, profile, inviteCode])

  async function processInvite(code: string, userId: string) {
    setState({ status: 'loading' })

    // Look up the profile with this invite code
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .ilike('invite_code', code)
      .maybeSingle()

    if (error || !data) {
      setState({ status: 'invalid' })
      return
    }

    const target = data as Pick<Profile, 'id' | 'display_name'>

    // Check if already friends or pending
    const { data: existing } = await supabase
      .from('friendships')
      .select('id, status')
      .or(`and(user_a.eq.${userId},user_b.eq.${target.id}),and(user_a.eq.${target.id},user_b.eq.${userId})`)
      .maybeSingle()

    if (existing) {
      const row = existing as { id: string; status: string }
      if (row.status === 'accepted') {
        setState({ status: 'already-friends', name: target.display_name })
      } else {
        setState({ status: 'already-friends', name: target.display_name })
      }
      return
    }

    // Send friend request
    const { error: insertError } = await supabase
      .from('friendships')
      .insert({ user_a: userId, user_b: target.id, status: 'pending' })

    if (insertError) {
      setState({ status: 'error', message: insertError.message })
      return
    }

    setState({ status: 'sent', name: target.display_name })
  }

  // Not logged in: redirect to auth with returnTo
  if (state.status === 'not-logged-in' && !authLoading) {
    return <Navigate to={`/auth?returnTo=/add/${inviteCode}`} replace />
  }

  return (
    <div className="min-h-screen bg-tq-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        {state.status === 'loading' && (
          <div className="space-y-4">
            <Loader2 size={48} className="text-tq-teal mx-auto animate-spin" />
            <p className="text-tq-text-sec text-sm">Processing invite...</p>
          </div>
        )}

        {state.status === 'own-code' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-tq-gold/20 flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-tq-gold" />
            </div>
            <h1 className="text-xl font-extrabold text-tq-text">That&apos;s your own code!</h1>
            <p className="text-tq-text-sec text-sm">Share this QR code with a friend instead.</p>
            <Button fullWidth onClick={() => navigate('/community')}>
              Go to Community
            </Button>
          </div>
        )}

        {state.status === 'invalid' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-tq-error/20 flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-tq-error" />
            </div>
            <h1 className="text-xl font-extrabold text-tq-text">Invalid invite code</h1>
            <p className="text-tq-text-sec text-sm">This invite link doesn&apos;t seem to be valid.</p>
            <Button fullWidth onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        )}

        {state.status === 'already-friends' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-tq-teal/20 flex items-center justify-center mx-auto">
              <Check size={32} className="text-tq-teal" />
            </div>
            <h1 className="text-xl font-extrabold text-tq-text">Already connected!</h1>
            <p className="text-tq-text-sec text-sm">
              You and <strong className="text-tq-text">{state.name}</strong> are already friends or have a pending request.
            </p>
            <Button fullWidth onClick={() => navigate('/community')}>
              Go to Community
            </Button>
          </div>
        )}

        {state.status === 'sent' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-tq-success/20 flex items-center justify-center mx-auto">
              <UserPlus size={32} className="text-tq-success" />
            </div>
            <h1 className="text-xl font-extrabold text-tq-text">Friend request sent!</h1>
            <p className="text-tq-text-sec text-sm">
              <strong className="text-tq-text">{state.name}</strong> will see your request.
            </p>
            <Button fullWidth onClick={() => navigate('/community')}>
              Go to Community
            </Button>
          </div>
        )}

        {state.status === 'error' && (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-tq-error/20 flex items-center justify-center mx-auto">
              <AlertCircle size={32} className="text-tq-error" />
            </div>
            <h1 className="text-xl font-extrabold text-tq-text">Something went wrong</h1>
            <p className="text-tq-text-sec text-sm">{state.message}</p>
            <Button fullWidth onClick={() => navigate('/')}>
              Go Home
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddFriendPage
