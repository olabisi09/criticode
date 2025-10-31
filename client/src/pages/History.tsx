import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  Calendar,
  Code,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  Zap,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { PlainInput } from '../components/ui/input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/modal';
import { ReviewCardSkeleton } from '../components/ui/skeleton';

import { useReviews, useDeleteReview } from '../hooks/useReviews';
import type { Review, ReviewFilters } from '../types';

// Language icon mapping
const languageIcons = {
  javascript: '🟨',
  python: '🐍',
  typescript: '🔷',
  java: '☕',
  'c++': '⚡',
  'c#': '🔷',
  go: '🐹',
  rust: '🦀',
  php: '🐘',
  ruby: '💎',
  swift: '🍃',
  kotlin: '🎯',
};

// Sort options
const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most-issues', label: 'Most Issues' },
  { value: 'least-issues', label: 'Least Issues' },
];

// Language filter options
const languageOptions = [
  { value: '', label: 'All Languages' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'c++', label: 'C++' },
  { value: 'c#', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
];

// Review card component
const ReviewCard: React.FC<{
  review: Review;
  onDelete: (id: string) => void;
}> = ({ review, onDelete }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleViewDetails = () => {
    // Navigate to review details page
    navigate(`/history/${review.id}`);
  };

  const handleDelete = () => {
    onDelete(review.id);
    setShowDeleteModal(false);
  };

  const totalIssues =
    review.analysisResult.summary.securityIssues +
    review.analysisResult.summary.performanceIssues +
    review.analysisResult.summary.bestPracticeIssues +
    review.analysisResult.summary.refactoringOpportunities;

  const languageIcon =
    languageIcons[review.language as keyof typeof languageIcons] || '📄';

  return (
    <>
      <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-lg">{languageIcon}</span>
              <Badge variant="info" className="text-xs shrink-0">
                {review.language.charAt(0).toUpperCase() +
                  review.language.slice(1)}
              </Badge>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
              {formatDistanceToNow(new Date(review.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {/* File name */}
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-gray-400 shrink-0" />
            <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm sm:text-base">
              {review.fileName || 'Code Snippet'}
            </h3>
          </div>

          {/* Summary */}
          <div className="flex flex-wrap gap-2 text-xs">
            {review.analysisResult.summary.securityIssues > 0 && (
              <div className="flex items-center gap-1 text-red-600">
                <Shield className="h-3 w-3" />
                <span>
                  {review.analysisResult.summary.securityIssues} security
                </span>
              </div>
            )}
            {review.analysisResult.summary.performanceIssues > 0 && (
              <div className="flex items-center gap-1 text-orange-600">
                <Zap className="h-3 w-3" />
                <span>
                  {review.analysisResult.summary.performanceIssues} performance
                </span>
              </div>
            )}
            {review.analysisResult.summary.bestPracticeIssues > 0 && (
              <div className="flex items-center gap-1 text-blue-600">
                <CheckCircle className="h-3 w-3" />
                <span>
                  {review.analysisResult.summary.bestPracticeIssues} best
                  practice
                </span>
              </div>
            )}
            {review.analysisResult.summary.refactoringOpportunities > 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <RefreshCw className="h-3 w-3" />
                <span>
                  {review.analysisResult.summary.refactoringOpportunities}{' '}
                  refactoring
                </span>
              </div>
            )}
            {totalIssues === 0 && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>No issues found!</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleViewDetails}
              className="flex items-center gap-1 min-h-[40px] flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Eye className="h-3 w-3" />
              <span className="hidden xs:inline">View Details</span>
              <span className="xs:hidden">View</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="p-2 min-h-[40px] min-w-[40px] shrink-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Review"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-gray-900">
                Are you sure you want to delete this review?
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This action cannot be undone. The review and all its analysis
                data will be permanently removed.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// Empty state component
const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <div className="max-w-md mx-auto">
      <Code className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
      <p className="text-gray-500 mb-6">
        Analyze some code to get started! Upload a file or paste code directly
        to begin your first review.
      </p>
      <Button onClick={() => (window.location.href = '/')}>
        Start Analyzing
      </Button>
    </div>
  </div>
);

// Main History component
const History: React.FC = () => {
  const deleteReviewMutation = useDeleteReview();

  // State for filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Prepare filters for API
  const filters: ReviewFilters = {
    language: selectedLanguage || undefined,
    sortBy: selectedSort,
  };

  // Fetch reviews
  const { data, isLoading, error, refetch } = useReviews(
    currentPage,
    itemsPerPage,
    filters
  );

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteReviewMutation.mutateAsync(id);
      toast.success('Review deleted successfully');
      refetch();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete review';
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter reviews by search term (client-side filtering)
  const filteredReviews =
    data?.reviews.filter((review) => {
      const searchableText = `${review.fileName || ''} ${
        review.language
      }`.toLowerCase();
      return searchableText.includes(searchTerm.toLowerCase());
    }) || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Review History
        </h1>
        <p className="text-muted-foreground">
          View and manage your past code reviews and analysis results.
        </p>
      </div>

      <div className="mb-6 space-y-4 md:space-y-0 md:flex md:items-start md:gap-4">
        <div className="relative flex-1 md:max-w-sm lg:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <PlainInput
            name="search"
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 min-h-[44px]"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 md:gap-4">
          {/* Language filter */}
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full sm:w-auto min-w-[140px] px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring min-h-[44px]"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full sm:w-auto min-w-[140px] px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring min-h-[44px]"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ReviewCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load reviews
            </h3>
            <p className="text-gray-500 mb-6">
              {error instanceof Error ? error.message : 'Something went wrong'}
            </p>
            <Button
              onClick={() => refetch()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Reviews grid */}
      {!isLoading && !error && (
        <>
          {filteredReviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onDelete={handleDeleteReview}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, data.pagination.totalPages) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? 'primary' : 'secondary'
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-10 h-10"
                          >
                            {page}
                          </Button>
                        );
                      }
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === data.pagination.totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState />
          )}
        </>
      )}

      {/* Delete mutation loading overlay */}
      {deleteReviewMutation.isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Deleting review...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
