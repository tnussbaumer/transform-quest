import { NavLink } from 'react-router-dom'
import { BookOpen, Compass, Users, User } from 'lucide-react'

const tabs = [
  { to: '/',        icon: BookOpen, label: 'Home'    },
  { to: '/quests',  icon: Compass,  label: 'Quests'  },
  { to: '/friends', icon: Users,    label: 'Friends' },
  { to: '/profile', icon: User,     label: 'Profile' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-tq-surface border-t border-tq-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-[428px] mx-auto flex h-16 items-center justify-around px-2">
        {tabs.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-col items-center justify-center gap-0.5',
                'min-w-[56px] py-1 rounded-xl transition-colors duration-200',
                isActive ? 'text-tq-teal' : 'text-tq-text-muted',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[11px] font-semibold leading-none">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
