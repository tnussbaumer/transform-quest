import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="min-h-screen bg-tq-bg">
      {/* Centered content column */}
      <main className="max-w-[428px] mx-auto pb-20 min-h-screen">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
