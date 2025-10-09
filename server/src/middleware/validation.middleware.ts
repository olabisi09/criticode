import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle validation results
 * Returns 400 with validation errors if validation fails
 */
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }));

    res.status(400).json({
      error: 'Validation failed',
      message: 'Please check your input and try again',
      details: formattedErrors
    });
    return;
  }
  
  next();
};

/**
 * Validation chain for user registration
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .isLength({ max: 128 })
    .withMessage('Password must not exceed 128 characters'),

  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes')
];

/**
 * Validation chain for user login
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ max: 128 })
    .withMessage('Password must not exceed 128 characters')
];

/**
 * Validation chain for code analysis
 */
export const codeAnalysisValidation = [
  body('code')
    .isString()
    .withMessage('Code must be a string')
    .notEmpty()
    .withMessage('Code is required')
    .custom((value: string) => {
      // Check if code size exceeds 500KB (500 * 1024 bytes)
      const sizeInBytes = Buffer.byteLength(value, 'utf8');
      const maxSizeInBytes = 500 * 1024; // 500KB
      
      if (sizeInBytes > maxSizeInBytes) {
        throw new Error(`Code size cannot exceed 500KB. Current size: ${Math.round(sizeInBytes / 1024)}KB`);
      }
      
      return true;
    }),

  body('language')
    .isString()
    .withMessage('Language must be a string')
    .notEmpty()
    .withMessage('Programming language is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Language must be between 1 and 50 characters')
    .matches(/^[a-zA-Z0-9+#-]+$/)
    .withMessage('Language can only contain letters, numbers, +, #, and - characters'),

  body('fileName')
    .optional()
    .isString()
    .withMessage('File name must be a string')
    .trim()
    .isLength({ max: 255 })
    .withMessage('File name must not exceed 255 characters')
    .custom((value: string) => {
      if (value) {
        // Basic file name validation (no path traversal, dangerous characters)
        const invalidChars = /[<>:"|?*\x00-\x1f]/;
        if (invalidChars.test(value)) {
          throw new Error('File name contains invalid characters');
        }
        
        // Check for path traversal attempts
        if (value.includes('..') || value.includes('/') || value.includes('\\')) {
          throw new Error('File name cannot contain path separators or relative path indicators');
        }
      }
      
      return true;
    })
];

/**
 * Additional validation chains for common use cases
 */

/**
 * Validation for updating user profile
 */
export const updateProfileValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Full name must be between 1 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Full name can only contain letters, spaces, hyphens, and apostrophes'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must not exceed 255 characters')
];

/**
 * Validation for password change
 */
export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
    .isLength({ max: 128 })
    .withMessage('New password must not exceed 128 characters'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

/**
 * Validation for ID parameters
 */
export const idParamValidation = [
  body('id')
    .optional()
    .isString()
    .withMessage('ID must be a string')
    .notEmpty()
    .withMessage('ID cannot be empty')
    .isLength({ max: 100 })
    .withMessage('ID must not exceed 100 characters')
];

/**
 * Generic text validation (for comments, descriptions, etc.)
 */
export const textValidation = (fieldName: string, maxLength: number = 1000, required: boolean = true) => [
  required 
    ? body(fieldName)
        .notEmpty()
        .withMessage(`${fieldName} is required`)
        .trim()
        .isLength({ max: maxLength })
        .withMessage(`${fieldName} must not exceed ${maxLength} characters`)
    : body(fieldName)
        .optional()
        .trim()
        .isLength({ max: maxLength })
        .withMessage(`${fieldName} must not exceed ${maxLength} characters`)
];

export default {
  validateRequest,
  registerValidation,
  loginValidation,
  codeAnalysisValidation,
  updateProfileValidation,
  changePasswordValidation,
  idParamValidation,
  textValidation
};
