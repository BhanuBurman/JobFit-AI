// frontend/src/lib/api.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // Login user
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get stored user
  getStoredUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

// Resume API calls
export const resumeAPI = {
  // Upload resume
  uploadResume: async (file: File, resumeText: string) => {
    const formData = new FormData();
    formData.append('file_name', file.name);
    formData.append('resume_text', resumeText);

    const response = await api.post('/resumes', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get all user resumes
  getResumes: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },

  // Get specific resume
  getResume: async (resumeId: number) => {
    const response = await api.get(`/resumes/${resumeId}`);
    return response.data;
  },

  // Update resume
  updateResume: async (resumeId: number, fileName: string, resumeText: string) => {
    const formData = new FormData();
    formData.append('file_name', fileName);
    formData.append('resume_text', resumeText);

    const response = await api.put(`/resumes/${resumeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Delete resume
  deleteResume: async (resumeId: number) => {
    const response = await api.delete(`/resumes/${resumeId}`);
    return response.data;
  }
};

// Resume Review API calls
export const resumeReviewAPI = {
  // Review and persist for a specific resume (backend requires both fields)
  reviewResume: async (resumeId: number, resumeText: string) => {
    const formData = new FormData();
    formData.append('resume_id', String(resumeId));
    formData.append('resume_text', resumeText);
    formData.append('k', '2');
    formData.append('lambda_mult', '0.5');

    const response = await api.post('/resume/review', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getLatestReview: async (resumeId: number) => {
    const response = await api.get(`/resume/${resumeId}/review`);
    return response.data;
  }
};

// Job Search API calls
export interface JobMatch {
  title: string;
  company: string;
  location: string;
  description: string;
  skills: string[];
  salary_range?: string;
  similarity_score: number;
  metadata: Record<string, unknown>;
}

export interface JobSearchResponse {
  query: string;
  limit: number;
  total_matches: number;
  matches: JobMatch[];
}

export interface JobFitSaved {
  analysis_id: number;
  result: JobSearchResponse;
}

export const searchJobs = async (query: string, limit: number = 10): Promise<JobSearchResponse> => {
  const response = await api.post('/search', { query, limit });
  return response.data;
};

export const searchJobsFromResume = async (
  resumeText: string,
  resumeId?: number,
  role?: string,
  location?: string,
  resumeAnalysis?: unknown,
  limit: number = 10,
  minScore: number = 0.6
): Promise<JobSearchResponse> => {
  const response = await api.post('/search/resume', {
    resume_text: resumeText,
    resume_id: resumeId,
    role,
    location,
    resume_analysis: resumeAnalysis,
    limit,
    min_score: minScore,
  });
  return response.data;
};

export interface JobDetailResponse {
  job_id: string;
  title: string;
  company: string;
  location: string;
  full_description: string;
  skills: string[];
  salary_range?: string;
  metadata: Record<string, unknown>;
}

export const getJobDetail = async (jobId: string): Promise<JobDetailResponse> => {
  const response = await api.get(`/search/job/${encodeURIComponent(jobId)}`);
  return response.data;
};

export const jobfitAPI = {
  getLatest: async (resumeId: number, role?: string, location?: string): Promise<JobFitSaved> => {
    const response = await api.get('/jobfit/analysis/latest', { params: { resume_id: resumeId, role, location } });
    return response.data;
  },
  refresh: async (analysisId: number): Promise<JobFitSaved> => {
    const response = await api.put(`/jobfit/analysis/${analysisId}/refresh`);
    return response.data;
  },
};

export default api;



// ******** Agent API Calls ***************
export interface Message {
  role: "human" | "ai";
  content: string;
}

export const getChatMessages = (resumeId: number): Promise<Message[]> => {
    return api.get(`/chat/history/${resumeId}`)
    .then((response) => {
      return response.data as Message[];
    })
    .catch(error => {
      console.error("Error fetching chat messages:", error);
    })
}
