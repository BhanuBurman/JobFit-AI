import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { 
  FileText, 
  RefreshCw, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Download
} from 'lucide-react';
import type { ResumeVersion } from '../App';

interface ResumeReviewProps {
  currentResume?: ResumeVersion;
  onUpdateResume: (content: string, changes?: string[]) => void;
  resumeVersions?: ResumeVersion[];
}

export function ResumeReview({ currentResume, onUpdateResume, resumeVersions = [] }: ResumeReviewProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<string>(currentResume?.id || '');
  const [resumeText, setResumeText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleReviewAgain = async () => {
    if (!currentResume) return;
    
    setIsAnalyzing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const improvements = [
      'Added quantified achievements',
      'Improved action verb usage', 
      'Enhanced technical skills section',
      'Optimized for ATS scanning'
    ];
    
    onUpdateResume(currentResume.content, improvements);
    setIsAnalyzing(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onUpdateResume(content);
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
        onUpdateResume(content);
      };
      reader.readAsText(file);
    }
  };

  const handleUploadResume = () => {
    if (resumeText.trim()) {
      onUpdateResume(resumeText);
      setResumeText('');
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

  const displayedResume = selectedVersion 
    ? resumeVersions.find(r => r.id === selectedVersion) || currentResume
    : currentResume;

  const strengths = [
    'Strong technical background with relevant experience',
    'Clear progression in software development roles',
    'Quantified achievements showing impact',
    'Good mix of technical and leadership skills',
    'Education aligns well with career path'
  ];

  const weaknesses = [
    'Missing specific programming frameworks in demand',
    'Could benefit from more leadership examples', 
    'Soft skills could be highlighted better',
    'Missing industry-specific certifications',
    'Could include more recent technology trends'
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">
                  {currentResume ? `Your Resume v${displayedResume?.version}` : 'Resume Critique'}
                </h1>
                <p className="text-gray-600">
                  {currentResume 
                    ? displayedResume?.createdAt.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Upload your resume to get AI-powered feedback and analysis'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Resume Version Selector - Always visible */}
              {resumeVersions.length > 0 && (
                <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                  <SelectTrigger className="w-48 bg-white">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {resumeVersions.map((resume) => (
                      <SelectItem key={resume.id} value={resume.id}>
                        Resume v{resume.version} ({resume.createdAt.toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {currentResume && (
                <Button 
                  onClick={handleReviewAgain}
                  disabled={isAnalyzing}
                  variant="outline"
                  className="bg-white border-gray-200"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Review Again
                </Button>
              )}
              
              <Button 
                onClick={() => document.getElementById('resume-file-upload')?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Resume
              </Button>
              <input
                type="file"
                id="resume-file-upload"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel: Resume Preview or Upload */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg text-gray-900">
                  {currentResume ? 'Resume Preview' : 'Upload Your Resume'}
                </span>
                {currentResume && (
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {currentResume ? (
                <ScrollArea className="h-[600px]">
                  <div className="p-6">
                    <pre className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap font-mono">
                      {displayedResume?.content}
                    </pre>
                  </div>
                </ScrollArea>
              ) : (
                <div className="p-6">
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
                      <Button 
                        onClick={() => document.getElementById('resume-file-upload')?.click()}
                        size="lg"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      >
                        Upload Resume
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
                    <div className="mt-8 space-y-4 border-t pt-6">
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
                        onClick={handleUploadResume}
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Start Analysis →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel: AI Critique */}
          <div className="space-y-6">
            {currentResume ? (
              <>
                {/* Resume Score */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span>Resume Score</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className="text-4xl mb-2 text-blue-600">
                        {displayedResume?.analysisScore || 0}
                        <span className="text-lg text-gray-500">/100</span>
                      </div>
                      <Progress 
                        value={displayedResume?.analysisScore || 0} 
                        className="h-3 mb-2"
                      />
                      <p className="text-sm text-gray-600">
                        {(displayedResume?.analysisScore || 0) >= 85 ? 'Excellent' : 
                         (displayedResume?.analysisScore || 0) >= 75 ? 'Good' : 
                         'Needs Improvement'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Strengths */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Strengths</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {strengths.map((strength, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{strength}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weaknesses */}
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span>Areas for Improvement</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{weakness}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Changes Made (if any) */}
                {displayedResume?.changes && displayedResume.changes.length > 0 && (
                  <Card className="bg-white shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg text-gray-900">
                        <RefreshCw className="h-5 w-5 text-blue-600" />
                        <span>Recent Changes</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {displayedResume.changes.map((change, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                              {change}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg mb-3 text-gray-900">Ready for AI Analysis</h3>
                  <p className="text-gray-600 mb-6">
                    Upload your resume to get detailed feedback on strengths, weaknesses, and areas for improvement.
                  </p>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500">✓ ATS Compatibility Check</div>
                    <div className="text-sm text-gray-500">✓ Content Analysis</div>
                    <div className="text-sm text-gray-500">✓ Improvement Suggestions</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}