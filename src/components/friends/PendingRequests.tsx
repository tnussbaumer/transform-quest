import { Avatar } from '../profile/Avatar'
import { Button } from '../ui/Button'
import type { Friendship, FriendProfile } from '../../types/database'

type SenderProfile = Pick<FriendProfile, 'id' | 'display_name' | 'avatar_url' | 'avatar_type' | 'avatar_preset'>
type PendingRequest = Friendship & { sender: SenderProfile }

interface PendingRequestsProps {
  requests: PendingRequest[]
  onAccept: (friendshipId: string) => Promise<void>
  onDecline: (friendshipId: string) => Promise<void>
}

export function PendingRequests({ requests, onAccept, onDecline }: PendingRequestsProps) {
  if (requests.length === 0) return null

  return (
    <div className="space-y-2">
      <h2 className="text-xs font-extrabold uppercase tracking-widest text-tq-text-muted">
        Requests
      </h2>
      <div className="bg-tq-surface rounded-2xl divide-y divide-tq-border/40 border border-tq-border/50">
        {requests.map(req => (
          <div key={req.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar profile={req.sender} size="sm" />
            <p className="flex-1 font-bold text-tq-text text-sm truncate">
              {req.sender.display_name}
            </p>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                className="h-8 px-3 text-xs"
                onClick={() => onDecline(req.id)}
              >
                Decline
              </Button>
              <Button
                className="h-8 px-3 text-xs"
                onClick={() => onAccept(req.id)}
              >
                Accept
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
