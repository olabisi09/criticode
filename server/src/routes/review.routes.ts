import { Router, Request, Response } from "express";
import multer from "multer";
import { geminiService } from "../services/gemini.service";
import { reviewService } from "../services/review.service";
import {
  codeAnalysisValidation,
  validateRequest,
} from "../middleware/validation.middleware";
import { optionalAuth, authenticateToken } from "../middleware/auth.middleware";
import {
  anonymousReviewLimiter,
  authenticatedReviewLimiter,
} from "../middleware/rateLimit.middleware";

const router = Router();

// Multer configuration for file uploads
const storage = multer.memoryStorage();

// File filter to only allow supported code file extensions
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = [
    ".js",
    ".ts",
    ".py",
    ".java",
    ".cpp",
    ".go",
    ".rb",
    ".php",
    ".jsx",
    ".tsx",
    ".c",
    ".h",
    ".cs",
    ".swift",
    ".kt",
    ".dart",
    ".rs",
    ".scala",
    ".clj",
    ".sql",
    ".html",
    ".css",
    ".json",
    ".xml",
    ".yaml",
    ".yml",
  ];
  const fileExtension = file.originalname
    .toLowerCase()
    .substring(file.originalname.lastIndexOf("."));

  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type ${fileExtension} is not supported. Allowed types: ${allowedExtensions.join(
          ", "
        )}`
      )
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: fileFilter,
});

// Helper function to detect language from file extension
const detectLanguageFromExtension = (filename: string): string => {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf("."));
  const languageMap: Record<string, string> = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".java": "java",
    ".cpp": "cpp",
    ".c": "c",
    ".h": "c",
    ".cs": "csharp",
    ".go": "go",
    ".rb": "ruby",
    ".php": "php",
    ".swift": "swift",
    ".kt": "kotlin",
    ".dart": "dart",
    ".rs": "rust",
    ".scala": "scala",
    ".clj": "clojure",
    ".sql": "sql",
    ".html": "html",
    ".css": "css",
    ".json": "json",
    ".xml": "xml",
    ".yaml": "yaml",
    ".yml": "yaml",
  };

  return languageMap[extension] || "text";
};

/**
 * POST /api/review/analyze
 * Analyze code using Gemini AI and optionally save if user is authenticated
 */
router.post(
  "/analyze",
  optionalAuth,
  anonymousReviewLimiter,
  codeAnalysisValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { code, language, fileName } = req.body;
      const userId = req.user?.id;

      // Analyze code with Gemini
      const analysisResult = await geminiService.analyzeCode(code, language);

      let reviewId: string | undefined;

      // If user is authenticated, save the review
      if (userId) {
        try {
          const review = await reviewService.createReview(
            userId,
            code,
            language,
            fileName,
            analysisResult
          );
          reviewId = review.id;
        } catch (saveError) {
          // Log the error but don't fail the analysis
          console.error("Failed to save review:", saveError);
        }
      }

      res.json({
        message: "Code analysis completed successfully",
        analysis: analysisResult,
        reviewId,
        saved: !!reviewId,
      });
    } catch (error) {
      console.error("Code analysis error:", error);

      if (error instanceof Error) {
        // Handle Gemini service errors
        if (
          error.message.includes("timeout") ||
          error.message.includes("network")
        ) {
          res.status(503).json({
            error: "Service temporarily unavailable",
            message:
              "AI service is currently unavailable. Please try again later.",
          });
          return;
        }

        if (
          error.message.includes("validation") ||
          error.message.includes("invalid")
        ) {
          res.status(400).json({
            error: "Invalid input",
            message: error.message,
          });
          return;
        }

        if (error.message.includes("rate limit")) {
          res.status(429).json({
            error: "Rate limit exceeded",
            message: "Too many requests. Please try again later.",
          });
          return;
        }
      }

      res.status(500).json({
        error: "Analysis failed",
        message: "An internal server error occurred during code analysis",
      });
    }
  }
);

/**
 * POST /api/review/upload
 * Upload and analyze a code file
 */
router.post(
  "/upload",
  optionalAuth,
  anonymousReviewLimiter,
  (req: Request, res: Response, next: Function): void => {
    // Custom multer error handler
    upload.single("file")(req, res, (err: any): void => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          res.status(413).json({
            error: "File too large",
            message: "File size must be less than 2MB",
          });
          return;
        }
        res.status(400).json({
          error: "Upload error",
          message: err.message,
        });
        return;
      } else if (err) {
        res.status(400).json({
          error: "Invalid file",
          message: err.message,
        });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response): Promise<void> => {
    try {
      const uploadedFile = req.file;
      const userId = req.user?.id;

      if (!uploadedFile) {
        res.status(400).json({
          error: "No file uploaded",
          message: "Please select a file to upload",
        });
        return;
      }

      // Extract file content as string
      const code = uploadedFile.buffer.toString("utf-8");

      if (!code || code.trim().length === 0) {
        res.status(400).json({
          error: "Empty file",
          message: "The uploaded file appears to be empty",
        });
        return;
      }

      if (code.length > 500 * 1024) {
        // 500KB limit for code content
        res.status(400).json({
          error: "File content too large",
          message: "Code content must be less than 500KB",
        });
        return;
      }

      // Detect language from file extension
      const language = detectLanguageFromExtension(uploadedFile.originalname);
      const fileName = uploadedFile.originalname;

      // Analyze code with Gemini
      const analysisResult = await geminiService.analyzeCode(code, language);

      let reviewId: string | undefined;

      // If user is authenticated, save the review
      if (userId) {
        try {
          const review = await reviewService.createReview(
            userId,
            code,
            language,
            fileName,
            analysisResult
          );
          reviewId = review.id;
        } catch (saveError) {
          // Log the error but don't fail the analysis
          console.error("Failed to save review:", saveError);
        }
      }

      res.json({
        message: "File uploaded and analyzed successfully",
        fileName,
        fileSize: uploadedFile.size,
        language,
        analysis: analysisResult,
        reviewId,
        saved: !!reviewId,
      });
    } catch (error) {
      console.error("File upload and analysis error:", error);

      if (error instanceof Error) {
        // Handle Gemini service errors
        if (
          error.message.includes("timeout") ||
          error.message.includes("network")
        ) {
          res.status(503).json({
            error: "Service temporarily unavailable",
            message:
              "AI service is currently unavailable. Please try again later.",
          });
          return;
        }

        if (
          error.message.includes("validation") ||
          error.message.includes("invalid")
        ) {
          res.status(400).json({
            error: "Invalid file content",
            message: error.message,
          });
          return;
        }

        if (error.message.includes("rate limit")) {
          res.status(429).json({
            error: "Rate limit exceeded",
            message: "Too many requests. Please try again later.",
          });
          return;
        }
      }

      res.status(500).json({
        error: "Upload and analysis failed",
        message: "An internal server error occurred during file processing",
      });
    }
  }
);

/**
 * GET /api/reviews/stats
 * Get user statistics
 */
router.get(
  "/stats",
  authenticateToken,
  authenticatedReviewLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const stats = await reviewService.getUserStats(userId!);

      res.json({
        message: "User statistics retrieved successfully",
        stats,
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({
        error: "Failed to retrieve statistics",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * GET /api/reviews/search
 * Search user's reviews
 */
router.get(
  "/search",
  authenticateToken,
  authenticatedReviewLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          error: "Invalid search query",
          message: "Search query is required",
        });
        return;
      }

      if (query.length > 100) {
        res.status(400).json({
          error: "Invalid search query",
          message: "Search query must be less than 100 characters",
        });
        return;
      }

      const result = await reviewService.searchReviews(
        userId!,
        query.trim(),
        page,
        limit
      );

      res.json({
        message: "Search completed successfully",
        query: query.trim(),
        ...result,
      });
    } catch (error) {
      console.error("Search reviews error:", error);
      res.status(500).json({
        error: "Search failed",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * GET /api/reviews/languages
 * Get user's review statistics by language
 */
router.get(
  "/languages",
  authenticateToken,
  authenticatedReviewLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const languageStats = await reviewService.getReviewsByLanguage(userId!);

      res.json({
        message: "Language statistics retrieved successfully",
        languages: languageStats,
      });
    } catch (error) {
      console.error("Get language stats error:", error);
      res.status(500).json({
        error: "Failed to retrieve language statistics",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * GET /api/reviews
 * Get user's reviews with pagination and filtering
 */
router.get(
  "/",
  authenticateToken,
  authenticatedReviewLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      // Parse query parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const language = req.query.language as string | undefined;
      const sortBy = req.query.sortBy as string | undefined;

      // Validate pagination parameters
      if (page < 1) {
        res.status(400).json({
          error: "Invalid pagination",
          message: "Page number must be greater than 0",
        });
        return;
      }

      if (limit < 1 || limit > 100) {
        res.status(400).json({
          error: "Invalid pagination",
          message: "Limit must be between 1 and 100",
        });
        return;
      }

      const result = await reviewService.getUserReviews(
        userId!,
        page,
        limit,
        language,
        sortBy
      );

      res.json({
        message: "Reviews retrieved successfully",
        ...result,
      });
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({
        error: "Failed to retrieve reviews",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * GET /api/reviews/:id
 * Get a specific review by ID with ownership check
 */
router.get(
  "/:id",
  authenticateToken,
  authenticatedReviewLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const reviewId = req.params.id;
      const userId = req.user!.id;

      if (!reviewId) {
        res.status(400).json({
          error: "Invalid request",
          message: "Review ID is required",
        });
        return;
      }

      const review = await reviewService.getReviewById(reviewId, userId!);

      res.json({
        message: "Review retrieved successfully",
        review,
      });
    } catch (error) {
      console.error("Get review error:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("not found") ||
          error.message.includes("Not found")
        ) {
          res.status(404).json({
            error: "Review not found",
            message: "The requested review could not be found",
          });
          return;
        }

        if (
          error.message.includes("permission") ||
          error.message.includes("not have access")
        ) {
          res.status(403).json({
            error: "Access denied",
            message: "You do not have permission to access this review",
          });
          return;
        }
      }

      res.status(500).json({
        error: "Failed to retrieve review",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * DELETE /api/reviews/:id
 * Delete a specific review with ownership check
 */
router.delete(
  "/:id",
  authenticateToken,
  authenticatedReviewLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const reviewId = req.params.id;
      const userId = req.user!.id;

      if (!reviewId) {
        res.status(400).json({
          error: "Invalid request",
          message: "Review ID is required",
        });
        return;
      }

      await reviewService.deleteReview(reviewId, userId!);

      res.json({
        message: "Review deleted successfully",
      });
    } catch (error) {
      console.error("Delete review error:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("not found") ||
          error.message.includes("Not found")
        ) {
          res.status(404).json({
            error: "Review not found",
            message: "The requested review could not be found",
          });
          return;
        }

        if (
          error.message.includes("permission") ||
          error.message.includes("not have access")
        ) {
          res.status(403).json({
            error: "Access denied",
            message: "You do not have permission to delete this review",
          });
          return;
        }
      }

      res.status(500).json({
        error: "Failed to delete review",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * GET /api/reviews/stats
 * Get user statistics
 */
router.get(
  "/stats",
  authenticateToken,
  authenticatedReviewLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const stats = await reviewService.getUserStats(userId!);

      res.json({
        message: "User statistics retrieved successfully",
        stats,
      });
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({
        error: "Failed to retrieve statistics",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * GET /api/reviews/search
 * Search user's reviews
 */
router.get(
  "/search",
  authenticateToken,
  authenticatedReviewLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || query.trim().length === 0) {
        res.status(400).json({
          error: "Invalid search query",
          message: "Search query is required",
        });
        return;
      }

      if (query.length > 100) {
        res.status(400).json({
          error: "Invalid search query",
          message: "Search query must be less than 100 characters",
        });
        return;
      }

      const result = await reviewService.searchReviews(
        userId!,
        query.trim(),
        page,
        limit
      );

      res.json({
        message: "Search completed successfully",
        query: query.trim(),
        ...result,
      });
    } catch (error) {
      console.error("Search reviews error:", error);
      res.status(500).json({
        error: "Search failed",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * GET /api/reviews/languages
 * Get user's review statistics by language
 */
router.get(
  "/languages",
  authenticateToken,
  authenticatedReviewLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;

      const languageStats = await reviewService.getReviewsByLanguage(userId!);

      res.json({
        message: "Language statistics retrieved successfully",
        languages: languageStats,
      });
    } catch (error) {
      console.error("Get language stats error:", error);
      res.status(500).json({
        error: "Failed to retrieve language statistics",
        message: "An internal server error occurred",
      });
    }
  }
);

export default router;
