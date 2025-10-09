import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import { CodeAnalysisResult } from '@criticode/shared';

/**
 * Gemini API error types
 */
export class GeminiServiceError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

export class GeminiTimeoutError extends GeminiServiceError {
  constructor() {
    super('Gemini API request timed out after 15 seconds');
    this.name = 'GeminiTimeoutError';
  }
}

export class GeminiParseError extends GeminiServiceError {
  constructor(responseText: string) {
    super(
      `Failed to parse Gemini response as valid JSON. Response: ${responseText.substring(
        0,
        200
      )}...`
    );
    this.name = 'GeminiParseError';
  }
}

export class GeminiConfigError extends GeminiServiceError {
  constructor() {
    super(
      'Gemini API key is not configured. Please set GEMINI_API_KEY environment variable.'
    );
    this.name = 'GeminiConfigError';
  }
}

class GeminiService {
  private client: GoogleGenerativeAI | null = null;
  private readonly timeout = 15000; // 15 seconds
  private readonly maxRetries = 2;

  constructor() {
    this.initializeClient();
  }

  /**
   * Initialize the Gemini client
   */
  private initializeClient(): void {
    const apiKey = config.ai.geminiApiKey;

    if (!apiKey) {
      console.warn(
        'Gemini API key not configured. Service will be unavailable.'
      );
      return;
    }

    try {
      this.client = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error('Failed to initialize Gemini client:', error);
      throw new GeminiConfigError();
    }
  }

  /**
   * Check if the service is properly configured
   */
  public isConfigured(): boolean {
    return this.client !== null;
  }

  /**
   * Create a comprehensive code analysis prompt
   */
  private createAnalysisPrompt(code: string, language: string): string {
    return `You are an expert code reviewer and security analyst. Please analyze the following ${language} code and provide a comprehensive review.

**Code to analyze:**
\`\`\`${language}
${code}
\`\`\`

**Analysis Requirements:**

1. **Security Analysis**: Look for security vulnerabilities, potential exploits, input validation issues, authentication/authorization flaws, data exposure risks, injection vulnerabilities, cryptographic issues, etc.

2. **Performance Analysis**: Identify performance bottlenecks, inefficient algorithms, memory leaks, unnecessary computations, database query issues, blocking operations, etc.

3. **Best Practices**: Check for code style issues, maintainability problems, readability concerns, proper error handling, logging practices, documentation, naming conventions, etc.

4. **Refactoring Opportunities**: Suggest code improvements, design pattern applications, code deduplication, architectural enhancements, modularity improvements, etc.

**Output Format Requirements:**
- Provide your analysis in EXACTLY this JSON format
- Line numbers should be 1-based (first line is line 1)
- If no issues are found in a category, return an empty array
- Ensure all JSON is properly formatted and valid
- Do not wrap the JSON in markdown code blocks

**Required JSON Structure:**
{
  "security": [
    {
      "severity": "Critical|High|Medium|Low",
      "issue": "Brief description of the security issue",
      "line": 0,
      "description": "Detailed explanation of the security vulnerability",
      "fix": "Specific steps to fix this issue",
      "codeExample": "Example of secure code implementation"
    }
  ],
  "performance": [
    {
      "issue": "Brief description of the performance issue",
      "line": 0,
      "description": "Detailed explanation of the performance problem",
      "suggestion": "Specific performance improvement suggestion",
      "codeExample": "Example of optimized code"
    }
  ],
  "bestPractices": [
    {
      "issue": "Brief description of the best practice violation",
      "line": 0,
      "description": "Detailed explanation of why this is important",
      "suggestion": "Specific recommendation to follow best practices",
      "codeExample": "Example of improved code following best practices"
    }
  ],
  "refactoring": [
    {
      "opportunity": "Brief description of refactoring opportunity",
      "line": 0,
      "description": "Detailed explanation of the improvement opportunity",
      "benefit": "Expected benefits of this refactoring",
      "codeExample": "Example of refactored code"
    }
  ]
}

**Important Notes:**
- Focus on actionable, specific feedback
- Provide line numbers where issues occur
- Include practical code examples in your suggestions
- Prioritize security issues by severity level
- Be thorough but concise in your descriptions`;
  }

