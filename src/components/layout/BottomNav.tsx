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
                'flex flex-col items-center justify-center gap-0.5 relative',
                'min-w-[56px] py-1.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-tq-teal bg-tq-teal/10'
                  : 'text-tq-text-muted hover:text-tq-text-sec',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[11px] font-semibold leading-none">{label}</span>
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-tq-teal" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
