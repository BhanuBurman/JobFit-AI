// frontend/src/components/ResumeUpload.tsx
import React, { useState } from 'react';
import { resumeAPI } from '../lib/api';

const ResumeUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // For now, just set filename. In real app, you'd extract text from PDF
      const reader = new FileReader();
      reader.onload = () => {
        setResumeText(`Content extracted from ${file.name}. File size: ${file.size} bytes`);
      };

      // For demo, just read as text. In real app, use PDF parsing library
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      await resumeAPI.uploadResume(selectedFile, resumeText);
      setSuccess('Resume uploaded successfully!');
      setSelectedFile(null);
      setResumeText('');
      // Reset file input
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Upload New Resume</h2>
        <p className="mt-1 text-sm text-gray-600">
          Upload your resume file. We'll extract the text and store it for analysis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div>
          <label htmlFor="resume-file" className="block text-sm font-medium text-gray-700">
            Resume File
          </label>
          <div className="mt-1">
            <input
              id="resume-file"
              name="resume-file"
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Supported formats: PDF, DOC, DOCX, TXT. Maximum size: 10MB
          </p>
        </div>

        <div>
          <label htmlFor="resume-text" className="block text-sm font-medium text-gray-700">
            Resume Text (Extracted Content)
          </label>
          <div className="mt-1">
            <textarea
              id="resume-text"
              name="resume-text"
              rows={10}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              required
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Resume text will be extracted from your file..."
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            The text content of your resume will be extracted and stored for analysis.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={uploading || !selectedFile || !resumeText}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResumeUpload;
