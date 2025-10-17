import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { Navigation } from './components/Navigation'
import { AuthProvider, useAuth } from './lib/auth'
import { ResumeProvider } from './lib/ResumeContext'
import Login from './components/Login'
import Register from './components/Register'
import ProtectedRoute from './components/ProtectedRoute'
import ResumeManager from './components/ResumeManager'
import { useState } from 'react'

export type Module = 'home' | 'resume-critique' | 'job-fit' | 'interview-prep' | 'learning-plan'

export interface ResumeVersion {
  version: number
  filename: string
  uploadedAt: Date
}

function AppContent() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { isAuthenticated } = useAuth()

  // If not authenticated, show auth pages
  if (!isAuthenticated) {
    return (
      <div>
        {authMode === 'login' ? (
          <Login onToggleMode={() => setAuthMode('register')} />
        ) : (
          <Register onToggleMode={() => setAuthMode('login')} />
        )}
      </div>
    )
  }

  return (
    <div>
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/resume-critique"
            element={
              <ProtectedRoute>
                <ResumeManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/job-fit"
            element={
              <ProtectedRoute>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Job Fit Analysis</h2>
                  <p>Analyze how well you fit specific job descriptions</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/interview-prep"
            element={
              <ProtectedRoute>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Interview Preparation</h2>
                  <p>Practice common interview questions</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning-plan"
            element={
              <ProtectedRoute>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Learning Plan</h2>
                  <p>Get personalized learning recommendations</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResumeProvider>
          <AppContent />
        </ResumeProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
