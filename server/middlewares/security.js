const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General API Rate Limiter
 * Prevents DDoS and brute force attacks
 */
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // Default: 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime - Date.now()) / 1000,
    });
  },
  skip: (req) => {
    // Skip preflight and health checks
    return req.method === 'OPTIONS' || req.path === '/health' || req.path === '/health/ready';
  },
});

/**
 * Authentication Rate Limiter
 * Stricter limits for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: (process.env.AUTH_RATE_LIMIT_WINDOW || 15) * 60 * 1000, // Default: 15 minutes
  max: process.env.AUTH_RATE_LIMIT_MAX_REQUESTS || 5, // Only 5 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
    retryAfter: '15 minutes',
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Account temporarily locked.',
      retryAfter: Math.ceil(req.rateLimit.resetTime - Date.now()) / 1000,
    });
  },
});

const verificationLimiter = rateLimit({
  windowMs: (process.env.VERIFICATION_RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.VERIFICATION_RATE_LIMIT_MAX_REQUESTS || 20,
  message: {
    success: false,
    code: 'VERIFICATION_RATE_LIMITED',
    message: 'Too many verification attempts. Please try again later.',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    logger.warn(`Verification rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      code: 'VERIFICATION_RATE_LIMITED',
      message: 'Too many verification attempts. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime - Date.now()) / 1000,
    });
  },
});
const chatUploadLimiter = rateLimit({
  windowMs: (process.env.CHAT_UPLOAD_RATE_WINDOW || 15) * 60 * 1000,
  max: process.env.CHAT_UPLOAD_RATE_MAX || 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    logger.warn(`Chat upload rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many chat uploads. Please try again later.',
    });
  },
});

const paymentLimiter = rateLimit({
  windowMs: (process.env.PAYMENT_RATE_LIMIT_WINDOW || 10) * 60 * 1000,
  max: process.env.PAYMENT_RATE_LIMIT_MAX || 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  handler: (req, res) => {
    logger.warn(`Payment rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many payment requests. Please try again later.',
    });
  },
});

module.exports = {
  limiter,
  authLimiter,
  verificationLimiter,
  chatUploadLimiter,
  paymentLimiter,
};
