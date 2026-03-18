import { Check } from 'lucide-react'
import { useFriends } from '../../hooks/useFriends'
import { useNudge } from '../../hooks/useNudge'
import { isCompletedToday } from '../../lib/streakUtils'
import { Avatar } from '../profile/Avatar'
import { Button } from '../ui/Button'
import { ShareButton } from './ShareButton'
import type { FriendWithProfile } from '../../types/database'

interface FriendStreaksStepProps {
  questDayId: string
  dayNumber: number
  passageReference: string
  answers: { a1: string; a2: string; a3: string }
  streakCount: number
  onContinue: () => void
}

function FriendRow({
  friendship,
  hasNudgedToday,
  onNudge,
}: {
  friendship: FriendWithProfile
  hasNudgedToday: boolean
  onNudge: () => void
}) {
  const { friend } = friendship
  const completed = isCompletedToday(friend.last_completed_at)

  return (
    <div className="flex items-center gap-3 py-2.5">
      <Avatar profile={friend} size="sm" />
      <p className="flex-1 font-bold text-tq-text text-sm truncate">{friend.display_name}</p>
      {completed ? (
        <span className="flex items-center gap-1 text-xs font-semibold text-tq-success flex-shrink-0">
          <Check size={14} strokeWidth={3} /> Done
        </span>
      ) : (
        <button
          onClick={onNudge}
          disabled={hasNudgedToday}
          className={[
            'flex-shrink-0 px-3 h-8 rounded-lg text-xs font-bold',
            'border-l-4 border-tq-teal bg-tq-surface-2',
            'transition-all duration-200',
            hasNudgedToday
              ? 'text-tq-text-muted cursor-not-allowed opacity-60'
              : 'text-tq-teal hover:bg-tq-surface',
          ].join(' ')}
        >
          {hasNudgedToday ? '✓ Nudged' : '👋 Nudge'}
        </button>
      )}
    </div>
  )
}

export function FriendStreaksStep({
  questDayId,
  dayNumber,
  passageReference,
  answers,
  streakCount,
  onContinue,
}: FriendStreaksStepProps) {
  const { friends, loading } = useFriends()
  const { hasNudgedToday, nudgeFriend } = useNudge()

  const notDone = friends.filter(f => !isCompletedToday(f.friend.last_completed_at))
  const done    = friends.filter(f =>  isCompletedToday(f.friend.last_completed_at))

  if (!loading && friends.length === 0) {
    return (
      <div className="flex flex-col min-h-screen px-4">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-8">
          <p className="text-2xl">👥</p>
          <h2 className="text-xl font-extrabold text-tq-text">No friends yet</h2>
          <p className="text-tq-text-sec text-sm max-w-xs">
            Add friends to cheer each other on! Check the Friends tab.
          </p>
        </div>
        <div className="pb-8 pt-4 space-y-3">
          <ShareButton
            dayNumber={dayNumber}
            passageReference={passageReference}
            answers={answers}
            streakCount={streakCount}
            fullWidth
          />
          <Button fullWidth onClick={onContinue}>Continue</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen px-4">
      <div className="pt-6 pb-4">
        <h2 className="text-2xl font-extrabold text-tq-gold">Your Friend Streaks</h2>
        <p className="text-tq-text-sec text-sm mt-1">Encourage friends who haven&apos;t read yet</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto">
        {notDone.length > 0 && (
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted mb-2">
              Still need to read
            </p>
            <div className="bg-tq-surface rounded-2xl px-4 divide-y divide-tq-border/40 border border-tq-border/50">
              {notDone.map(f => (
                <FriendRow
                  key={f.id}
                  friendship={f}
                  hasNudgedToday={hasNudgedToday(f.friend.id)}
                  onNudge={() => nudgeFriend(f.friend.id, questDayId)}
                />
              ))}
            </div>
          </div>
        )}

        {done.length > 0 && (
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-tq-success mb-2">
              Completed today ✓
            </p>
            <div className="bg-tq-surface rounded-2xl px-4 divide-y divide-tq-border/40 border border-tq-border/50">
              {done.map(f => (
                <FriendRow
                  key={f.id}
                  friendship={f}
                  hasNudgedToday={false}
                  onNudge={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="pb-8 pt-4 space-y-3">
        <ShareButton
          dayNumber={dayNumber}
          passageReference={passageReference}
          answers={answers}
          streakCount={streakCount}
          fullWidth
        />
        <Button fullWidth onClick={onContinue}>Continue</Button>
      </div>
    </div>
  )
}
