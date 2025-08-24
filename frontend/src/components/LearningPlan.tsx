import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Checkbox } from './ui/checkbox';
import { 
  BookOpen, 
  RefreshCw, 
  Download, 
  ExternalLink,
  CheckCircle,
  Clock,
  Play,
  Calendar,
  Target,
  Trophy
} from 'lucide-react';
import type { ResumeVersion } from '../App';

interface LearningPlanProps {
  currentResume?: ResumeVersion;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  week: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'Course' | 'Documentation' | 'Practice' | 'Project';
  resources: {
    name: string;
    url: string;
    type: 'video' | 'article' | 'course' | 'practice';
  }[];
  completed: boolean;
  skills: string[];
}

const mockLearningPlan: LearningModule[] = [
  {
    id: '1',
    title: 'Docker Fundamentals',
    description: 'Learn containerization basics and Docker commands for modern application deployment.',
    duration: '2 weeks',
    week: 'Week 1-2',
    difficulty: 'Beginner',
    type: 'Course',
    resources: [
      { name: 'Docker Official Tutorial', url: '#', type: 'course' },
      { name: 'Containerization Concepts', url: '#', type: 'article' },
      { name: 'Docker Hands-on Lab', url: '#', type: 'practice' }
    ],
    completed: false,
    skills: ['Docker', 'Containerization', 'DevOps']
  },
  {
    id: '2',
    title: 'Kubernetes Essentials',
    description: 'Master container orchestration with Kubernetes for scalable applications.',
    duration: '2 weeks',
    week: 'Week 3-4',
    difficulty: 'Intermediate',
    type: 'Course',
    resources: [
      { name: 'Kubernetes Documentation', url: '#', type: 'article' },
      { name: 'K8s Cluster Setup', url: '#', type: 'practice' },
      { name: 'Pod Management Tutorial', url: '#', type: 'video' }
    ],
    completed: false,
    skills: ['Kubernetes', 'Orchestration', 'Cloud Native']
  },
  {
    id: '3',
    title: 'System Design Fundamentals',
    description: 'Learn to design scalable distributed systems and handle system design interviews.',
    duration: '2 weeks',
    week: 'Week 5-6',
    difficulty: 'Intermediate',
    type: 'Course',
    resources: [
      { name: 'System Design Primer', url: '#', type: 'article' },
      { name: 'Design Patterns Course', url: '#', type: 'course' },
      { name: 'Architecture Examples', url: '#', type: 'practice' }
    ],
    completed: false,
    skills: ['System Design', 'Architecture', 'Scalability']
  },
  {
    id: '4',
    title: 'TypeScript Advanced Features',
    description: 'Enhance your JavaScript skills with TypeScript advanced patterns and features.',
    duration: '1 week',
    week: 'Week 7',
    difficulty: 'Advanced',
    type: 'Documentation',
    resources: [
      { name: 'TypeScript Handbook', url: '#', type: 'article' },
      { name: 'Advanced Types Guide', url: '#', type: 'article' },
      { name: 'TypeScript Playground', url: '#', type: 'practice' }
    ],
    completed: false,
    skills: ['TypeScript', 'Type Safety', 'JavaScript']
  },
  {
    id: '5',
    title: 'Microservices Architecture Project',
    description: 'Build a complete microservices application using Docker, Kubernetes, and modern practices.',
    duration: '3 weeks',
    week: 'Week 8-10',
    difficulty: 'Advanced',
    type: 'Project',
    resources: [
      { name: 'Microservices Pattern Guide', url: '#', type: 'article' },
      { name: 'Service Mesh Tutorial', url: '#', type: 'course' },
      { name: 'Project Template', url: '#', type: 'practice' }
    ],
    completed: false,
    skills: ['Microservices', 'Docker', 'Kubernetes', 'System Design']
  },
  {
    id: '6',
    title: 'Testing & Quality Assurance',
    description: 'Master unit testing, integration testing, and test-driven development practices.',
    duration: '2 weeks',
    week: 'Week 11-12',
    difficulty: 'Intermediate',
    type: 'Course',
    resources: [
      { name: 'Jest Testing Framework', url: '#', type: 'course' },
      { name: 'TDD Best Practices', url: '#', type: 'article' },
      { name: 'Testing Workshop', url: '#', type: 'practice' }
    ],
    completed: false,
    skills: ['Testing', 'Jest', 'TDD', 'Quality Assurance']
  }
];

