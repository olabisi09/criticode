import { Request, Response, NextFunction } from "express";
import authService from "../services/auth.service";
import { AuthTokenPayload, UserWithoutPassword } from "../models/user.model";

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: UserWithoutPassword;
      tokenPayload?: AuthTokenPayload;
    }
  }
}

/**
 * Extract JWT token from Authorization header
 * Supports: "Bearer <token>" format
 */
function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Check if it follows "Bearer <token>" format
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1] || null;
}

/**
 * Authentication middleware that requires a valid JWT token
 * Returns 401 if token is missing or invalid
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req);

    if (!token) {
      res.status(401).json({
        error: "Authentication required",
        message: "No token provided in Authorization header",
      });
      return;
    }

    // Verify the token
    let tokenPayload: AuthTokenPayload;
    try {
      if (!authService) {
        throw new Error("Authentication service not available");
      }
      tokenPayload = authService.verifyToken(token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid token";
      res.status(401).json({
        error: "Authentication failed",
        message,
      });
      return;
    }

    // Get user information (optional - depends on if you want to attach full user data)
    try {
      const user = await authService.getUserById(tokenPayload.userId);

      if (!user) {
        res.status(401).json({
          error: "Authentication failed",
          message: "User not found",
        });
        return;
      }

      // Attach user info to request
      req.user = user;
      req.tokenPayload = tokenPayload;

      next();
    } catch (dbError) {
      // If database operations aren't implemented yet, just use token payload
      req.tokenPayload = tokenPayload;
      next();
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Authentication processing failed",
    });
  }
};

/**
 * Optional authentication middleware that doesn't fail if no token is provided
 * Attaches user info to req.user if valid token is present
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req);

    // If no token, continue without authentication
    if (!token) {
      next();
      return;
    }

    // Verify the token
    let tokenPayload: AuthTokenPayload;
    try {
      if (!authService) {
        throw new Error("Authentication service not available");
      }
      tokenPayload = authService.verifyToken(token);
    } catch (error) {
      // Invalid token - continue without authentication (don't fail)
      next();
      return;
    }

    // Get user information (optional)
    try {
      const user = await authService.getUserById(tokenPayload.userId);

      if (user) {
        req.user = user;
        req.tokenPayload = tokenPayload;
      }
    } catch (dbError) {
      // If database operations aren't implemented yet, just use token payload
      req.tokenPayload = tokenPayload;
    }

    next();
  } catch (error) {
    console.error("Optional authentication middleware error:", error);
    // Don't fail the request, just log the error and continue
    next();
  }
};

/**
 * Middleware to check if user is authenticated (use after authenticateToken or optionalAuth)
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user && !req.tokenPayload) {
    res.status(401).json({
      error: "Authentication required",
      message: "You must be logged in to access this resource",
    });
    return;
  }

  next();
};

export default {
  authenticateToken,
  optionalAuth,
  requireAuth,
};
