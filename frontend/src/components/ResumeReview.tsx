import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Eye, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { resumeReviewAPI } from '../lib/api';
import { useResume } from '../context/ResumeContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

interface ResumeReviewData {
  buzzwords: string[];
  weak_sentences: string[];
  strong_points: string[];
  skills_score: number;
  experience_score: number;
  clarity_score: number;
  ats_score: number;
  missing_skills: string[];
  irrelevant_content: string[];
  role_fit_analysis: string;
  improvement_suggestions: string[];
  final_feedback: string;
}

const ResumeReview = () => {
  const { currentResume } = useResume();
  const [reviewData, setReviewData] = useState<ResumeReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  // Load latest review if exists when resume changes
  useEffect(() => {
    const loadExisting = async () => {
      setIsAnalyzed(false);
      setReviewData(null);
      if (!currentResume?.id) return;
      try {
        const existing = await resumeReviewAPI.getLatestReview(currentResume.id);
        if (existing?.review) {
          setReviewData(existing.review);
          setIsAnalyzed(true);
        }
      } catch {
        // No existing review; ignore
      }
    };
    void loadExisting();
  }, [currentResume?.id]);

  const handleGenerateAnalysis = async () => {
    if (!currentResume?.id || !currentResume.content?.trim()) {
      setError('No resume selected. Please pick or upload a resume first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await resumeReviewAPI.reviewResume(currentResume.id, currentResume.content);
      setReviewData(response.review);
      setIsAnalyzed(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate analysis. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Resume Analysis</h1>
        <p className="text-gray-600">Get AI-powered insights to improve your resume</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleGenerateAnalysis}
          disabled={isLoading || !currentResume?.content?.trim() || isAnalyzed}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Resume...
            </>
          ) : isAnalyzed ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Analyzed Successfully
            </>
          ) : (
            <>
              <Eye className="mr-2 h-5 w-5" />
              Generate AI Analysis
            </>
          )}
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="resume" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100">
          <TabsTrigger value="resume" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Your Resume
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Analysis Results
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Improvement Tips
          </TabsTrigger>
        </TabsList>

        {/* Resume Tab */}
        <TabsContent value="resume" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Resume Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentResume?.content ? (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <Textarea
                    value={currentResume.content}
                    readOnly
                    className="w-full min-h-[400px] text-sm bg-transparent border-none resize-none focus:ring-0"
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No resume content to display</p>
                  <p className="text-sm">Upload a resume to see the formatted content here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {reviewData ? (
            <div className="grid gap-6">
              {/* Scores Overview */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Performance Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{reviewData.skills_score}/10</div>
                      <div className="text-sm text-gray-600">Skills</div>
                      <Progress value={reviewData.skills_score * 10} className="mt-2" />
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{reviewData.experience_score}/10</div>
                      <div className="text-sm text-gray-600">Experience</div>
                      <Progress value={reviewData.experience_score * 10} className="mt-2" />
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{reviewData.clarity_score}/10</div>
                      <div className="text-sm text-gray-600">Clarity</div>
                      <Progress value={reviewData.clarity_score * 10} className="mt-2" />
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{reviewData.ats_score}/10</div>
                      <div className="text-sm text-gray-600">ATS Friendly</div>
                      <Progress value={reviewData.ats_score * 10} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Sections */}
              <div className="grid gap-6">
                {/* Role Fit Analysis */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                      Role Fit Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{reviewData.role_fit_analysis}</p>
                  </CardContent>
                </Card>

                {/* Strong Points */}
                <Card className="shadow-lg border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-green-700">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {reviewData.strong_points.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Areas for Improvement */}
                {reviewData.weak_sentences.length > 0 && (
                  <Card className="shadow-lg border-orange-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-orange-700">
                        <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {reviewData.weak_sentences.map((sentence, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="mr-2 h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{sentence}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Buzzwords */}
                {reviewData.buzzwords.length > 0 && (
                  <Card className="shadow-lg border-yellow-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-yellow-700">
                        <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
                        Overused Terms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {reviewData.buzzwords.map((word, index) => (
                          <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800 px-3 py-1">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Missing Skills */}
                {reviewData.missing_skills.length > 0 && (
                  <Card className="shadow-lg border-blue-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-blue-700">
                        <AlertCircle className="mr-2 h-5 w-5 text-blue-600" />
                        Missing Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {reviewData.missing_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="border-blue-300 text-blue-700 px-3 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Irrelevant Content */}
                {reviewData.irrelevant_content.length > 0 && (
                  <Card className="shadow-lg border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg text-red-700">
                        <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                        Irrelevant Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {reviewData.irrelevant_content.map((content, index) => (
                          <li key={index} className="flex items-start">
                            <AlertCircle className="mr-2 h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{content}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Final Feedback */}
                <Card className="shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg text-blue-700">
                      <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                      Final Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">{reviewData.final_feedback}</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <Eye className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg text-gray-600">Click "Generate AI Analysis" to see detailed results</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-6">
          {reviewData?.improvement_suggestions.length ? (
            <div className="grid gap-4">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-green-700">
                    <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                    Actionable Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewData.improvement_suggestions.map((suggestion, index) => (
                      <Card key={index} className="border-green-200 bg-green-50">
                        <CardContent className="pt-4">
                          <div className="flex items-start">
                            <CheckCircle className="mr-3 h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-700 leading-relaxed">{suggestion}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : reviewData ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-400" />
                <p className="text-lg text-gray-600">No specific suggestions available</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <Eye className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg text-gray-600">Generate analysis to see improvement suggestions</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeReview;