import './App.css'
import { LandingPage } from './pages/LandingPage'
import { Navigation } from './components/Navigation'
import { AuthProvider, useAuth } from './lib/auth'
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
  // State for active tab
  const [activeTab, setActiveTab] = useState<Module>('home')
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { isAuthenticated } = useAuth()

  // Handler for tab changes
  const handleTabChange = (tab: Module) => {
    setActiveTab(tab)
  }

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
      <Navigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Add your main content here based on activeTab */}
      <main>
        {activeTab === 'home' && (
          <LandingPage />
        )}

        {activeTab === 'resume-critique' && (
          <ProtectedRoute>
            <ResumeManager />
          </ProtectedRoute>
        )}

        {activeTab === 'job-fit' && (
          <ProtectedRoute>
            <div>
              <h2 className="text-2xl font-bold mb-4">Job Fit Analysis</h2>
              <p>Analyze how well you fit specific job descriptions</p>
            </div>
          </ProtectedRoute>
        )}

        {activeTab === 'interview-prep' && (
          <ProtectedRoute>
            <div>
              <h2 className="text-2xl font-bold mb-4">Interview Preparation</h2>
              <p>Practice common interview questions</p>
            </div>
          </ProtectedRoute>
        )}

        {activeTab === 'learning-plan' && (
          <ProtectedRoute>
            <div>
              <h2 className="text-2xl font-bold mb-4">Learning Plan</h2>
              <p>Get personalized learning recommendations</p>
            </div>
          </ProtectedRoute>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
