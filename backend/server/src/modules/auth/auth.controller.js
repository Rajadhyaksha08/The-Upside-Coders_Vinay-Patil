import { asyncHandler } from '../../shared/utils/async-handler.js';
import { registerUser, loginUser, publicUser } from './auth.service.js';
import { findUserById, findWorkerProfileByUserId } from './auth.repository.js';
import { AppError } from '../../shared/errors/app-error.js';

// ── POST /api/auth/register ──────────────────────────────────────────────────

export const register = asyncHandler(async (req, res) => {
  const data = req.validated.body;
  const user = await registerUser(data);

  // Regenerate session to prevent session fixation
  req.session.regenerate((err) => {
    if (err) throw err;
    req.session.userId = user.id;
    res.status(201).json({ user });
  });
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────

export const login = asyncHandler(async (req, res) => {
  const data = req.validated.body;
  const user = await loginUser(data);

  req.session.regenerate((err) => {
    if (err) throw err;
    req.session.userId = user.id;
    res.status(200).json({ user });
  });
});

// ── POST /api/auth/logout ────────────────────────────────────────────────────

export const logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[logout] session destroy error', err);
    }
    res.clearCookie('kc.sid');
    res.status(200).json({ message: 'Logged out successfully.' });
  });
});

// ── GET /api/auth/me ─────────────────────────────────────────────────────────

export const me = asyncHandler(async (req, res) => {
  const userId = req.session?.userId;
  if (!userId) {
    throw new AppError(401, 'Not authenticated.', 'UNAUTHENTICATED');
  }

  const user = findUserById(userId);
  if (!user || user.status !== 'active') {
    req.session.destroy(() => {});
    throw new AppError(401, 'Session is no longer valid.', 'INVALID_SESSION');
  }

  let workerProfileId = null;
  if (user.role === 'worker') {
    const profile = findWorkerProfileByUserId(user.id);
    if (profile) workerProfileId = profile.id;
  }

  res.status(200).json({ user: publicUser(user, workerProfileId) });
});
