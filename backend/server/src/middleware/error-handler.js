import { AppError } from '../shared/errors/app-error.js';
import { env } from '../config/env.js';

/**
 * Central Express error handler.
 *
 * Returns { error: { code, message } } for all failures.
 * Stack traces and internal details are hidden in production.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return;

  // Handle Zod validation errors forwarded by validateRequest middleware
  if (err.name === 'ZodError') {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details: err.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      },
    });
  }

  const isAppError = err instanceof AppError;
  const status = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const message =
    status >= 500
      ? env.isProd
        ? 'An unexpected error occurred.'
        : err.message
      : err.message;

  if (status >= 500) {
    console.error('[error]', err);
  }

  return res.status(status).json({
    error: { code, message },
  });
}
