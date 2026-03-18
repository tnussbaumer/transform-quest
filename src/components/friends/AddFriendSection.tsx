import { useState, type FormEvent } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import type { Profile } from '../../types/database'

interface AddFriendSectionProps {
  profile: Profile
  onAdd: (inviteCode: string) => Promise<void>
}

export function AddFriendSection({ profile, onAdd }: AddFriendSectionProps) {
  const [code, setCode] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setAdding(true)
    setError('')
    setSuccess(false)
    try {
      await onAdd(code.trim())
      setSuccess(true)
      setCode('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add friend')
    } finally {
      setAdding(false)
    }
  }

  async function copyCode() {
    if (!profile.invite_code) return
    await navigator.clipboard.writeText(profile.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Add by code */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Enter invite code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Friend invite code"
          />
        </div>
        <Button
          type="submit"
          disabled={!code.trim()}
          loading={adding}
          className="flex-shrink-0"
        >
          Add
        </Button>
      </form>

      {error && <p className="text-tq-error text-sm">{error}</p>}
      {success && (
        <p className="text-tq-success text-sm font-semibold">
          Friend request sent! They need to accept it.
        </p>
      )}

      {/* User's own code */}
      {profile.invite_code && (
        <div className="bg-tq-surface-2 rounded-xl px-4 py-3 flex items-center justify-between gap-3 border border-tq-border/50">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-tq-text-muted mb-0.5">Your invite code</p>
            <p className="font-extrabold text-tq-text tracking-widest font-mono text-lg">
              {profile.invite_code}
            </p>
          </div>
          <button
            onClick={copyCode}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-tq-surface flex items-center justify-center border border-tq-border text-tq-text-sec hover:text-tq-teal transition-colors"
            aria-label="Copy invite code"
          >
            {copied ? <Check size={18} className="text-tq-success" /> : <Copy size={18} />}
          </button>
        </div>
      )}
    </div>
  )
}
