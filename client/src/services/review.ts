import api from "./api";
import type {
  AnalysisResult,
  Review,
  Stats,
  ReviewFilters,
  AnalyzeCodeResponse,
  UploadFileResponse,
  ReviewsResponse,
  ReviewResponse,
  StatsResponse,
} from "../types";

/**
 * Analyze code using AI
 * @param code - The code to analyze
 * @param language - Programming language
 * @param fileName - Optional file name
 * @returns Promise with analysis result
 */
export const analyzeCode = async (
  code: string,
  language: string,
  fileName?: string
): Promise<AnalysisResult> => {
  const payload: { code: string; language: string; fileName?: string } = {
    code,
    language,
  };

  if (fileName) {
    payload.fileName = fileName;
  }

  const response: AnalyzeCodeResponse = await api.post(
    "/review/analyze",
    payload
  );
  return response.analysis;
};

/**
 * Upload and analyze a file
 * @param file - File to upload and analyze
 * @returns Promise with analysis result
 */
export const uploadFile = async (file: File): Promise<AnalysisResult> => {
  // Create FormData for file upload
  const formData = new FormData();
  formData.append("file", file);

  const response: UploadFileResponse = await api.post(
    "/review/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.analysis;
};

/**
 * Get user's reviews with pagination and filtering
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @param filters - Optional filters (language, sortBy)
 * @returns Promise with reviews and pagination info
 */
export const getReviews = async (
  page: number = 1,
  limit: number = 20,
  filters?: ReviewFilters
): Promise<{
  reviews: Review[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> => {
  // Build query parameters
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (filters?.language) {
    params.append("language", filters.language);
  }

  if (filters?.sortBy) {
    params.append("sortBy", filters.sortBy);
  }

  const response: ReviewsResponse = await api.get(
    `/reviews?${params.toString()}`
  );

  return {
    reviews: response.reviews,
    pagination: {
      total: response.total,
      page: response.page,
      limit: response.limit,
      totalPages: response.totalPages,
    },
  };
};

/**
 * Get a specific review by ID
 * @param id - Review ID
 * @returns Promise with review data
 */
export const getReviewById = async (id: string): Promise<Review> => {
  const response: ReviewResponse = await api.get(`/reviews/${id}`);
  return response.review;
};

/**
 * Delete a review
 * @param id - Review ID to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteReview = async (id: string): Promise<void> => {
  await api.delete(`/reviews/${id}`);
};

/**
 * Get user statistics
 * @returns Promise with user stats
 */
export const getUserStats = async (): Promise<Stats> => {
  const response: StatsResponse = await api.get("/reviews/stats");
  return response.stats;
};

// Default export with all functions
const reviewService = {
  analyzeCode,
  uploadFile,
  getReviews,
  getReviewById,
  deleteReview,
  getUserStats,
};

export default reviewService;
