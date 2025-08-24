import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { Upload, TrendingUp, Target, Users } from 'lucide-react';

export function LandingPage() {
  const [resumeText, setResumeText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setResumeText(content);
      };
      reader.readAsText(file);
    }
  };

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
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setResumeText(content);
      };
      reader.readAsText(file);
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
            <Card className="max-w-2xl mx-auto mb-16 shadow-xl border-0 bg-white">
              <CardContent className="p-8">
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
                    >
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        Upload Resume
                      </label>
                    </Button>
                    
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
                  <div className="mt-8 space-y-4">
                    <div className="text-left">
                      <label className="block text-sm text-gray-700 mb-2">
                        Resume Content Preview:
                      </label>
                      <Textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Your resume content will appear here..."
                        className="h-32 text-sm bg-gray-50 border-gray-200"
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