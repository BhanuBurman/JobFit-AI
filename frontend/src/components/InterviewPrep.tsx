import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  Mic, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight,
  Play,
  User,
  Code,
  Lightbulb,
  Clock
} from 'lucide-react';
import type { ResumeVersion } from '../App';

interface InterviewPrepProps {
  currentResume?: ResumeVersion;
}

interface Question {
  id: string;
  question: string;
  type: 'behavioral' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  sampleAnswer: string;
  tips: string[];
}

const mockQuestions: Question[] = [
  {
    id: 'behavioral-1',
    question: 'Tell me about a time when you had to work with a difficult team member.',
    type: 'behavioral',
    difficulty: 'medium',
    category: 'Teamwork',
    sampleAnswer: 'I once worked with a colleague who was resistant to our new development process. I scheduled a one-on-one meeting to understand their concerns and found they were worried about meeting deadlines. Together, we created a modified workflow that addressed their concerns while still improving our efficiency. This resulted in better team collaboration and a 20% improvement in our delivery times.',
    tips: [
      'Use the STAR method (Situation, Task, Action, Result)',
      'Focus on your problem-solving approach',
      'Highlight positive outcomes and learnings'
    ]
  },
  {
    id: 'technical-1',
    question: 'Explain the difference between REST and GraphQL APIs.',
    type: 'technical',
    difficulty: 'medium',
    category: 'APIs',
    sampleAnswer: 'REST (Representational State Transfer) is an architectural style that uses standard HTTP methods and multiple endpoints for different resources. GraphQL is a query language that provides a single endpoint where clients can specify exactly what data they need. GraphQL offers more flexibility and efficiency by preventing over-fetching, while REST is simpler and has better caching capabilities.',
    tips: [
      'Provide concrete examples from your experience',
      'Mention pros and cons of each approach',
      'Discuss when to use each technology'
    ]
  },
  {
    id: 'behavioral-2',
    question: 'How do you handle technical debt in your projects?',
    type: 'behavioral',
    difficulty: 'hard',
    category: 'Project Management',
    sampleAnswer: 'I approach technical debt systematically by first conducting regular code reviews to identify issues early. I document technical debt items in our backlog with clear impact assessments and proposed solutions. During sprint planning, I advocate for allocating 15-20% of development time to addressing technical debt. For example, in my last project, we refactored a legacy authentication system that was causing frequent bugs, resulting in a 40% reduction in security-related issues.',
    tips: [
      'Show proactive approach to code quality',
      'Demonstrate business impact awareness',
      'Provide specific metrics and outcomes'
    ]
  },
  {
    id: 'technical-2',
    question: 'Implement a function to find the longest palindromic substring.',
    type: 'technical',
    difficulty: 'hard',
    category: 'Algorithms',
    sampleAnswer: `function longestPalindrome(s) {
  let start = 0, maxLen = 1;
  
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      let currentLen = right - left + 1;
      if (currentLen > maxLen) {
        start = left;
        maxLen = currentLen;
      }
      left--;
      right++;
    }
  }
  
  for (let i = 0; i < s.length; i++) {
    expandAroundCenter(i, i);     // odd length palindromes
    expandAroundCenter(i, i + 1); // even length palindromes
  }
  
  return s.substring(start, start + maxLen);
}`,
    tips: [
      'Explain your approach before coding',
      'Consider edge cases and time complexity',
      'Walk through an example with your solution'
    ]
  }
];

