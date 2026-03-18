import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Announcement } from '../../types/database'

// Matches markdown links [text](url) and bare URLs
const LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s]+)/g

function LinkifiedText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  // Reset regex state
  LINK_REGEX.lastIndex = 0

  let match
  while ((match = LINK_REGEX.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex, match.index)}</span>)
    }

    if (match[1] && match[2]) {
      // Markdown link: [text](url)
      parts.push(
        <a
          key={`l${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-tq-teal underline hover:text-tq-teal-light transition-colors"
        >
          {match[1]}
        </a>
      )
    } else {
      // Bare URL
      parts.push(
        <a
          key={`l${match.index}`}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-tq-teal underline hover:text-tq-teal-light transition-colors break-all"
        >
          {match[3]}
        </a>
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(<span key={`t${lastIndex}`}>{text.slice(lastIndex)}</span>)
  }

  return <>{parts}</>
}

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setAnnouncements(data as Announcement[])
      })
  }, [])

  const visible = announcements.filter(a => !dismissed.has(a.id))

  if (visible.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted">
        Announcements
      </h2>
      {visible.map(a => (
        <div
          key={a.id}
          className="bg-tq-surface rounded-2xl p-4 border-l-4 border-tq-purple relative"
        >
          <button
            onClick={() => setDismissed(prev => new Set(prev).add(a.id))}
            className="absolute top-3 right-3 text-tq-text-muted hover:text-tq-text transition-colors"
            aria-label="Dismiss announcement"
          >
            <X size={16} />
          </button>
          <h3 className="text-tq-text font-bold text-sm pr-6">{a.title}</h3>
          {a.body && (
            <p className="text-tq-text-sec text-sm mt-1">
              <LinkifiedText text={a.body} />
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
