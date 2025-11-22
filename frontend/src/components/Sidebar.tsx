import React, { useEffect, useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { resumeAPI } from '../lib/api';
import { SquarePen } from 'lucide-react';

interface ResumeListItem {
  resume_id: number;
  file_name: string | null;
}

const Sidebar: React.FC = () => {
  const { currentResume, setCurrentResumeId } = useResume();
  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async () => {
      setLoading(true);
      try {
        const list = await resumeAPI.getResumes();
        setResumes(list);
      } catch {
        setResumes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const handleNewChat = () => {
    setCurrentResumeId(null);
  }

  return (
    <aside className="w-64 h-full bg-gradient-to-b from-blue-700 to-blue-400 text-white shadow-lg p-4 flex flex-col">
      <h2 className="text-lg font-bold mb-4">History Chats</h2>
      {loading ? (
        <div className="text-center text-blue-100">Loading...</div>
      ) : resumes.length === 0 ? (
        <div className="text-center text-blue-100">No resumes found.</div>
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto">
            <button 
                className='flex w-full mb-4 px-4 py-2 font-semibold rounded-lg shadow hover:bg-blue-100 hover:text-black transition-colors duration-150 cursor-pointer'
                onClick={() => {handleNewChat()}}
            >
                <SquarePen /> 
                <span className='ml-2'>
                    New Chat
                </span>
            </button>
            <div className="border-b-2 border-blue-400"></div>
          {resumes.map((resume) => (
            <li key={resume.resume_id}>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-150 ${
                  currentResume?.id === resume.resume_id
                    ? 'bg-white text-blue-700 font-semibold shadow'
                    : 'hover:bg-blue-600 hover:text-white'
                }`}
                onClick={() => setCurrentResumeId(resume.resume_id)}
              >
                {resume.file_name || 'Untitled Resume'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
};

export default Sidebar;
