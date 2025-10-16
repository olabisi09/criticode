import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AnalysisResult, ReviewFilters } from '../types';
import {
  analyzeCode,
  uploadFile,
  getReviews,
  getReviewById,
  deleteReview,
  getUserStats,
} from '../services/review';

// Query keys for consistent caching
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (page: number, limit: number, filters?: ReviewFilters) =>
    [...reviewKeys.lists(), { page, limit, filters }] as const,
  details: () => [...reviewKeys.all, 'detail'] as const,
  detail: (id: string) => [...reviewKeys.details(), id] as const,
  stats: () => [...reviewKeys.all, 'stats'] as const,
};

/**
 * Mutation hook for analyzing code
 * @returns useMutation hook with loading, error, and success states
 */
export const useAnalyzeCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      code,
      language,
      fileName,
    }: {
      code: string;
      language: string;
      fileName?: string;
    }): Promise<AnalysisResult> => {
      return analyzeCode(code, language, fileName);
    },
    onSuccess: () => {
      // Invalidate and refetch reviews list and stats after successful analysis
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
    onError: (error) => {
      console.error('Code analysis failed:', error);
    },
  });
};

/**
 * Mutation hook for uploading and analyzing files
 * @returns useMutation hook with loading, error, and success states
 */
export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File): Promise<AnalysisResult> => {
      return uploadFile(file);
    },
    onSuccess: () => {
      // Invalidate and refetch reviews list and stats after successful upload
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
    onError: (error) => {
      console.error('File upload failed:', error);
    },
  });
};

/**
 * Query hook for fetching reviews list with pagination and filtering
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 * @param filters - Optional filters (language, sortBy)
 * @returns useQuery hook with loading, error, and data states
 */
export const useReviews = (page = 1, limit = 20, filters?: ReviewFilters) => {
  return useQuery({
    queryKey: reviewKeys.list(page, limit, filters),
    queryFn: () => getReviews(page, limit, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  });
};

/**
 * Query hook for fetching a single review by ID
 * @param id - Review ID
 * @returns useQuery hook with loading, error, and data states
 */
export const useReview = (id: string) => {
  return useQuery({
    queryKey: reviewKeys.detail(id),
    queryFn: () => getReviewById(id),
    enabled: !!id, // Only run query if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
  });
};

/**
 * Mutation hook for deleting a review
 * @returns useMutation hook with loading, error, and success states
 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<void> => {
      return deleteReview(id);
    },
    onSuccess: (_, deletedId) => {
      // Remove the deleted review from cache
      queryClient.removeQueries({ queryKey: reviewKeys.detail(deletedId) });

      // Invalidate and refetch reviews lists and stats
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats() });
    },
    onError: (error) => {
      console.error('Review deletion failed:', error);
    },
  });
};

/**
 * Query hook for fetching user statistics
 * @returns useQuery hook with loading, error, and data states
 */
export const useUserStats = () => {
  return useQuery({
    queryKey: reviewKeys.stats(),
    queryFn: () => getUserStats(),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnMount: true, // Always refetch when component mounts
  });
};

// Default export with all hooks
const reviewHooks = {
  useAnalyzeCode,
  useUploadFile,
  useReviews,
  useReview,
  useDeleteReview,
  useUserStats,
};

export default reviewHooks;
