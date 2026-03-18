import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { Layout } from './components/layout/Layout'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AdminRoute } from './components/layout/AdminRoute'
import { AuthPage } from './pages/AuthPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'

// Lazy-loaded routes (heavier pages)
const ReadingFlowPage = React.lazy(() => import('./pages/ReadingFlowPage'))
const QuestsPage = React.lazy(() => import('./pages/QuestsPage'))
const CommunityPage = React.lazy(() => import('./pages/CommunityPage'))
const AdminPage = React.lazy(() => import('./pages/AdminPage'))
const AddFriendPage = React.lazy(() => import('./pages/AddFriendPage'))

/** Brand-styled loading fallback — matches app dark theme */
function PageLoader() {
  return (
    <div className="min-h-screen bg-tq-bg flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 mx-auto rounded-xl bg-tq-surface-2 animate-pulse" />
        <p className="text-tq-text-muted text-sm font-semibold">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes (no layout) */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Invite link handler (public — redirects to auth if needed) */}
            <Route path="/add/:inviteCode" element={<AddFriendPage />} />

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
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  )
}
