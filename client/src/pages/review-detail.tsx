import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Trash2,
  AlertCircle,
  Loader2,
  Shield,
  Zap,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

import { CodeEditor } from '../components/code-editor/code-editor';
import { AnalysisResults } from '../components/review-results/analysis-results';

import { useReview, useDeleteReview } from '../hooks/useReviews';

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

// Loading component
const LoadingState: React.FC = () => (
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    <div className="animate-pulse">
      {/* Back button skeleton */}
      <div className="mb-6">
        <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Header skeleton */}
      <div className="mb-8">
        <div className="w-64 h-8 bg-gray-200 rounded mb-4"></div>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="w-32 h-6 bg-gray-200 rounded"></div>
          <div className="w-24 h-6 bg-gray-200 rounded"></div>
          <div className="w-40 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="w-full h-64 bg-gray-200 rounded"></div>
      </div>

      {/* Summary skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="w-full h-32 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  </div>
);

// Error component
const ErrorState: React.FC<{
  message: string;
  onRetry: () => void;
  onGoBack: () => void;
}> = ({ message, onRetry, onGoBack }) => (
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {message.includes('404') || message.includes('not found')
            ? 'Review not found'
            : 'Failed to load review'}
        </h3>
        <p className="text-gray-500 mb-6">
          {message.includes('404') || message.includes('not found')
            ? "The review you're looking for doesn't exist or may have been deleted."
            : message}
        </p>
        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={onGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
          {!message.includes('404') && !message.includes('not found') && (
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Main ReviewDetail component
const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: review, isLoading, error, refetch } = useReview(id!);
  const deleteReviewMutation = useDeleteReview();

  // Redirect to history if no ID provided
  useEffect(() => {
    if (!id) {
      navigate('/history');
    }
  }, [id, navigate]);

  const handleGoBack = () => {
    navigate('/history');
  };

  const handleDelete = async () => {
    if (!review) return;

    try {
      await deleteReviewMutation.mutateAsync(review.id);
      toast.success('Review deleted successfully');
      navigate('/history');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete review';
      toast.error(errorMessage);
      setShowDeleteModal(false);
    }
  };

  // Don't render if no ID
  if (!id) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Something went wrong';
    return (
      <ErrorState
        message={errorMessage}
        onRetry={() => refetch()}
        onGoBack={handleGoBack}
      />
    );
  }

  // Review not found
  if (!review) {
    return (
      <ErrorState
        message="Review not found"
        onRetry={() => refetch()}
        onGoBack={handleGoBack}
      />
    );
  }

  const languageIcon =
    languageIcons[review.language as keyof typeof languageIcons] || '📄';
  const totalIssues =
    review.analysisResult.summary.securityIssues +
    review.analysisResult.summary.performanceIssues +
    review.analysisResult.summary.bestPracticeIssues +
    review.analysisResult.summary.refactoringOpportunities;

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="secondary"
            onClick={handleGoBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to History
          </Button>
        </div>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Review Details
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {format(new Date(review.createdAt), "PPP 'at' p")}
                  </span>
                  <span className="text-gray-400">
                    (
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                    )
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-lg">{languageIcon}</span>
                  <Badge variant="info">
                    {review.language.charAt(0).toUpperCase() +
                      review.language.slice(1)}
                  </Badge>
                </div>

                {review.fileName && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">{review.fileName}</span>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Shield className="h-4 w-4 text-red-600" />
                    <span className="text-2xl font-bold text-red-600">
                      {review.analysisResult.summary.securityIssues}
                    </span>
                  </div>
                  <div className="text-xs text-red-600 font-medium">
                    Security Issues
                  </div>
                </div>

                <div className="bg-orange-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">
                      {review.analysisResult.summary.performanceIssues}
                    </span>
                  </div>
                  <div className="text-xs text-orange-600 font-medium">
                    Performance Issues
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {review.analysisResult.summary.bestPracticeIssues}
                    </span>
                  </div>
                  <div className="text-xs text-blue-600 font-medium">
                    Best Practices
                  </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <RefreshCw className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {review.analysisResult.summary.refactoringOpportunities}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 font-medium">
                    Refactoring
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Original Code Section */}
        <div className="mb-8">
          <Card title="Original Code" className="overflow-hidden">
            <div className="max-h-96 overflow-hidden">
              <CodeEditor
                code={review.codeSnippet}
                language={review.language}
                onChange={() => {}} // Read-only
                readOnly={true}
              />
            </div>
          </Card>
        </div>

        {/* Analysis Results */}
        <div className="mb-8">
          <AnalysisResults analysisResult={review.analysisResult} />
        </div>

        {/* Actions Section */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">Review ID: {review.id}</div>

          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Review
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Review"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-gray-900 mb-2">
                Are you sure you want to delete this review?
              </p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>File:</strong> {review.fileName || 'Code Snippet'}
                </p>
                <p>
                  <strong>Language:</strong> {review.language}
                </p>
                <p>
                  <strong>Date:</strong>{' '}
                  {format(new Date(review.createdAt), 'PPP')}
                </p>
                <p>
                  <strong>Total Issues:</strong> {totalIssues}
                </p>
              </div>
              <p className="text-sm text-red-600 mt-3 font-medium">
                This action cannot be undone. All analysis data will be
                permanently removed.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteReviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleteReviewMutation.isPending}
              disabled={deleteReviewMutation.isPending}
            >
              Delete Review
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Loading Overlay */}
      {deleteReviewMutation.isPending && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Deleting review...</span>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewDetail;
