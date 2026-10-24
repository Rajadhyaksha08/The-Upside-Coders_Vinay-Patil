import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for authentication endpoints (login / register).
 * 20 attempts per 15-minute window per IP.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again in 15 minutes.',
    },
  },
  // Skip in test environment to prevent slow tests
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * General API rate limiter — 300 requests per minute per IP.
 */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
  skip: () => process.env.NODE_ENV === 'test',
});
