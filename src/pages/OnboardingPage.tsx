import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { AvatarPicker } from '../components/profile/AvatarPicker'

export function OnboardingPage() {
  const { user, patchProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<'name' | 'avatar'>('name')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [avatarUpdate, setAvatarUpdate] = useState<{
    avatar_type: 'preset' | 'custom'
    avatar_preset: string
    avatar_url: string | null
  }>({ avatar_type: 'preset', avatar_preset: 'default', avatar_url: null })

  function handleNameSubmit(e: FormEvent) {
    e.preventDefault()
    if (!displayName.trim() || !user) return
    setStep('avatar')
  }

  async function handleFinish(skip: boolean) {
    if (!user) return
    setSaving(true)
    setError('')

    const updates: Record<string, unknown> = {
      display_name: displayName.trim(),
      onboarding_completed: true,
    }

    if (!skip) {
      updates.avatar_type = avatarUpdate.avatar_type
      updates.avatar_preset = avatarUpdate.avatar_preset
      updates.avatar_url = avatarUpdate.avatar_url
    }

    const { error: err } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      patchProfile({
        display_name: displayName.trim(),
        onboarding_completed: true,
        ...(skip ? {} : avatarUpdate),
      })
      navigate('/', { replace: true })
    }
  }

  if (step === 'name') {
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

          <form onSubmit={handleNameSubmit} className="space-y-4">
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
              disabled={!displayName.trim()}
            >
              Next
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-tq-text">Choose Your Avatar</h1>
          <p className="text-tq-text-sec">
            Pick one that represents you, or upload a photo!
          </p>
        </div>

        <AvatarPicker
          userId={user!.id}
          onSelect={setAvatarUpdate}
        />

        {error && <p className="text-tq-error text-sm text-center">{error}</p>}

        <div className="space-y-3">
          <Button
            fullWidth
            onClick={() => handleFinish(false)}
            disabled={saving}
          >
            {saving ? 'Saving...' : "Let's Go! 🚀"}
          </Button>
          <button
            type="button"
            onClick={() => handleFinish(true)}
            disabled={saving}
            className="w-full text-center text-tq-text-muted text-sm font-semibold py-2 hover:text-tq-text-sec transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}