export function InterviewPrep({ currentResume }: InterviewPrepProps) {
  const [activeTab, setActiveTab] = useState<'behavioral' | 'technical'>('behavioral');
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [openQuestions, setOpenQuestions] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleQuestion = (questionId: string) => {
    const newOpenQuestions = new Set(openQuestions);
    if (newOpenQuestions.has(questionId)) {
      newOpenQuestions.delete(questionId);
    } else {
      newOpenQuestions.add(questionId);
    }
    setOpenQuestions(newOpenQuestions);
  };

  const handleGenerateMore = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const nextId = `${activeTab}-${Math.max(...questions.filter(q => q.type === activeTab).map(q => parseInt(q.id.split('-')[1]) || 0)) + 1}`;
    
    const newQuestions: Question[] = [
      {
        id: nextId,
        question: 'Describe a time when you had to learn a new technology quickly.',
        type: activeTab,
        difficulty: 'medium',
        category: 'Learning',
        sampleAnswer: 'When our team decided to migrate from Redux to Zustand for state management, I had just two weeks to become proficient. I created a learning plan that included documentation review, building small demo projects, and pairing with a colleague who had experience. I also set up a knowledge-sharing session for the team. This approach helped me successfully implement the migration and reduced our bundle size by 30%.',
        tips: [
          'Show structured learning approach',
          'Demonstrate knowledge sharing',
          'Quantify the results achieved'
        ]
      }
    ];
    
    setQuestions(prev => [...prev, ...newQuestions]);
    setIsGenerating(false);
  };

  const filteredQuestions = questions.filter(q => q.type === activeTab);
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!currentResume) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto bg-white shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mic className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg mb-3 text-gray-900">No Resume Found</h3>
              <p className="text-gray-600 mb-6">
                Upload a resume to get personalized interview questions based on your experience.
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mic className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl text-gray-900">Personalized Interview Questions</h1>
              <p className="text-gray-600">Practice with questions tailored to your experience and role</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl text-blue-600 mb-1">{filteredQuestions.length}</div>
                <p className="text-sm text-gray-600">Generated Questions</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl text-green-600 mb-1">
                  {Math.round((filteredQuestions.length * 0.7))}
                </div>
                <p className="text-sm text-gray-600">Practice Score</p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-4 text-center">
                <div className="text-2xl text-orange-600 mb-1">
                  {filteredQuestions.filter(q => q.difficulty === 'hard').length}
                </div>
                <p className="text-sm text-gray-600">Challenge Questions</p>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'behavioral' | 'technical')}>
            <div className="flex items-center justify-between">
              <TabsList className="grid w-64 grid-cols-2 bg-gray-100">
                <TabsTrigger 
                  value="behavioral" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  <User className="h-4 w-4" />
                  <span>Behavioral</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="technical" 
                  className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                >
                  <Code className="h-4 w-4" />
                  <span>Technical</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleGenerateMore}
                  disabled={isGenerating}
                  variant="outline"
                  className="bg-white border-gray-200"
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Generate More
                </Button>
                
                <Button className="bg-blue-600 hover:bg-blue-700 text-white" disabled>
                  <Play className="h-4 w-4 mr-2" />
                  Start Mock Interview
                  <Badge variant="outline" className="ml-2 text-xs bg-orange-100 text-orange-600 border-orange-200">
                    Coming Soon
                  </Badge>
                </Button>
              </div>
            </div>

            <TabsContent value="behavioral" className="mt-8">
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <Card key={question.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
                    <Collapsible 
                      open={openQuestions.has(question.id)}
                      onOpenChange={() => toggleQuestion(question.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                                  {question.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                                  {question.category}
                                </Badge>
                              </div>
                              <CardTitle className="text-left text-gray-900">
                                {question.question}
                              </CardTitle>
                            </div>
                            <div className="ml-4">
                              {openQuestions.has(question.id) ? (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="border-t border-gray-200 pt-6">
                          <div className="space-y-6">
                            <div>
                              <h4 className="flex items-center space-x-2 text-sm text-gray-900 mb-3">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                <span>Sample Answer</span>
                              </h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {question.sampleAnswer}
                                </p>
                              </div>
                            </div>

                            <div>
                              <h4 className="flex items-center space-x-2 text-sm text-gray-900 mb-3">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span>Interview Tips</span>
                              </h4>
                              <ul className="space-y-2">
                                {question.tips.map((tip, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                              <Button variant="outline" size="sm" className="bg-white border-gray-200">
                                Practice Answer
                              </Button>
                              <Button variant="outline" size="sm" className="bg-white border-gray-200">
                                Save Question
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="technical" className="mt-8">
              <div className="space-y-4">
                {filteredQuestions.map((question) => (
                  <Card key={question.id} className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200">
                    <Collapsible 
                      open={openQuestions.has(question.id)}
                      onOpenChange={() => toggleQuestion(question.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                                  {question.difficulty}
                                </Badge>
                                <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">
                                  {question.category}
                                </Badge>
                              </div>
                              <CardTitle className="text-left text-gray-900">
                                {question.question}
                              </CardTitle>
                            </div>
                            <div className="ml-4">
                              {openQuestions.has(question.id) ? (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <CardContent className="border-t border-gray-200 pt-6">
                          <div className="space-y-6">
                            <div>
                              <h4 className="flex items-center space-x-2 text-sm text-gray-900 mb-3">
                                <Code className="h-4 w-4 text-green-500" />
                                <span>Sample Solution</span>
                              </h4>
                              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                                <pre className="text-sm text-green-400 font-mono">
                                  {question.sampleAnswer}
                                </pre>
                              </div>
                            </div>

                            <div>
                              <h4 className="flex items-center space-x-2 text-sm text-gray-900 mb-3">
                                <Clock className="h-4 w-4 text-blue-500" />
                                <span>Approach Tips</span>
                              </h4>
                              <ul className="space-y-2">
                                {question.tips.map((tip, index) => (
                                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span>{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                              <Button variant="outline" size="sm" className="bg-white border-gray-200">
                                Run Code
                              </Button>
                              <Button variant="outline" size="sm" className="bg-white border-gray-200">
                                Save Solution
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}