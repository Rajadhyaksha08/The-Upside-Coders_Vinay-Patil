import { AppError } from '../../shared/errors/app-error.js';
import {
  listWorkers, countWorkers, findWorkerById,
  findWorkerByUserId, findRawProfileByUserId,
  updateWorkerProfile, updateUserName, deactivateWorker,
} from './workers.repository.js';

// ── Public directory ─────────────────────────────────────────────────────────

export function getWorkers(filters) {
  const workers = listWorkers(filters);
  const total   = countWorkers(filters);
  const { page, limit } = filters;
  return {
    workers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

// ── Single worker ─────────────────────────────────────────────────────────────

export function getWorkerById(id) {
  const worker = findWorkerById(Number(id));
  if (!worker) throw new AppError(404, 'Worker not found.', 'NOT_FOUND');
  return worker;
}

// ── Authenticated worker profile ──────────────────────────────────────────────

export function getMyProfile(userId) {
  const profile = findWorkerByUserId(userId);
  if (!profile) throw new AppError(404, 'Worker profile not found.', 'NOT_FOUND');
  return profile;
}

// ── Update profile ────────────────────────────────────────────────────────────

export function updateMyProfile(userId, data) {
  const raw = findRawProfileByUserId(userId);
  if (!raw) throw new AppError(404, 'Worker profile not found.', 'NOT_FOUND');

  // Map camelCase frontend fields to snake_case DB columns
  const dbFields = {};
  if (data.city        !== undefined) dbFields.city         = data.city;
  if (data.pincode     !== undefined) dbFields.pincode      = data.pincode;
  if (data.bio         !== undefined) dbFields.bio          = data.bio;
  if (data.experience  !== undefined) dbFields.experience   = data.experience;
  if (data.languages   !== undefined) dbFields.languages    = data.languages;
  if (data.hourly_rate !== undefined) dbFields.hourly_rate  = data.hourly_rate;
  if (data.fixed_rate  !== undefined) dbFields.fixed_rate   = data.fixed_rate;
  if (data.rate_type   !== undefined) dbFields.rate_type    = data.rate_type;

  if (Object.keys(dbFields).length) {
    updateWorkerProfile(raw.id, dbFields);
  }

  // Allow updating the user's display name
  if (data.name !== undefined) {
    updateUserName(userId, data.name.trim());
  }

  return findWorkerByUserId(userId);
}

// ── Deactivate ────────────────────────────────────────────────────────────────

export function deactivateMyProfile(userId) {
  const raw = findRawProfileByUserId(userId);
  if (!raw) throw new AppError(404, 'Worker profile not found.', 'NOT_FOUND');
  deactivateWorker(raw.id);
  return { message: 'Worker profile deactivated.' };
}
