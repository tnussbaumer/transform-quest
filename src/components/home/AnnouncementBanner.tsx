import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Announcement } from '../../types/database'

const URL_REGEX = /(https?:\/\/[^\s]+)/g

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(URL_REGEX)
  return (
    <>
      {parts.map((part, i) =>
        URL_REGEX.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-tq-teal underline hover:text-tq-teal-light transition-colors break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
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
