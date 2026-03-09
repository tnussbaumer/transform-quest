import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

interface ShareButtonProps {
  dayNumber: number
  passageReference: string
  answers: { a1: string; a2: string; a3: string }
  streakCount: number
  fullWidth?: boolean
}

export function ShareButton({ dayNumber, passageReference, answers, streakCount, fullWidth = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const shareText = [
    `📖 Transform Quest — Day ${dayNumber}`,
    passageReference,
    '',
    `💬 What it says: ${answers.a1}`,
    `🎯 How it applies: ${answers.a2}`,
    `⚡ What I'll do: ${answers.a3}`,
    '',
    `🔥 ${streakCount}-day streak!`,
  ].join('\n')

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText, title: 'Transform Quest' })
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className={[
        'flex items-center justify-center gap-2',
        'h-12 px-6 rounded-xl text-base font-bold',
        'bg-tq-surface-2 text-tq-text border border-tq-border',
        'hover:border-tq-teal transition-all duration-200 outline-none',
        'focus-visible:ring-2 focus-visible:ring-tq-teal focus-visible:ring-offset-2 focus-visible:ring-offset-tq-bg',
        fullWidth ? 'w-full' : '',
      ].join(' ')}
      aria-label="Share your reflection"
    >
      {copied ? (
        <>
          <Check size={18} className="text-tq-success" />
          <span className="text-tq-success">Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={18} />
          Share
        </>
      )}
    </button>
  )
}
