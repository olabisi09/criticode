import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

// Extend Express Request type to include rateLimit property
declare module "express-serve-static-core" {
  interface Request {
    rateLimit?: {
      limit?: number;
      used?: number;
      remaining?: number;
      resetTime?: Date;
    };
    user?: { id?: string }; // for authenticated user info
    tokenPayload?: { userId?: string }; // for JWT payload
  }
}

/**
 * Rate limiter for authentication endpoints
 * 5 requests per minute per IP address
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Too many authentication attempts",
    message: "Please wait a minute before trying again",
    retryAfter: 60,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request) => {
    // Use IP address as the key
    return req.ip || req.socket.remoteAddress || "unknown";
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many authentication attempts",
      message:
        "You have exceeded the maximum number of login attempts. Please wait a minute before trying again.",
      retryAfter: Math.ceil(
        (req.rateLimit?.resetTime?.getTime() || Date.now()) / 1000 -
          Date.now() / 1000
      ),
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks or other specific paths if needed
    return req.path === "/health";
  },
});

/**
 * Rate limiter for anonymous code reviews
 * 5 requests per hour per IP address
 */
export const anonymousReviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: "Anonymous review limit exceeded",
    message:
      "You have exceeded the anonymous review limit. Please sign up for an account to get higher limits.",
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use IP address as the key for anonymous users
    return req.ip || req.socket.remoteAddress || "unknown";
  },
  handler: (req: Request, res: Response) => {
    const resetTime =
      req.rateLimit?.resetTime?.getTime() || Date.now() + 3600000;
    const retryAfter = Math.ceil(resetTime / 1000 - Date.now() / 1000);

    res.status(429).json({
      error: "Anonymous review limit exceeded",
      message:
        "You have reached the limit for anonymous code reviews. Create an account to get higher limits and save your review history.",
      retryAfter,
      suggestion: "Sign up for a free account to get 30 reviews per hour!",
    });
  },
  skip: (req: Request) => {
    // Skip if user is authenticated (they should use the authenticated limiter instead)
    return !!(req.user || req.tokenPayload);
  },
});

/**
 * Rate limiter for authenticated users' code reviews
 * 30 requests per hour per authenticated user
 */
export const authenticatedReviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each user to 30 requests per windowMs
  message: {
    error: "Review limit exceeded",
    message:
      "You have exceeded your hourly review limit. Please wait before submitting more reviews.",
    retryAfter: 3600,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use user ID as the key for authenticated users
    const userId = req.user?.id || req.tokenPayload?.userId;
    if (userId) {
      return `user:${userId}`;
    }

    // Fallback to IP if somehow user info is missing
    return req.ip || req.socket.remoteAddress || "unknown";
  },
  handler: (req: Request, res: Response) => {
    const resetTime =
      req.rateLimit?.resetTime?.getTime() || Date.now() + 3600000;
    const retryAfter = Math.ceil(resetTime / 1000 - Date.now() / 1000);

    res.status(429).json({
      error: "Review limit exceeded",
      message:
        "You have reached your hourly limit of 30 code reviews. This limit resets every hour.",
      retryAfter,
      currentUsage: req.rateLimit?.used || 0,
      limit: req.rateLimit?.limit || 30,
      resetTime: new Date(resetTime).toISOString(),
    });
  },
  skip: (req: Request) => {
    // Only apply to authenticated users
    return !(req.user || req.tokenPayload);
  },
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP for general API usage
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests",
    message:
      "You have exceeded the API rate limit. Please slow down your requests.",
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || "unknown";
  },
  handler: (req: Request, res: Response) => {
    const resetTime =
      req.rateLimit?.resetTime?.getTime() || Date.now() + 900000;
    const retryAfter = Math.ceil(resetTime / 1000 - Date.now() / 1000);

    res.status(429).json({
      error: "Rate limit exceeded",
      message:
        "You have made too many requests. Please wait before making more API calls.",
      retryAfter,
      limit: req.rateLimit?.limit || 100,
      resetTime: new Date(resetTime).toISOString(),
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === "/health";
  },
});

/**
 * Strict rate limiter for sensitive operations
 * 3 requests per minute per IP for operations like password reset
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    error: "Too many sensitive requests",
    message:
      "You have exceeded the limit for sensitive operations. Please wait before trying again.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || "unknown";
  },
  handler: (req: Request, res: Response) => {
    const resetTime = req.rateLimit?.resetTime?.getTime() || Date.now() + 60000;
    const retryAfter = Math.ceil(resetTime / 1000 - Date.now() / 1000);

    res.status(429).json({
      error: "Sensitive operation limit exceeded",
      message:
        "You have made too many sensitive requests. Please wait a minute before trying again.",
      retryAfter,
      securityNote:
        "This limit helps protect against abuse and ensures system security.",
    });
  },
});

/**
 * Custom rate limiter factory for creating dynamic rate limiters
 */
export const createCustomLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      error: "Rate limit exceeded",
      message:
        options.message ||
        "You have exceeded the rate limit for this endpoint.",
      retryAfter: Math.ceil(options.windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator:
      options.keyGenerator ||
      ((req: Request) => {
        return req.ip || req.socket.remoteAddress || "unknown";
      }),
    handler: (req: Request, res: Response) => {
      const resetTime =
        req.rateLimit?.resetTime?.getTime() || Date.now() + options.windowMs;
      const retryAfter = Math.ceil(resetTime / 1000 - Date.now() / 1000);

      res.status(429).json({
        error: "Rate limit exceeded",
        message:
          options.message ||
          "You have exceeded the rate limit for this endpoint.",
        retryAfter,
        limit: options.max,
        resetTime: new Date(resetTime).toISOString(),
      });
    },
  });
};

export default {
  authLimiter,
  anonymousReviewLimiter,
  authenticatedReviewLimiter,
  generalApiLimiter,
  strictLimiter,
  createCustomLimiter,
};