export function LearningPlan({ currentResume }: LearningPlanProps) {
  const [learningPlan, setLearningPlan] = useState<LearningModule[]>(mockLearningPlan);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const toggleModuleCompletion = (moduleId: string) => {
    setLearningPlan(prev => 
      prev.map(module => 
        module.id === moduleId 
          ? { ...module, completed: !module.completed }
          : module
      )
    );
  };

  const handleRegeneratePlan = async () => {
    setIsRegenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRegenerating(false);
  };

  const completedModules = learningPlan.filter(m => m.completed).length;
  const progressPercentage = Math.round((completedModules / learningPlan.length) * 100);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Course': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Documentation': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Practice': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Project': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'article': return '📖';
      case 'course': return '🎓';
      case 'practice': return '⚡';
      default: return '📄';
    }
  };

  if (!currentResume) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto bg-white shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg mb-3 text-gray-900">No Resume Found</h3>
              <p className="text-gray-600 mb-6">
                Upload a resume to get a personalized learning roadmap based on your career goals.
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">3-Month Roadmap</h1>
                <p className="text-gray-600">Personalized learning path to advance your career</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRegeneratePlan}
                disabled={isRegenerating}
                variant="outline"
                className="bg-white border-gray-200"
              >
                {isRegenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Regenerate Plan
              </Button>
              
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          {/* Progress Summary */}
          <Card className="bg-white shadow-lg border-0 mb-6">
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl text-blue-600 mb-1">{learningPlan.length}</div>
                  <p className="text-sm text-gray-600">Total Modules</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-green-600 mb-1">{completedModules}</div>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-orange-600 mb-1">
                    {learningPlan.length - completedModules}
                  </div>
                  <p className="text-sm text-gray-600">Remaining</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-purple-600 mb-1">{progressPercentage}%</div>
                  <p className="text-sm text-gray-600">Progress</p>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="text-gray-900">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {learningPlan.map((module, index) => (
            <Card 
              key={module.id} 
              className={`bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-200 ${
                module.completed ? 'bg-green-50 border-l-4 border-l-green-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Timeline Indicator */}
                  <div className="flex-shrink-0 mt-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      module.completed 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600 border-2 border-gray-300'
                    }`}>
                      {module.completed ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm">{index + 1}</span>
                      )}
                    </div>
                    
                    {/* Connecting Line */}
                    {index < learningPlan.length - 1 && (
                      <div className="w-px h-16 bg-gray-300 ml-4 mt-2"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className={`text-lg ${module.completed ? 'text-green-900' : 'text-gray-900'}`}>
                          {module.title}
                        </h3>
                        <Badge variant="outline" className={getDifficultyColor(module.difficulty)}>
                          {module.difficulty}
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(module.type)}>
                          {module.type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{module.week}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{module.duration}</span>
                        </div>
                        <Checkbox
                          checked={module.completed}
                          onCheckedChange={() => toggleModuleCompletion(module.id)}
                          className="ml-4"
                        />
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {module.description}
                    </p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {module.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                          <Target className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="text-sm text-gray-900 mb-3">Learning Resources:</h4>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {module.resources.map((resource, resourceIndex) => (
                          <div 
                            key={resourceIndex}
                            className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                          >
                            <span className="text-lg">{getResourceIcon(resource.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 truncate">{resource.name}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6 flex-shrink-0">
                              <ExternalLink className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {!module.completed && (
                      <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Play className="h-4 w-4 mr-2" />
                          Start Learning
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white border-gray-200">
                          View Details
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completion Milestone */}
        {progressPercentage === 100 && (
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl border-0 mt-8">
            <CardContent className="p-8 text-center">
              <Trophy className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-2xl mb-2">Congratulations! 🎉</h2>
              <p className="text-green-100 mb-6">
                You've completed your 3-month learning roadmap. You're now ready to take on new challenges!
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button variant="outline" className="bg-white text-green-600 border-white hover:bg-green-50">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Generate Next Plan
                </Button>
                <Button variant="outline" className="bg-white text-green-600 border-white hover:bg-green-50">
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}