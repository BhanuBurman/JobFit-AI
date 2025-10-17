// frontend/src/components/ResumeManager.tsx
import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import ResumeUpload from './ResumeUpload';
import ResumeList from './ResumeList';

const ResumeManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'list'>('upload');
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload Resume
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Resumes
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Resume Management</h1>
            <p className="text-gray-600">
              Welcome, {user?.first_name} {user?.last_name}! Manage your resumes here.
            </p>
          </div>

          {activeTab === 'upload' && <ResumeUpload />}
          {activeTab === 'list' && <ResumeList />}
        </div>
      </div>
    </div>
  );
};

export default ResumeManager;
