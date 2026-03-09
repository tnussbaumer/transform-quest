import { Users } from 'lucide-react'

export function FriendsPage() {
  return (
    <div className="px-4 py-6 min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <div className="w-20 h-20 rounded-full bg-tq-purple/20 flex items-center justify-center">
        <Users size={40} className="text-tq-purple" />
      </div>
      <h1 className="text-2xl font-extrabold text-tq-text">Coming Soon</h1>
      <p className="text-tq-text-sec text-base max-w-xs">
        Friend streaks and nudges are on the way! You'll be able to cheer each other on here.
      </p>
    </div>
  )
}
