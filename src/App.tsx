import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AdminRoute } from './components/layout/AdminRoute'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { HomePage } from './pages/HomePage'
import { ReadingFlowPage } from './pages/ReadingFlowPage'
import { QuestsPage } from './pages/QuestsPage'
import { CommunityPage } from './pages/CommunityPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'

export default function App() {
  return (
    <AuthProvider>
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

          {/* Admin dashboard (leader/admin only, no bottom nav) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div className="min-h-screen bg-tq-bg">
                <AdminPage />
              </div>
            </AdminRoute>
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
            <Route path="community" element={<CommunityPage />} />
            <Route path="friends" element={<Navigate to="/community" replace />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
