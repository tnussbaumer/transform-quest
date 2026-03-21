import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { QuestBuilder } from '../components/admin/QuestBuilder'
import { EngagementDashboard } from '../components/admin/EngagementDashboard'
import { AnnouncementsManager } from '../components/admin/AnnouncementsManager'

type Tab = 'quests' | 'engagement' | 'announcements'

const tabs: { key: Tab; label: string }[] = [
  { key: 'quests', label: 'Quests' },
  { key: 'engagement', label: 'Engagement' },
  { key: 'announcements', label: 'Announcements' },
]

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('quests')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-tq-bg text-tq-text">
      {/* Header */}
      <header
        className="sticky top-0 z-20 bg-tq-bg/90 backdrop-blur-md border-b border-tq-border/50"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="mx-auto max-w-[640px] px-4">
          <div className="flex items-center gap-3 h-14">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 px-3 py-2 -ml-3 rounded-xl text-tq-teal font-bold text-sm hover:bg-tq-surface transition-colors min-h-[44px]"
              aria-label="Back to Home"
            >
              <ChevronLeft className="w-5 h-5" />
              Home
            </button>
            <h1 className="text-lg font-bold flex-1">Admin Dashboard</h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors',
                  activeTab === tab.key
                    ? 'bg-tq-teal/15 text-tq-teal'
                    : 'text-tq-text-muted hover:text-tq-text-sec hover:bg-tq-surface',
                ].join(' ')}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-[640px] px-4 py-6">
        {activeTab === 'quests' && <QuestBuilder />}
        {activeTab === 'engagement' && <EngagementDashboard />}
        {activeTab === 'announcements' && <AnnouncementsManager />}
      </main>
    </div>
  )
}

export default AdminPage
