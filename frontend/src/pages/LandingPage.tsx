import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Upload, TrendingUp, Target, Users } from 'lucide-react';
import api from '../lib/api';
import { useResume } from '../lib/ResumeContext';

export function LandingPage() {
  const [resumeText, setResumeText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentResumeId } = useResume();

  const UPLOAD_ENDPOINT = "/upload/pdf";

  // Load existing resumes when page loads
  useEffect(() => {
    const loadCurrentResume = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      // First check if there's a specific resume_id in localStorage
      const storedResumeId = localStorage.getItem('current_resume_id');

      if (storedResumeId) {
        try {
          // Load the specific resume
          const response = await api.get(`/resumes/${storedResumeId}`);
          const resume = response.data;
          setResumeText(resume.resume_text || '');
          await setCurrentResumeId(resume.resume_id);
          return;
        } catch (err) {
          console.log('Stored resume not found, loading latest', err);
          localStorage.removeItem('current_resume_id');
        }
      }

      // Fallback: load the most recent resume
      try {
        const response = await api.get('/resumes');
        if (response.data && response.data.length > 0) {
          const latestResume = response.data[response.data.length - 1];
          setResumeText(latestResume.resume_text || '');
          await setCurrentResumeId(latestResume.resume_id);
        }
      } catch (err) {
        console.log('No resumes found or not logged in', err);
      }
    };

    loadCurrentResume();
  }, []);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      console.log("Starting upload for file:", file.name);

      const formData = new FormData();
      formData.append("file", file);

      // Single API call - upload now handles both file upload and text extraction
      const uploadResponse = await api.post(UPLOAD_ENDPOINT, formData);
      console.log("Upload successful:", uploadResponse.data);

      // The upload endpoint now returns extracted text directly
      if (uploadResponse.data.success && uploadResponse.data.data) {
        const resumeData = uploadResponse.data.data;
        setResumeText(resumeData.resume_text || '');

        // Update current resume by ID only
        await setCurrentResumeId(resumeData.resume_id);
      }

    } catch (error: unknown) {
      console.error("Upload error:", error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status: number; data: unknown } };
        if (axiosError.response?.status === 422) {
          console.error("Validation error details:", axiosError.response.data);
          setError("Invalid file format or data. Please try again.");
        } else if (axiosError.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError("An error occurred during upload.");
        }
      } else if (error instanceof Error) {
        setError(error.message || "An error occurred during upload.");
      } else {
        setError("An error occurred during upload.");
      }
    } finally {
      setIsUploading(false);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) =>{
    uploadFile(e.target.files?.[0] as File);
  }


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
      // Handle file upload the same way as handleFileUpload
      uploadFile(file as File);
    }
  };  

  const handleSubmit = () => {
    if (resumeText.trim()) {
      console.log(resumeText);
    }
  };

  const sampleResume = `John Doe
Software Engineer | john.doe@email.com | (555) 123-4567

EXPERIENCE
Senior Software Engineer | TechCorp | 2021-2024
• Developed scalable web applications using React and Node.js serving 100K+ users
• Led a team of 5 developers on microservices architecture migration
• Improved application performance by 40% through code optimization and caching

Software Engineer | StartupXYZ | 2019-2021
• Built responsive frontend interfaces using modern JavaScript frameworks
• Implemented RESTful APIs and database solutions with 99.9% uptime
• Collaborated with cross-functional teams in agile environment

EDUCATION
Bachelor of Science in Computer Science | University ABC | 2019

SKILLS
Programming Languages: JavaScript, Python, TypeScript, Java
Frameworks: React, Node.js, Express, Django, Next.js
Databases: PostgreSQL, MongoDB, Redis
Tools: Git, Docker, AWS, Jenkins, Kubernetes`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl text-gray-900 mb-6">
              Your AI Career Coach
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Upload your resume. Get personalized feedback, analyze job fit, 
              prepare for interviews, and create a career roadmap.
            </p>

            {/* Upload Widget */}
            <Card className="h-screen max-w-4xl mx-auto mb-16 shadow-xl border-0 bg-white">
              <CardContent className="p-8 flex justify-center items-center gap-5">
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg mb-2 text-gray-900">
                    Drag & drop your resume here
                  </h3>
                  <p className="text-gray-600 mb-6">
                    or click to browse files (PDF, DOC, TXT)
                  </p>
                  
                  <div className="space-y-4">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".txt,.doc,.docx,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      asChild
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      disabled={isUploading}
                    >
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        {isUploading ? 'Uploading...' : 'Upload Resume'}
                      </label>
                    </Button>

                    {error && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 h-px bg-gray-300"></div>
                      <span className="text-sm text-gray-500">or</span>
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setResumeText(sampleResume)}
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      Try with Sample Resume
                    </Button>
                  </div>
                </div>

                {resumeText && (
                  <div className=" w-full space-y-4 overflow-y-auto">
                    <div className="text-left">
                      <label className="block text-sm text-gray-700 mb-2">
                        Resume Content Preview:
                      </label>
                      <Textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Your resume content will appear here..."
                        className="max-h-[35rem] text-sm bg-gray-50 border-gray-200 overflow-y-auto"
                      />
                    </div>
                    <Button 
                      onClick={handleSubmit}
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Start Analysis →
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  icon: TrendingUp,
                  title: 'Resume Analysis',
                  description: 'Get detailed feedback on your resume with AI-powered suggestions for improvement.'
                },
                {
                  icon: Target,
                  title: 'Job Fit Scoring',
                  description: 'See how well your skills match specific job requirements and roles.'
                },
                {
                  icon: Users,
                  title: 'Interview Prep',
                  description: 'Practice with personalized interview questions tailored to your experience.'
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                  <CardContent className="p-8 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg mb-3 text-gray-900">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Background Illustration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-green-100 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full opacity-10 blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}