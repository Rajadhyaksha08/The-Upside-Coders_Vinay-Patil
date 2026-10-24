import { db } from '../../db/database.js';
import { AppError } from '../../shared/errors/app-error.js';

const findByUserId = db.prepare(`
  SELECT wa.* FROM worker_availability wa
  JOIN worker_profiles wp ON wp.id = wa.worker_profile_id
  WHERE wp.user_id = ?
`);

const upsertAvailability = db.prepare(`
  INSERT INTO worker_availability (worker_profile_id, status, updated_at)
  VALUES ((SELECT id FROM worker_profiles WHERE user_id = ?), ?, datetime('now'))
  ON CONFLICT(worker_profile_id) DO UPDATE SET
    status = excluded.status,
    updated_at = datetime('now')
`);

const findProfileIdByUserId = db.prepare(
  'SELECT id FROM worker_profiles WHERE user_id = ?'
);

export function getAvailability(userId) {
  const row = findByUserId.get(userId);
  if (!row) throw new AppError(404, 'Availability record not found.', 'NOT_FOUND');
  return { status: row.status, updatedAt: row.updated_at };
}

export function setAvailability(userId, status) {
  const profile = findProfileIdByUserId.get(userId);
  if (!profile) {
    throw new AppError(404, 'Worker profile not found.', 'NOT_FOUND');
  }
  upsertAvailability.run(userId, status);
  return { status, updatedAt: new Date().toISOString() };
}
