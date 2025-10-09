export interface ReviewAnalysis {
  security: SecurityIssue[];
  performance: PerformanceIssue[];
  bestPractices: BestPracticeIssue[];
  refactoring: RefactoringOpportunity[];
}

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

export interface Review {
  id: string;
  userId: string;
  code: string;
  language: string;
  fileName?: string;
  analysis: ReviewAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  userId: string;
  code: string;
  language: string;
  fileName?: string;
  analysis: ReviewAnalysis;
}

export interface ReviewsListResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  totalReviews: number;
  languagesUsed: string[];
  recentActivity: Review[];
}
