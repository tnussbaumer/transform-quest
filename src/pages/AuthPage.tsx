import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function AuthPage() {
  const { user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState('')

  // Already signed in → go home
  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    setSending(false)
    if (err) {
      setError(err.message)
    } else {
      setSent(true)
    }
  }

  async function handleGoogle() {
    setOauthLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
    if (err) {
      setError(err.message)
      setOauthLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-tq-bg flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        {/* Wordmark */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-tq-text">Transform</span>
            <span className="text-tq-teal">Quest</span>
          </h1>
          <p className="text-tq-text-sec text-base">
            Build your Bible reading habit, one day at a time.
          </p>
        </div>

        {sent ? (
          /* Success state */
          <div className="bg-tq-surface rounded-2xl p-6 text-center space-y-3 border border-tq-border">
            <div className="w-12 h-12 rounded-full bg-tq-teal/20 flex items-center justify-center mx-auto">
              <Mail size={24} className="text-tq-teal" />
            </div>
            <h2 className="text-lg font-bold text-tq-text">Check your email!</h2>
            <p className="text-tq-text-sec text-sm">
              We sent a magic link to <strong className="text-tq-text">{email}</strong>.
              Tap the link in your email to sign in.
            </p>
            <button
              className="text-tq-text-muted text-sm underline mt-2"
              onClick={() => { setSent(false); setEmail('') }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          /* Sign in form */
          <div className="space-y-4">
            <form onSubmit={handleMagicLink} className="space-y-3">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                inputMode="email"
                autoComplete="email"
                aria-label="Email address"
              />
              {error && (
                <p className="text-tq-error text-sm">{error}</p>
              )}
              <Button
                type="submit"
                fullWidth
                disabled={sending || !email.trim()}
              >
                {sending ? 'Sending…' : 'Send Magic Link'}
              </Button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-tq-border" />
              <span className="text-tq-text-muted text-xs">or</span>
              <div className="flex-1 h-px bg-tq-border" />
            </div>

            <Button
              variant="secondary"
              fullWidth
              onClick={handleGoogle}
              disabled={oauthLoading}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              {oauthLoading ? 'Redirecting…' : 'Continue with Google'}
            </Button>
          </div>
        )}

        <p className="text-center text-tq-text-muted text-xs">
          Transform Church — Andover, MN
        </p>
      </div>
    </div>
  )
}
