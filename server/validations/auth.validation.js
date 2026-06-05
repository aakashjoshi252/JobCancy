const Joi = require('joi');

/**
 * Authentication Validation Schemas
 */

const registerSchema = Joi.object({
  username: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Username must be at least 2 characters long',
      'string.max': 'Username must not exceed 50 characters',
      'any.required': 'Username is required',
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password must not exceed 128 characters',
      'any.required': 'Password is required',
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid 10-digit phone number',
      'any.required': 'Phone number is required',
    }),

  role: Joi.string()
    .valid('candidate', 'recruiter', 'admin')
    .required()
    .messages({
      'any.only': 'Role must be either candidate, recruiter, or admin',
      'any.required': 'Role is required',
    }),

  jobProfession: Joi.when('role', {
    is: 'candidate',
    then: Joi.string()
      .trim()
      .required()
      .messages({
        'any.required': 'Job profession is required for candidates',
      }),
    otherwise: Joi.forbidden(),
  }),
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

const updateProfileSchema = Joi.object({
  username: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Username must be at least 2 characters long',
      'string.max': 'Username must not exceed 50 characters',
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid 10-digit phone number',
    }),

  bio: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Bio must not exceed 500 characters',
    }),

  location: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Location must not exceed 100 characters',
    }),

  website: Joi.string()
    .uri()
    .optional()
    .allow('')
    .messages({
      'string.uri': 'Please provide a valid URL',
    }),

  jobProfession: Joi.when('$userRole', {
    is: 'candidate',
    then: Joi.string()
      .trim()
      .optional()
      .messages({
        'string.base': 'Job profession must be a string',
      }),
    otherwise: Joi.forbidden(),
  }),
});

const emailVerificationSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  otp: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      'string.length': 'OTP must be exactly 6 digits',
      'string.pattern.base': 'OTP must contain only numbers',
      'any.required': 'OTP is required',
    }),
});

const resendOTPSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),

  newPassword: Joi.string()
    .min(6)
    .max(128)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'string.max': 'New password must not exceed 128 characters',
      'any.required': 'New password is required',
    }),
});

const userIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid user ID format',
      'any.required': 'User ID is required',
    }),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  emailVerificationSchema,
  resendOTPSchema,
  changePasswordSchema,
  userIdSchema,
};