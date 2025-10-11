// User types (matching backend models)
export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Auth response types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface UserResponse {
  message: string;
  user: User;
}

// API Error type
export interface ApiError {
  error: string;
  message: string;
}

// Review types
export interface SecurityIssue {
  severity: "Critical" | "High" | "Medium" | "Low";
  issue: string;
  line: number;
  description: string;
  fix: string;
  codeExample: string;
}

export interface PerformanceIssue {
  issue: string;
  line: number;
  description: string;
  suggestion: string;
  codeExample: string;
}

export interface BestPracticeIssue {
  issue: string;
  line: number;
  description: string;
  suggestion: string;
  codeExample: string;
}

export interface RefactoringOpportunity {
  opportunity: string;
  line: number;
  description: string;
  benefit: string;
  codeExample: string;
}

export interface Summary {
  securityIssues: number;
  performanceIssues: number;
  bestPracticeIssues: number;
  refactoringOpportunities: number;
}

export interface AnalysisResult {
  reviewId?: string;
  timestamp: Date;
  language: string;
  summary: Summary;
  security: SecurityIssue[];
  performance: PerformanceIssue[];
  bestPractices: BestPracticeIssue[];
  refactoring: RefactoringOpportunity[];
}

export interface Review {
  id: string;
  userId: string;
  language: string;
  fileName?: string;
  codeSnippet: string;
  analysisResult: AnalysisResult;
  createdAt: Date;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface Stats {
  totalReviews: number;
  languagesUsed: string[];
  recentActivity: Review[];
}

// API Response types for reviews
export interface AnalyzeCodeResponse {
  message: string;
  analysis: AnalysisResult;
  reviewId?: string;
  saved: boolean;
}

export interface UploadFileResponse {
  message: string;
  fileName: string;
  fileSize: number;
  language: string;
  analysis: AnalysisResult;
  reviewId?: string;
  saved: boolean;
}

export interface ReviewsResponse {
  message: string;
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReviewResponse {
  message: string;
  review: Review;
}

export interface StatsResponse {
  message: string;
  stats: Stats;
}

// Filter types
export interface ReviewFilters {
  language?: string;
  sortBy?: string;
}
