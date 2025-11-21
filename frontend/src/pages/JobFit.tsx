/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import {
  Target,
  MapPin,
  Search,
  ChevronDown,
  ChevronUp,
  Check,
  Building,
  DollarSign,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { searchJobsFromResume, type JobMatch, getJobDetail, type JobDetailResponse, jobfitAPI } from '../lib/api';
import { useResume } from '../context/ResumeContext';

export function JobFit() {
  const { currentResume } = useResume();
  const [selectedRole, setSelectedRole] = useState('');
  const [location, setLocation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [detailsByJobId, setDetailsByJobId] = useState<Record<string, JobDetailResponse>>({});
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [buttonLabel, setButtonLabel] = useState('Find Matching Jobs');

  useEffect(() => {
    const preload = async () => {
      if (!currentResume?.id) return;
      try {
        const saved = await jobfitAPI.getLatest(currentResume.id, selectedRole || undefined, location || undefined);
        setJobs(saved.result.matches);
        setAnalysisId(saved.analysis_id);
        setButtonLabel('Search Again');
      } catch {
        setAnalysisId(null);
        setButtonLabel('Find Matching Jobs');
      }
    };
    void preload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResume?.id]);

  const handleRunAnalysis = async () => {
    if (!currentResume?.content) {
      setError("No resume available. Please upload a resume first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const searchQuery = `${currentResume.content.slice(0, 500)} ${selectedRole ? `role: ${selectedRole}` : ''} ${location ? `location: ${location}` : ''}`.trim();

      if (analysisId) {
        const refreshed = await jobfitAPI.refresh(analysisId);
        setJobs(refreshed.result.matches);
      } else {
        const response = await searchJobsFromResume(
          searchQuery,
          currentResume.id,
          selectedRole || undefined,
          location || undefined,
          undefined,
          10,
          0.6
        );
        setJobs(response.matches);
        try {
          const saved = await jobfitAPI.getLatest(currentResume.id, selectedRole || undefined, location || undefined);
          setAnalysisId(saved.analysis_id);
          setButtonLabel('Search Again');
        } catch {
          // ignore preload failure
        }
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
      setError('Failed to search for matching jobs. Please try again.');
      setJobs([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleJobExpansion = async (jobTitle: string, jobId?: string) => {
    const next = expandedJob === jobTitle ? null : jobTitle;
    setExpandedJob(next);

    if (next && jobId && !detailsByJobId[jobId]) {
      setLoadingDetailId(jobId);
      try {
        const detail = await getJobDetail(jobId);
        setDetailsByJobId(prev => ({ ...prev, [jobId]: detail }));
      } catch (e) {
        // Non-fatal; we keep the preview description
        console.error('Failed to load job detail', e);
      } finally {
        setLoadingDetailId(null);
      }
    }
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                      placeholder="Enter location or remote"
                      className="pl-10 bg-white"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing || !currentResume}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Searching Jobs...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4" />
                        <span>{buttonLabel}</span>
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
                Sorted by similarity score
              </p>
            </div>

            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {jobs.map((job, index) => (
              <Card key={`${job.title}-${index}`} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg text-gray-900">{job.title}</h3>
                        <Badge
                          variant="outline"
                          className={`${
                            job.similarity_score >= 0.8
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : job.similarity_score >= 0.6
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-orange-100 text-orange-800 border-orange-200'
                          }`}
                        >
                          {(job.similarity_score * 100).toFixed(0)}% match
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
                        {job.salary_range && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary_range}</span>
                          </div>
                        )}
                        {(job.metadata as any)?.formatted_work_type && (
                          <div className="flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                            <span>{String((job.metadata as any).formatted_work_type)}</span>
                          </div>
                        )}
                        {(job.metadata as any)?.formatted_experience_level && (
                          <div className="flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                            <span>{String((job.metadata as any).formatted_experience_level)}</span>
                          </div>
                        )}
                      </div>
                      {/* Skills Preview */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-green-700 border-green-200 bg-green-50">
                            <Check className="h-3 w-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <Badge variant="outline" className="text-gray-600">
                            +{job.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      onClick={() => toggleJobExpansion(job.title, String(((job.metadata as any)?.job_id) ?? `${job.title}-${job.company}`))}
                      className="ml-4"
                    >
                      {expandedJob === job.title ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {/* Expanded Details */}
                  {expandedJob === job.title && (
                    <div className="border-t border-gray-200 pt-6 space-y-6">
                      <div>
                        <h4 className="text-sm text-gray-900 mb-3">Job Description</h4>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                          {(() => {
                            const jid = String(((job.metadata as any)?.job_id) ?? `${job.title}-${job.company}`);
                            if (loadingDetailId === jid) return 'Loading full description...';
                            const detail = detailsByJobId[jid];
                            return detail?.full_description ?? job.description;
                          })()}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm text-gray-900 mb-3 flex items-center">
                          <Check className="h-4 w-4 text-green-600 mr-2" />
                          Required Skills ({job.skills.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-green-700 border-green-200 bg-green-50">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm text-gray-900 mb-3">Compensation</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            {((job.metadata as any)?.min_salary) && ((job.metadata as any)?.max_salary) && (
                              <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>
                                  Range: {job.salary_range}
                                </span>
                              </li>
                            )}
                            {((job.metadata as any)?.currency) && ((job.metadata as any)?.pay_period) && (
                              <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>
                                  Pay: {(job.metadata as any).currency} ({typeof (job.metadata as any).pay_period === 'string' ? ((job.metadata as any).pay_period as string).toLowerCase() : String((job.metadata as any).pay_period)})
                                </span>
                              </li>
                            )}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-sm text-gray-900 mb-3">Posting</h4>
                          <ul className="space-y-2 text-sm text-gray-600">
                            {(job.metadata as any)?.job_posting_url && (
                              <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <a
                                  href={String((job.metadata as any).job_posting_url)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View posting
                                </a>
                              </li>
                            )}
                            {(job.metadata as any)?.listed_time && (
                              <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>
                                  Posted: {new Date(String((job.metadata as any).listed_time)).toLocaleDateString()}
                                </span>
                              </li>
                            )}
                            {((job.metadata as any)?.applies || (job.metadata as any)?.views) && (
                              <li className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>
                                  {(job.metadata as any)?.applies ? `${(job.metadata as any).applies} applies` : ''}
                                  {((job.metadata as any)?.applies && (job.metadata as any)?.views) ? ' • ' : ''}
                                  {(job.metadata as any)?.views ? `${(job.metadata as any).views} views` : ''}
                                </span>
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                        {(job.metadata as any)?.job_posting_url ? (
                          <a href={String((job.metadata as any).job_posting_url)} target="_blank" rel="noreferrer">
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                              Apply Now
                            </Button>
                          </a>
                        ) : (
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled>
                            Apply Now
                          </Button>
                        )}
                        <Button variant="outline" className="bg-white border-gray-200">
                          Save Job
                        </Button>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 ml-auto">
                          <Clock className="h-3 w-3" />
                          <span>Posted recently</span>
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
                Set your preferences above and click "Find Matching Jobs" to discover positions that match your resume using AI-powered semantic search.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}