  /**
   * Parse JSON response, handling cases where AI returns markdown-wrapped JSON
   */
  private parseResponse(responseText: string): CodeAnalysisResult {
    try {
      // Clean the response text
      let cleanedResponse = responseText.trim();

      // Remove markdown code block if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse
          .replace(/^```json\s*/, '')
          .replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse
          .replace(/^```\s*/, '')
          .replace(/\s*```$/, '');
      }

      // Parse the JSON
      const parsed = JSON.parse(cleanedResponse);

      // Validate the structure
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Response is not a valid object');
      }

      // Ensure all required fields exist and are arrays
      const result: CodeAnalysisResult = {
        security: Array.isArray(parsed.security) ? parsed.security : [],
        performance: Array.isArray(parsed.performance)
          ? parsed.performance
          : [],
        bestPractices: Array.isArray(parsed.bestPractices)
          ? parsed.bestPractices
          : [],
        refactoring: Array.isArray(parsed.refactoring)
          ? parsed.refactoring
          : [],
      };

      // Validate individual items
      this.validateAnalysisResult(result);

      return result;
    } catch (error) {
      throw new GeminiParseError(responseText);
    }
  }

  /**
   * Validate the structure of the analysis result
   */
  private validateAnalysisResult(result: CodeAnalysisResult): void {
    // Validate security issues
    result.security.forEach((issue, index) => {
      if (
        !issue.severity ||
        !['Critical', 'High', 'Medium', 'Low'].includes(issue.severity)
      ) {
        console.warn(
          `Invalid security severity at index ${index}, defaulting to Medium`
        );
        issue.severity = 'Medium';
      }
      if (typeof issue.line !== 'number') {
        issue.line = 0;
      }
    });

    // Validate other arrays have required properties
    [
      ...result.performance,
      ...result.bestPractices,
      ...result.refactoring,
    ].forEach((issue) => {
      if (typeof issue.line !== 'number') {
        issue.line = 0;
      }
    });
  }

  /**
   * Implement exponential backoff delay
   */
  private async delay(attempt: number): Promise<void> {
    const baseDelay = 1000; // 1 second
    const delay = baseDelay * Math.pow(2, attempt - 1);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Make API request with timeout
   */
  private async makeApiRequest(prompt: string): Promise<string> {
    if (!this.client) {
      throw new GeminiConfigError();
    }

    const model = this.client.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
    });

    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new GeminiTimeoutError());
      }, this.timeout);

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        clearTimeout(timeoutId);
        resolve(text);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Analyze code using Gemini API with retry logic
   */
  public async analyzeCode(
    code: string,
    language: string
  ): Promise<CodeAnalysisResult> {
    if (!this.client) {
      throw new GeminiConfigError();
    }

    // Input validation
    if (!code || typeof code !== 'string') {
      throw new GeminiServiceError(
        'Code parameter is required and must be a non-empty string'
      );
    }

    if (!language || typeof language !== 'string') {
      throw new GeminiServiceError(
        'Language parameter is required and must be a non-empty string'
      );
    }

    // Check code length (reasonable limit to avoid API errors)
    if (code.length > 100000) {
      // 100KB limit
      throw new GeminiServiceError('Code is too large. Maximum size is 100KB.');
    }

    const prompt = this.createAnalysisPrompt(code, language);
    let lastError: Error | null = null;

    // Retry logic with exponential backoff
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(
          `Analyzing code with Gemini (attempt ${attempt}/${this.maxRetries})`
        );

        const responseText = await this.makeApiRequest(prompt);
        const result = this.parseResponse(responseText);

        console.log('Code analysis completed successfully');
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on configuration or parse errors
        if (
          error instanceof GeminiConfigError ||
          error instanceof GeminiParseError
        ) {
          throw error;
        }

        // Log the error
        console.warn(`Gemini API attempt ${attempt} failed:`, error);

        // If this was the last attempt, throw the error
        if (attempt === this.maxRetries) {
          break;
        }

        // Wait before retrying
        await this.delay(attempt);
      }
    }

    // If we get here, all retries failed
    throw new GeminiServiceError(
      `Failed to analyze code after ${this.maxRetries} attempts: ${lastError?.message}`,
      lastError || undefined
    );
  }

  /**
   * Get service health status
   */
  public getHealthStatus(): { status: string; configured: boolean } {
    return {
      status: this.isConfigured() ? 'healthy' : 'not_configured',
      configured: this.isConfigured(),
    };
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
export default geminiService;
