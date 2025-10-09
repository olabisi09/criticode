import { Router, Request, Response } from "express";
import { authService } from "../services/auth.service";
import {
  registerValidation,
  loginValidation,
  validateRequest,
} from "../middleware/validation.middleware";
import { authenticateToken } from "../middleware/auth.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  registerValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, fullName } = req.body;

      if (!authService) {
        res.status(500).json({
          error: "Registration failed",
          message: "Authentication service is unavailable",
        });
        return;
      }

      const user = await authService.registerUser(email, password, fullName);
      const token = authService.generateToken(user.id, user.email);

      res.status(201).json({
        message: "User registered successfully",
        user,
        token,
      });
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific auth service errors
        if (error.message.includes("already exists")) {
          res.status(409).json({
            error: "Registration failed",
            message: "A user with this email already exists",
          });
          return;
        }

        if (
          error.message.includes("required") ||
          error.message.includes("characters")
        ) {
          res.status(400).json({
            error: "Registration failed",
            message: error.message,
          });
          return;
        }
      }

      console.error("Registration error:", error);
      res.status(500).json({
        error: "Registration failed",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
router.post(
  "/login",
  loginValidation,
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    try {
      debugger;
      if (!authService) {
        res.status(500).json({
          error: "Registration failed",
          message: "Authentication service is unavailable",
        });
        return;
      }

      const { email, password } = req.body;

      const result = await authService.loginUser(email, password);

      res.json({
        message: "Login successful",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      if (error instanceof Error) {
        // Handle authentication errors
        if (
          error.message.includes("Invalid email or password") ||
          error.message.includes("required")
        ) {
          res.status(401).json({
            error: "Authentication failed",
            message: "Invalid email or password",
          });
          return;
        }
      }

      console.error("Login error:", error);
      res.status(500).json({
        error: "Authentication failed",
        message: "An internal server error occurred",
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get("/me", authenticateToken, (req: Request, res: Response): void => {
  try {
    // User is attached to request by authenticateToken middleware
    if (!req.user) {
      res.status(401).json({
        error: "Authentication required",
        message: "No user information found",
      });
      return;
    }

    res.json({
      message: "User information retrieved successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({
      error: "Failed to retrieve user information",
      message: "An internal server error occurred",
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint (token invalidation handled on client-side)
 */
router.post("/logout", (req: Request, res: Response): void => {
  try {
    // Since we're using stateless JWT tokens, logout is handled client-side
    // by removing the token from storage. This endpoint just confirms the action.
    res.json({
      message: "Logout successful",
      note: "Please remove the authentication token from your client",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Logout failed",
      message: "An internal server error occurred",
    });
  }
});

export default router;
