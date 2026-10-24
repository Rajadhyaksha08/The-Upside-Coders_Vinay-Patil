/**
 * auth.js — authentication and authorization middleware.
 *
 * requireAuth   — rejects unauthenticated requests (401).
 * requireRole   — factory: rejects requests where the session user's role
 *                 is not in the allowed list (403).
 *
 * Identity is always derived from the server-side session — never from the
 * request body or query string.
 */
import { AppError } from '../shared/errors/app-error.js';
import { findUserById } from '../modules/auth/auth.repository.js';

/**
 * Attach req.currentUser from the session. Must come before requireAuth.
 */
export async function loadUser(req, res, next) {
  const userId = req.session?.userId;
  if (!userId) return next();
  const user = findUserById(userId);
  if (user && user.status === 'active') {
    req.currentUser = user;
  }
  next();
}

/**
 * Reject requests with no valid session.
 */
export function requireAuth(req, res, next) {
  if (!req.currentUser) {
    return next(new AppError(401, 'Authentication required.', 'UNAUTHENTICATED'));
  }
  next();
}

/**
 * requireRole(...roles) — allow only users whose role is in the list.
 * Must be used after requireAuth.
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.currentUser) {
      return next(new AppError(401, 'Authentication required.', 'UNAUTHENTICATED'));
    }
    if (!roles.includes(req.currentUser.role)) {
      return next(new AppError(403, 'You do not have permission to perform this action.', 'FORBIDDEN'));
    }
    next();
  };
}
