import './App.css'
import { LandingPage } from './components/LandingPage'
import { Navigation } from './components/Navigation'
import { useState } from 'react'
// import type { Module, ResumeVersion } from './types' // You'll need to create this

export type Module = 'home' | 'resume-critique' | 'job-fit' | 'interview-prep' | 'learning-plan'

export interface ResumeVersion {
  version: number
  filename: string
  uploadedAt: Date
}

function App() {
  // State for active tab
  const [activeTab, setActiveTab] = useState<Module>('home')
  
  // Handler for tab changes
  const handleTabChange = (tab: Module) => {
    setActiveTab(tab)
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
          <div>
            <h2 className="text-2xl font-bold mb-4">Resume Critique</h2>
            <p>Upload your resume for AI-powered feedback</p>
          </div>
        )}
        
        {activeTab === 'job-fit' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Job Fit Analysis</h2>
            <p>Analyze how well you fit specific job descriptions</p>
          </div>
        )}
        
        {activeTab === 'interview-prep' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Interview Preparation</h2>
            <p>Practice common interview questions</p>
          </div>
        )}
        
        {activeTab === 'learning-plan' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Learning Plan</h2>
            <p>Get personalized learning recommendations</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
