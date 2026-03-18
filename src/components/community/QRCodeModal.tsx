import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { X, Share2, Copy, Check } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'

interface QRCodeModalProps {
  open: boolean
  onClose: () => void
}

export function QRCodeModal({ open, onClose }: QRCodeModalProps) {
  const { profile } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!open || !profile?.invite_code) return null

  const inviteUrl = `${window.location.origin}/add/${profile.invite_code}`

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on Transform Quest!',
          text: `Add me as a friend on Transform Quest! My invite code: ${profile!.invite_code}`,
          url: inviteUrl,
        })
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    } else {
      await handleCopy()
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-tq-surface rounded-2xl border border-tq-border w-full max-w-sm p-6 space-y-5 animate-slide-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-tq-text-muted hover:text-tq-text transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-extrabold text-tq-text">My QR Code</h2>
          <p className="text-sm text-tq-text-sec">
            Friends can scan this to add you
          </p>
        </div>

        {/* QR Code on white background for scannability */}
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl p-4">
            <QRCodeSVG
              value={inviteUrl}
              size={200}
              level="M"
              bgColor="#FFFFFF"
              fgColor="#1A1D2E"
            />
          </div>
        </div>

        {/* User info */}
        <div className="text-center space-y-1">
          <p className="font-bold text-tq-text">{profile.display_name}</p>
          <p className="text-xs text-tq-text-muted font-mono tracking-wider">
            {profile.invite_code}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={handleCopy}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
          <Button fullWidth onClick={handleShare}>
            <Share2 size={16} />
            Share
          </Button>
        </div>
      </div>
    </div>
  )
}
