import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { FileText, Eye, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { resumeReviewAPI } from '../lib/api';

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

const ResumeReview = ({resumeText}: {resumeText: string}) => {
  const [reviewData, setReviewData] = useState<ResumeReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAnalysis = async () => {
    if (!resumeText?.trim()) {
      setError('Please provide resume text to analyze');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await resumeReviewAPI.reviewResume(resumeText);
      setReviewData(response.review);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate analysis. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='resume_review_container'>
      {/* Error Alert */}
      {error && (
        <Alert className="mt-4 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

        {/* Action buttons */}
        <div className="mt-6 flex gap-3">
        <Button
          onClick={handleGenerateAnalysis}
          disabled={isLoading || !resumeText?.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Reviewing Resume...
            </>
          ) : (
            'Review Resume'
          )}
          </Button>
        </div>

        <div className='flex'>
          <div className="prose prose-sm max-w-none p-5">
            {resumeText ? (
              <Textarea value={resumeText} readOnly className="w-full max-h-[35rem] text-sm bg-gray-50 border-gray-200 overflow-y-auto" />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No resume content to display</p>
                <p className="text-sm">Upload a resume to see the formatted content here</p>
              </div>
            )}
          </div>

          <div className='analysis_section'>
            <h2>Analysis</h2>
            <div className='analysis_content'>
            {reviewData ? (
              <div className="space-y-6">
                {/* Scores Section */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Skills Score</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center space-x-2">
                        <Progress value={reviewData.skills_score * 10} className="flex-1" />
                        <span className="text-sm font-bold">{reviewData.skills_score}/10</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Experience Score</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center space-x-2">
                        <Progress value={reviewData.experience_score * 10} className="flex-1" />
                        <span className="text-sm font-bold">{reviewData.experience_score}/10</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Clarity Score</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center space-x-2">
                        <Progress value={reviewData.clarity_score * 10} className="flex-1" />
                        <span className="text-sm font-bold">{reviewData.clarity_score}/10</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">ATS Score</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center space-x-2">
                        <Progress value={reviewData.ats_score * 10} className="flex-1" />
                        <span className="text-sm font-bold">{reviewData.ats_score}/10</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Role Fit Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Role Fit Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{reviewData.role_fit_analysis}</p>
                  </CardContent>
                </Card>

                {/* Strong Points */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                      Strong Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {reviewData.strong_points.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Buzzwords */}
                {reviewData.buzzwords.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-yellow-600" />
                        Overused Buzzwords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {reviewData.buzzwords.map((word, index) => (
                          <Badge key={index} variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Weak Sentences */}
                {reviewData.weak_sentences.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-orange-600" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
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

                {/* Missing Skills */}
                {reviewData.missing_skills.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-blue-600" />
                        Missing Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {reviewData.missing_skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="border-blue-300 text-blue-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Irrelevant Content */}
                {reviewData.irrelevant_content.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                        Irrelevant Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
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
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
                      Final Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{reviewData.final_feedback}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Click "Generate AI Analysis" to see the detailed analysis</p>
            </div>
            )}
            </div>
          </div>

          <div className='improvement_suggestions_section'>
            <h2>Improvement Suggestions</h2>
            <div className='improvement_suggestions_content'>
            {reviewData?.improvement_suggestions.length ? (
              <div className="space-y-4">
                {reviewData.improvement_suggestions.map((suggestion, index) => (
                  <Card key={index} className="border-green-200 bg-green-50">
                    <CardContent className="pt-4">
                      <div className="flex items-start">
                        <CheckCircle className="mr-3 h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{suggestion}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : reviewData ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No specific improvement suggestions available</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate analysis to see improvement suggestions</p>
              </div>
            )}
            </div>
          </div>
                </div>
        </div>
  );
};

export default ResumeReview;