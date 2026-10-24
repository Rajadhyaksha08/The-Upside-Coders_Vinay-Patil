import { asyncHandler } from '../../shared/utils/async-handler.js';
import { AppError } from '../../shared/errors/app-error.js';
import {
  getWorkers, getWorkerById, getMyProfile,
  updateMyProfile, deactivateMyProfile,
} from './workers.service.js';

// GET /api/workers
export const listWorkers = asyncHandler(async (req, res) => {
  const filters = req.validated.query;
  const result = getWorkers(filters);
  res.json(result);
});

// GET /api/workers/:id
export const getWorker = asyncHandler(async (req, res) => {
  const worker = getWorkerById(req.params.id);
  res.json({ worker });
});

// GET /api/workers/me
export const getOwnProfile = asyncHandler(async (req, res) => {
  const profile = getMyProfile(req.session.userId);
  res.json({ worker: profile });
});

// PATCH /api/workers/me
export const updateOwnProfile = asyncHandler(async (req, res) => {
  const updated = updateMyProfile(req.session.userId, req.validated.body);
  res.json({ worker: updated });
});

// DELETE /api/workers/me
export const deactivateOwnProfile = asyncHandler(async (req, res) => {
  const result = deactivateMyProfile(req.session.userId);
  res.json(result);
});
