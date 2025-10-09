import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';
import type {
  Review,
  ReviewsListResponse,
  UserStats,
  ReviewAnalysis,
} from '../models/review.model';
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
  ServiceUnavailableError,
  InternalServerError,
} from '../middleware/error.middleware';

class ReviewService {
  private supabase: SupabaseClient;

  constructor() {
    if (
      !config.database.supabase.url ||
      !config.database.supabase.serviceRoleKey
    ) {
      throw new ServiceUnavailableError('Supabase configuration is missing');
    }

    // Use service role key for server-side operations
    this.supabase = createClient(
      config.database.supabase.url,
      config.database.supabase.serviceRoleKey
    );
  }

  /**
   * Create a new code review
   */
  async createReview(
    userId: string,
    code: string,
    language: string,
    fileName: string | undefined,
    analysisResult: ReviewAnalysis
  ): Promise<Review> {
    try {
      // Validate input
      if (!userId || !code || !language || !analysisResult) {
        throw new ValidationError(
          'Missing required fields for review creation'
        );
      }

      if (code.length > 500 * 1024) {
        // 500KB limit
        throw new ValidationError('Code size exceeds 500KB limit');
      }

      // Prepare review data
      const reviewData = {
        user_id: userId,
        code,
        language: language.toLowerCase(),
        file_name: fileName || null,
        analysis: analysisResult,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert into Supabase
      const { data, error } = await this.supabase
        .from('reviews')
        .insert([reviewData])
        .select('*')
        .single();

      if (error) {
        console.error('Supabase error creating review:', error);
        throw new InternalServerError('Failed to create review in database', {
          supabaseError: error.message,
        });
      }

      // Transform to our Review interface
      return this.transformSupabaseReview(data);
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      console.error('Unexpected error creating review:', error);
      throw new InternalServerError('Failed to create review');
    }
  }

  /**
   * Get a review by ID with ownership check
   */
  async getReviewById(reviewId: string, userId: string): Promise<Review> {
    try {
      if (!reviewId || !userId) {
        throw new ValidationError('Review ID and User ID are required');
      }

      const { data, error } = await this.supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          throw new NotFoundError('Review not found');
        }

        console.error('Supabase error fetching review:', error);
        throw new InternalServerError('Failed to fetch review from database');
      }

      // Check ownership
      if (data.user_id !== userId) {
        throw new AuthorizationError(
          'You do not have permission to access this review'
        );
      }

      return this.transformSupabaseReview(data);
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof AuthorizationError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      console.error('Unexpected error fetching review:', error);
      throw new InternalServerError('Failed to fetch review');
    }
  }

  /**
   * Get user's reviews with pagination and filters
   */
  async getUserReviews(
    userId: string,
    page: number = 1,
    limit: number = 20,
    language?: string,
    sortBy: string = 'created_at'
  ): Promise<ReviewsListResponse> {
    try {
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      // Validate pagination
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 20;

      // Validate sort field
      const allowedSortFields = [
        'created_at',
        'updated_at',
        'language',
        'file_name',
      ];
      if (!allowedSortFields.includes(sortBy)) {
        sortBy = 'created_at';
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Build query
      let query = this.supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Add language filter if specified
      if (language) {
        query = query.eq('language', language.toLowerCase());
      }

      // Add sorting and pagination
      query = query
        .order(sortBy, { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Supabase error fetching user reviews:', error);
        throw new InternalServerError('Failed to fetch reviews from database');
      }

      // Transform reviews
      const reviews = (data || []).map((review) =>
        this.transformSupabaseReview(review)
      );

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        reviews,
        total: count || 0,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      console.error('Unexpected error fetching user reviews:', error);
      throw new InternalServerError('Failed to fetch user reviews');
    }
  }

  /**
   * Delete a review with ownership check
   */
  async deleteReview(reviewId: string, userId: string): Promise<void> {
    try {
      if (!reviewId || !userId) {
        throw new ValidationError('Review ID and User ID are required');
      }

      // First, check if review exists and belongs to user
      const { data: existingReview, error: fetchError } = await this.supabase
        .from('reviews')
        .select('id, user_id')
        .eq('id', reviewId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No rows found
          throw new NotFoundError('Review not found');
        }

        console.error('Supabase error checking review ownership:', fetchError);
        throw new InternalServerError('Failed to verify review ownership');
      }

      // Check ownership
      if (existingReview.user_id !== userId) {
        throw new AuthorizationError(
          'You do not have permission to delete this review'
        );
      }

      // Delete the review
      const { error: deleteError } = await this.supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId); // Double-check ownership in delete query

      if (deleteError) {
        console.error('Supabase error deleting review:', deleteError);
        throw new InternalServerError('Failed to delete review from database');
      }
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof NotFoundError ||
        error instanceof AuthorizationError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      console.error('Unexpected error deleting review:', error);
      throw new InternalServerError('Failed to delete review');
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      // Get all user reviews
      const { data, error } = await this.supabase
        .from('reviews')
        .select('language, created_at, id, file_name, analysis')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching user stats:', error);
        throw new InternalServerError('Failed to fetch user statistics');
      }

      const reviews = data || [];

      // Calculate statistics
      const totalReviews = reviews.length;

      // Get unique languages used
      const languagesUsed = [
        ...new Set(reviews.map((review) => review.language)),
      ];

      // Get recent activity (last 10 reviews)
      const recentActivity = reviews
        .slice(0, 10)
        .map((review) => this.transformSupabaseReview(review));

      return {
        totalReviews,
        languagesUsed,
        recentActivity,
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      console.error('Unexpected error fetching user stats:', error);
      throw new InternalServerError('Failed to fetch user statistics');
    }
  }

  /**
   * Get reviews by language (for analytics)
   */
  async getReviewsByLanguage(userId: string): Promise<Record<string, number>> {
    try {
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const { data, error } = await this.supabase
        .from('reviews')
        .select('language')
        .eq('user_id', userId);

      if (error) {
        console.error('Supabase error fetching language stats:', error);
        throw new InternalServerError('Failed to fetch language statistics');
      }

      // Count reviews by language
      const languageStats: Record<string, number> = {};
      (data || []).forEach((review) => {
        languageStats[review.language] =
          (languageStats[review.language] || 0) + 1;
      });

      return languageStats;
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      console.error('Unexpected error fetching language stats:', error);
      throw new InternalServerError('Failed to fetch language statistics');
    }
  }

  /**
   * Search reviews by content
   */
  async searchReviews(
    userId: string,
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ReviewsListResponse> {
    try {
      if (!userId || !query) {
        throw new ValidationError('User ID and search query are required');
      }

      // Validate pagination
      if (page < 1) page = 1;
      if (limit < 1 || limit > 100) limit = 20;

      const offset = (page - 1) * limit;

      // Search in file names and code content
      const { data, error, count } = await this.supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .or(`file_name.ilike.%${query}%,code.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Supabase error searching reviews:', error);
        throw new InternalServerError('Failed to search reviews');
      }

      const reviews = (data || []).map((review) =>
        this.transformSupabaseReview(review)
      );
      const totalPages = Math.ceil((count || 0) / limit);

      return {
        reviews,
        total: count || 0,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof InternalServerError
      ) {
        throw error;
      }

      console.error('Unexpected error searching reviews:', error);
      throw new InternalServerError('Failed to search reviews');
    }
  }

  /**
   * Transform Supabase review data to our Review interface
   */
  private transformSupabaseReview(data: any): Review {
    return {
      id: data.id,
      userId: data.user_id,
      code: data.code,
      language: data.language,
      fileName: data.file_name || undefined,
      analysis: data.analysis,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

export const reviewService = new ReviewService();
export default reviewService;
