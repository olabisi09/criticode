import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  circle?: boolean;
}

// Base Skeleton component
export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  width,
  height,
  rounded = true,
  circle = false,
}) => {
  const styles: React.CSSProperties = {
    width: width || "100%",
    height: height || "1rem",
  };

  return (
    <div
      className={`
        animate-pulse bg-muted
        ${circle ? "rounded-full aspect-square" : rounded ? "rounded" : ""}
        ${className}
      `
        .trim()
        .replace(/\s+/g, " ")}
      style={styles}
    />
  );
};

// Text line skeleton
interface TextSkeletonProps {
  lines?: number;
  className?: string;
  lineHeight?: string;
  lastLineWidth?: string;
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 1,
  className = "",
  lineHeight = "1rem",
  lastLineWidth = "75%",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          width={index === lines - 1 && lines > 1 ? lastLineWidth : "100%"}
        />
      ))}
    </div>
  );
};

// Review Card Skeleton
export const ReviewCardSkeleton: React.FC = () => {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* File name */}
          <Skeleton height="1.25rem" width="60%" />
          {/* Language and date */}
          <div className="flex items-center space-x-4">
            <Skeleton height="0.875rem" width="80px" />
            <Skeleton height="0.875rem" width="120px" />
          </div>
        </div>
        {/* Status badge */}
        <Skeleton height="1.5rem" width="80px" rounded />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 py-4 border-t border-border">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="text-center space-y-1">
            <Skeleton height="1.5rem" width="2rem" className="mx-auto" />
            <Skeleton height="0.75rem" width="60px" className="mx-auto" />
          </div>
        ))}
      </div>

      {/* Issues preview */}
      <div className="space-y-3">
        <Skeleton height="1rem" width="40%" />
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-muted rounded"
            >
              <Skeleton circle width="1rem" height="1rem" />
              <div className="flex-1 space-y-1">
                <Skeleton height="0.875rem" width="80%" />
                <Skeleton height="0.75rem" width="60%" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Skeleton height="2rem" width="100px" />
        <div className="flex items-center space-x-2">
          <Skeleton height="2rem" width="60px" />
          <Skeleton height="2rem" width="80px" />
        </div>
      </div>
    </div>
  );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-md border border-border p-6 space-y-6">
      {/* Profile header */}
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <Skeleton circle width="4rem" height="4rem" />

        {/* User info */}
        <div className="flex-1 space-y-2">
          <Skeleton height="1.5rem" width="200px" />
          <Skeleton height="1rem" width="150px" />
          <Skeleton height="0.875rem" width="180px" />
        </div>

        {/* Edit button */}
        <Skeleton height="2rem" width="80px" />
      </div>

      {/* Profile details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <div>
            <Skeleton height="1rem" width="60px" className="mb-2" />
            <Skeleton height="2.5rem" width="100%" />
          </div>
          <div>
            <Skeleton height="1rem" width="80px" className="mb-2" />
            <Skeleton height="2.5rem" width="100%" />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div>
            <Skeleton height="1rem" width="70px" className="mb-2" />
            <Skeleton height="2.5rem" width="100%" />
          </div>
          <div>
            <Skeleton height="1rem" width="90px" className="mb-2" />
            <Skeleton height="6rem" width="100%" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-3 pt-4 border-t border-border">
        <Skeleton height="2.5rem" width="120px" />
        <Skeleton height="2.5rem" width="100px" />
      </div>
    </div>
  );
};

// Stats Skeleton
export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-card text-card-foreground rounded-lg shadow-md border border-border p-6"
        >
          {/* Icon placeholder */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton circle width="2.5rem" height="2.5rem" />
            <Skeleton height="1rem" width="60px" />
          </div>

          {/* Main stat */}
          <div className="space-y-2">
            <Skeleton height="2rem" width="80px" />
            <Skeleton height="0.875rem" width="120px" />
          </div>

          {/* Trend indicator */}
          <div className="flex items-center space-x-2 mt-4">
            <Skeleton height="1rem" width="1rem" />
            <Skeleton height="0.75rem" width="60px" />
          </div>
        </div>
      ))}
    </div>
  );
};

// List Item Skeleton
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
  className?: string;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({
  items = 3,
  showAvatar = false,
  showActions = true,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-4 p-4 bg-card border border-border rounded-lg"
        >
          {showAvatar && <Skeleton circle width="2.5rem" height="2.5rem" />}

          <div className="flex-1 space-y-2">
            <Skeleton height="1rem" width="70%" />
            <Skeleton height="0.875rem" width="50%" />
          </div>

          {showActions && (
            <div className="flex items-center space-x-2">
              <Skeleton height="2rem" width="60px" />
              <Skeleton height="2rem" width="60px" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Table Skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = "",
}) => {
  return (
    <div
      className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}
    >
      {/* Table header */}
      {showHeader && (
        <div className="border-b border-border bg-muted">
          <div
            className="grid gap-4 p-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={index} height="1rem" width="80%" />
            ))}
          </div>
        </div>
      )}

      {/* Table rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4 p-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                height="1rem"
                width={colIndex === 0 ? "90%" : "70%"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Form fields */}
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton height="1rem" width="100px" />
          <Skeleton height="2.5rem" width="100%" />
        </div>
      ))}

      {/* Textarea field */}
      <div className="space-y-2">
        <Skeleton height="1rem" width="120px" />
        <Skeleton height="6rem" width="100%" />
      </div>

      {/* Submit button */}
      <div className="flex justify-end space-x-3">
        <Skeleton height="2.5rem" width="80px" />
        <Skeleton height="2.5rem" width="120px" />
      </div>
    </div>
  );
};

// Page Layout Skeleton
export const PageSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Page header */}
      <div className="space-y-4">
        <Skeleton height="2.5rem" width="300px" />
        <Skeleton height="1.25rem" width="500px" />
      </div>

      {/* Stats section */}
      <StatsSkeleton />

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <ListSkeleton items={4} showAvatar={true} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <ProfileSkeleton />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
