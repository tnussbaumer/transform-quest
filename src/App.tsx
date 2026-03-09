import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { HomePage } from './pages/HomePage'
import { ReadingFlowPage } from './pages/ReadingFlowPage'
import { QuestsPage } from './pages/QuestsPage'
import { FriendsPage } from './pages/FriendsPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes (no layout) */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Onboarding (protected, no bottom nav) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-tq-bg max-w-[428px] mx-auto">
                <OnboardingPage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Reading flow (protected, full-screen, no bottom nav) */}
        <Route
          path="/read/:questDayId"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-tq-bg max-w-[428px] mx-auto">
                <ReadingFlowPage />
              </div>
            </ProtectedRoute>
          }
        />

        {/* Protected app routes with bottom nav */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="quests" element={<QuestsPage />} />
          <Route path="friends" element={<FriendsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
