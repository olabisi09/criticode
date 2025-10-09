export interface User {
  id: string;
  email: string;
  fullName: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
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

/**
 * Structure for security issues found in code
 */
export interface SecurityIssue {
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  issue: string;
  line: number;
  description: string;
  fix: string;
  codeExample: string;
}

/**
 * Structure for performance issues found in code
 */
export interface PerformanceIssue {
  issue: string;
  line: number;
  description: string;
  suggestion: string;
  codeExample: string;
}

/**
 * Structure for best practice suggestions
 */
export interface BestPracticeIssue {
  issue: string;
  line: number;
  description: string;
  suggestion: string;
  codeExample: string;
}

/**
 * Structure for refactoring opportunities
 */
export interface RefactoringOpportunity {
  opportunity: string;
  line: number;
  description: string;
  benefit: string;
  codeExample: string;
}

/**
 * Complete code analysis result structure
 */
export interface CodeAnalysisResult {
  security: SecurityIssue[];
  performance: PerformanceIssue[];
  bestPractices: BestPracticeIssue[];
  refactoring: RefactoringOpportunity[];
}
