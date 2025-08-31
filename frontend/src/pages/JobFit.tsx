import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Progress } from './ui/progress';
import { 
  Target, 
  MapPin, 
  Search, 
  Play, 
  ChevronDown, 
  ChevronUp,
  Check,
  X,
  Building,
  DollarSign,
  Clock
} from 'lucide-react';
import type { ResumeVersion } from '../App';

interface JobFitProps {
  currentResume?: ResumeVersion;
  onUpdateResume: (content: string, changes?: string[]) => void;
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  fitScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
  requirements: string[];
}

const mockJobs: JobListing[] = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    salary: '$140k - $180k',
    fitScore: 92,
    matchedSkills: ['React', 'Node.js', 'JavaScript', 'PostgreSQL', 'AWS'],
    missingSkills: ['Kubernetes', 'GraphQL'],
    description: 'We are looking for a Senior Software Engineer to join our growing team...',
    requirements: ['5+ years React experience', 'Backend API development', 'Cloud platforms']
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$110k - $140k',
    fitScore: 85,
    matchedSkills: ['JavaScript', 'React', 'Express', 'MongoDB'],
    missingSkills: ['TypeScript', 'Docker', 'Redux'],
    description: 'Join our fast-growing startup as a Full Stack Developer...',
    requirements: ['3+ years full-stack development', 'Modern JavaScript frameworks', 'Database design']
  },
  {
    id: '3',
    title: 'Backend Engineer',
    company: 'DataFlow Solutions',
    location: 'Austin, TX',
    salary: '$120k - $160k',
    fitScore: 78,
    matchedSkills: ['Node.js', 'Python', 'PostgreSQL', 'Redis'],
    missingSkills: ['Go', 'Microservices', 'Event Streaming'],
    description: 'We need a skilled Backend Engineer to build scalable systems...',
    requirements: ['Backend development expertise', 'Database optimization', 'API design']
  }
];

export function JobFit({ currentResume, onUpdateResume }: JobFitProps) {
  const [selectedRole, setSelectedRole] = useState('');
  const [location, setLocation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setJobs(mockJobs);
    setIsAnalyzing(false);
  };

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  if (!currentResume) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto bg-white shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg mb-3 text-gray-900">No Resume Found</h3>
              <p className="text-gray-600 mb-6">
                Upload a resume to analyze your job fit with available positions.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Go to Upload
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl text-gray-900">Job Fit Analysis</h1>
              <p className="text-gray-600">Find roles that match your skills and experience</p>
            </div>
          </div>

          {/* Filters */}
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Role</label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select role type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="backend">Backend Engineer</SelectItem>
                      <SelectItem value="frontend">Frontend Developer</SelectItem>
                      <SelectItem value="fullstack">Full Stack Developer</SelectItem>
                      <SelectItem value="mobile">Mobile Developer</SelectItem>
                      <SelectItem value="devops">DevOps Engineer</SelectItem>
                      <SelectItem value="data">Data Scientist</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location or remote"
                      className="pl-10 bg-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Button 
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Play className="h-4 w-4" />
                        <span>Run Analysis</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {jobs.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-gray-900">
                Found {jobs.length} matching positions
              </h2>
              <p className="text-sm text-gray-600">
                Sorted by fit score
              </p>
            </div>

            {jobs.map((job) => (
              <Card key={job.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg text-gray-900">{job.title}</h3>
                        <Badge 
                          variant={job.fitScore >= 90 ? "default" : job.fitScore >= 80 ? "secondary" : "outline"}
                          className={`${
                            job.fitScore >= 90 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : job.fitScore >= 80 
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-orange-100 text-orange-800 border-orange-200'
                          }`}
                        >
                          {job.fitScore}% match
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{job.company}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{job.salary}</span>
                        </div>
                      </div>

                      {/* Fit Score Bar */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Fit Score</span>
                          <span className="text-gray-900">{job.fitScore}/100</span>
                        </div>
                        <Progress value={job.fitScore} className="h-2" />
                      </div>

                      {/* Skills Preview */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.matchedSkills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-green-700 border-green-200 bg-green-50">
                            <Check className="h-3 w-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                        {job.missingSkills.slice(0, 2).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-red-700 border-red-200 bg-red-50">
                            <X className="h-3 w-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                        {(job.matchedSkills.length + job.missingSkills.length > 5) && (
                          <Badge variant="outline" className="text-gray-600">
                            +{job.matchedSkills.length + job.missingSkills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => toggleJobExpansion(job.id)}
                      className="ml-4"
                    >
                      {expandedJob === job.id ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedJob === job.id && (
                    <div className="border-t border-gray-200 pt-6 space-y-6">
                      <div>
                        <h4 className="text-sm text-gray-900 mb-3">Job Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {job.description}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm text-gray-900 mb-3 flex items-center">
                            <Check className="h-4 w-4 text-green-600 mr-2" />
                            Matched Skills ({job.matchedSkills.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.matchedSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-green-700 border-green-200 bg-green-50">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm text-gray-900 mb-3 flex items-center">
                            <X className="h-4 w-4 text-red-600 mr-2" />
                            Missing Skills ({job.missingSkills.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {job.missingSkills.map((skill) => (
                              <Badge key={skill} variant="outline" className="text-red-700 border-red-200 bg-red-50">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm text-gray-900 mb-3">Requirements</h4>
                        <ul className="space-y-2">
                          {job.requirements.map((req, index) => (
                            <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                          Apply Now
                        </Button>
                        <Button variant="outline" className="bg-white border-gray-200">
                          Save Job
                        </Button>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 ml-auto">
                          <Clock className="h-3 w-3" />
                          <span>Posted 2 days ago</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {jobs.length === 0 && !isAnalyzing && (
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg mb-3 text-gray-900">Ready to Find Your Perfect Job?</h3>
              <p className="text-gray-600 mb-6">
                Set your preferences above and click "Run Analysis" to discover positions that match your skills.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}