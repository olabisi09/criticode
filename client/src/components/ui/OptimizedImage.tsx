import React, { useState, useCallback } from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  placeholder?: string;
  webpSrc?: string; // WebP version for browsers that support it
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(
  ({
    src,
    alt,
    width,
    height,
    className = "",
    loading = "lazy",
    placeholder,
    webpSrc,
  }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleLoad = useCallback(() => {
      setImageLoaded(true);
    }, []);

    const handleError = useCallback(() => {
      setImageError(true);
      setImageLoaded(true);
    }, []);

    // Check if browser supports WebP
    const supportsWebP = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      return canvas.toDataURL("image/webp").startsWith("data:image/webp");
    };

    const imageSrc = webpSrc && supportsWebP() ? webpSrc : src;

    return (
      <div className={`relative overflow-hidden ${className}`}>
        {/* Placeholder while loading */}
        {!imageLoaded && placeholder && (
          <div
            className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse flex items-center justify-center"
            style={{ width, height }}
          >
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        )}

        {/* Main image */}
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          className={`
          transition-opacity duration-300
          ${imageLoaded ? "opacity-100" : "opacity-0"}
          ${imageError ? "hidden" : ""}
          ${className}
        `}
          // Add responsive attributes
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Error fallback */}
        {imageError && (
          <div
            className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500"
            style={{ width: width || "100%", height: height || "auto" }}
          >
            <span className="text-sm">Failed to load image</span>
          </div>
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export default OptimizedImage;
