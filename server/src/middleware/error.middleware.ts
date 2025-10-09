import { Request, Response, NextFunction } from 'express';

/**
 * Base custom error class
 */
export abstract class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details?: any
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Validation Error - 400 Bad Request
 * Used for input validation failures, malformed requests, etc.
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 400, true, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication Error - 401 Unauthorized
 * Used for authentication failures, invalid tokens, etc.
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', details?: any) {
    super(message, 401, true, details);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization Error - 403 Forbidden
 * Used when user is authenticated but lacks required permissions
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', details?: any) {
    super(message, 403, true, details);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not Found Error - 404 Not Found
 * Used for resources that don't exist
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 404, true, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict Error - 409 Conflict
 * Used for conflicts like duplicate resources, concurrent modifications, etc.
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict occurred', details?: any) {
    super(message, 409, true, details);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Rate Limit Error - 429 Too Many Requests
 * Used when rate limits are exceeded
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number | undefined;

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter?: number,
    details?: any
  ) {
    super(message, 429, true, details);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Internal Server Error - 500 Internal Server Error
 * Used for unexpected server errors
 */
export class InternalServerError extends AppError {
  constructor(
    message: string = 'Internal server error occurred',
    details?: any
  ) {
    super(message, 500, false, details);
    this.name = 'InternalServerError';
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

/**
 * Service Unavailable Error - 503 Service Unavailable
 * Used when external services are down or database is unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(
    message: string = 'Service temporarily unavailable',
    details?: any
  ) {
    super(message, 503, true, details);
    this.name = 'ServiceUnavailableError';
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Error response interface for consistent API responses
 */
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
  stack?: string;
}

/**
 * Central error handler middleware
 * Catches all errors and returns consistent JSON responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Don't handle response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Default error values
  let statusCode = 500;
  let errorName = 'InternalServerError';
  let message = 'Something went wrong';
  let details: any = undefined;

  // Handle our custom AppError instances
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorName = err.name;
    message = err.message;
    details = err.details;

    // Log operational errors at info level, others at error level
    if (err.isOperational) {
      console.info(`[${errorName}] ${message}`, {
        statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        details: err.details,
      });
    } else {
      console.error(`[${errorName}] ${message}`, {
        statusCode,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        stack: err.stack,
        details: err.details,
      });
    }
  }
  // Handle validation errors
  else if (err.name === 'ValidationError' && 'errors' in err) {
    statusCode = 400;
    errorName = 'ValidationError';
    message = 'Data validation failed';
    details = Object.values((err as any).errors).map((e: any) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));

    console.info(`[ValidationError] ${message}`, {
      statusCode,
      path: req.path,
      details,
    });
  }
  // Handle cast errors
  else if (err.name === 'CastError') {
    statusCode = 400;
    errorName = 'ValidationError';
    message = 'Invalid data format';
    details = {
      field: (err as any).path,
      value: (err as any).value,
      expectedType: (err as any).kind,
    };

    console.info(`[CastError] ${message}`, {
      statusCode,
      path: req.path,
      details,
    });
  }
  // Handle JWT errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorName = 'AuthenticationError';
    message = 'Invalid token';

    console.info(`[JsonWebTokenError] ${message}`, {
      statusCode,
      path: req.path,
    });
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorName = 'AuthenticationError';
    message = 'Token has expired';

    console.info(`[TokenExpiredError] ${message}`, {
      statusCode,
      path: req.path,
    });
  }
  // Handle SyntaxError (malformed JSON)
  else if (err instanceof SyntaxError && 'body' in err) {
    statusCode = 400;
    errorName = 'ValidationError';
    message = 'Invalid JSON format in request body';

    console.info(`[SyntaxError] ${message}`, { statusCode, path: req.path });
  }
  // Handle all other unexpected errors
  else {
    // Log unexpected errors with full stack trace
    console.error('[UnexpectedError] Unhandled error occurred:', {
      message: err.message,
      stack: err.stack,
      statusCode,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
    });

    // Don't expose internal error details in production
    if (process.env.NODE_ENV === 'production') {
      message = 'An unexpected error occurred';
    } else {
      message = err.message || 'An unexpected error occurred';
      details = {
        stack: err.stack,
      };
    }
  }

  // Create error response
  const errorResponse: ErrorResponse = {
    error: errorName,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Add optional fields
  if (details !== undefined) {
    errorResponse.details = details;
  }

  // Add request ID if available (useful for tracing)
  if (req.headers['x-request-id']) {
    errorResponse.requestId = req.headers['x-request-id'] as string;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Add retry-after header for rate limit errors
  if (err instanceof RateLimitError && err.retryAfter) {
    res.set('Retry-After', err.retryAfter.toString());
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for routes that don't exist.
 * Should be placed after all route definitions
 */
export const notFound = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const error = new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`, {
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'POST /api/code-review/analyze',
    ],
  });

  next(error);
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch promise rejections
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Helper function to create and throw custom errors
 */
export const createError = {
  validation: (message: string, details?: any) =>
    new ValidationError(message, details),
  authentication: (message: string, details?: any) =>
    new AuthenticationError(message, details),
  authorization: (message: string, details?: any) =>
    new AuthorizationError(message, details),
  notFound: (message: string, details?: any) =>
    new NotFoundError(message, details),
  conflict: (message: string, details?: any) =>
    new ConflictError(message, details),
  rateLimit: (message: string, retryAfter?: number, details?: any) =>
    new RateLimitError(message, retryAfter, details),
  internal: (message: string, details?: any) =>
    new InternalServerError(message, details),
  serviceUnavailable: (message: string, details?: any) =>
    new ServiceUnavailableError(message, details),
};

export default {
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,

  // Middleware
  errorHandler,
  notFound,
  asyncHandler,

  // Helpers
  createError,
};
