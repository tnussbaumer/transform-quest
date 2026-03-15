import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function OnboardingPage() {
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!displayName.trim() || !user) return
    setSaving(true)
    setError('')

    const { error: err } = await supabase
      .from('profiles')
      .update({ display_name: displayName.trim(), onboarding_completed: true })
      .eq('id', user.id)

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      await refreshProfile()
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">👋</div>
          <h1 className="text-3xl font-extrabold text-tq-text">Welcome!</h1>
          <p className="text-tq-text-sec">
            What should we call you in the app?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Your name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            autoFocus
            maxLength={40}
            aria-label="Display name"
          />
          {error && <p className="text-tq-error text-sm">{error}</p>}
          <Button
            type="submit"
            fullWidth
            disabled={saving || !displayName.trim()}
          >
            {saving ? 'Saving…' : "Let's Go! 🚀"}
          </Button>
        </form>
      </div>
    </div>
  )
}
