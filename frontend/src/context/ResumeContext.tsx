// frontend/src/lib/ResumeContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { resumeAPI } from '../lib/api';

export interface ResumeVersion {
  id: number;
  version: number;
  filename: string;
  uploadedAt: Date;
  content: string;
}

interface ResumeContextType {
  currentResume: ResumeVersion | null;
  setCurrentResumeId: (resumeId: number | null) => Promise<void>;
  clearCurrentResume: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useResume = () => {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
};

interface ResumeProviderProps {
  children: ReactNode;
}

export const ResumeProvider: React.FC<ResumeProviderProps> = ({ children }) => {
  const [currentResume, setCurrentResume] = useState<ResumeVersion | null>(null);

  const setCurrentResumeId = useCallback(async (resumeId: number | null) => {
    if (resumeId == null) {
      setCurrentResume(null);
      localStorage.removeItem('current_resume_id');
      return;
    }
    const r = await resumeAPI.getResume(resumeId);
    setCurrentResume(prev => ({
      id: r.resume_id,
      version: (prev?.version || 0) + 1,
      filename: r.file_name || 'Current Resume',
      uploadedAt: new Date(r.updated_at || r.created_at),
      content: r.resume_text || '',
    }));
    localStorage.setItem('current_resume_id', String(resumeId));
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedId = localStorage.getItem('current_resume_id');
      if (storedId) {
        await setCurrentResumeId(Number(storedId));
        return;
      }
      try {
        const list = await resumeAPI.getResumes();
        if (Array.isArray(list) && list.length > 0) {
          await setCurrentResumeId(list[list.length - 1].resume_id);
        }
      } catch {
        // no-op
      }
    };
    void init();
  }, [setCurrentResumeId]);

  const clearCurrentResume = () => {
    setCurrentResume(null);
    localStorage.removeItem('current_resume_id');
  };

  return (
    <ResumeContext.Provider value={{ currentResume, setCurrentResumeId, clearCurrentResume }}>
      {children}
    </ResumeContext.Provider>
  );
};

