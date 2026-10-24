import { db } from '../../db/database.js';

// ── User queries ─────────────────────────────────────────────────────────────

export const findUserByPhone = (phone) =>
  db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);

export const findUserById = (id) =>
  db.prepare('SELECT * FROM users WHERE id = ?').get(id);

export const insertUser = db.prepare(`
  INSERT INTO users (name, phone, password_hash, role)
  VALUES (@name, @phone, @password_hash, @role)
`);

// ── Worker profile queries ───────────────────────────────────────────────────

export const findWorkerProfileByUserId = (userId) =>
  db.prepare('SELECT * FROM worker_profiles WHERE user_id = ?').get(userId);

export const insertWorkerProfile = db.prepare(`
  INSERT INTO worker_profiles
    (user_id, city, pincode, experience, languages, hourly_rate, fixed_rate, rate_type, bio)
  VALUES
    (@user_id, @city, @pincode, @experience, @languages, @hourly_rate, @fixed_rate, @rate_type, @bio)
`);

export const findServiceCategoryBySlug = (slug) =>
  db.prepare('SELECT * FROM service_categories WHERE slug = ?').get(slug);

export const insertWorkerService = db.prepare(`
  INSERT OR IGNORE INTO worker_services (worker_profile_id, service_category_id)
  VALUES (@worker_profile_id, @service_category_id)
`);

export const insertWorkerAvailability = db.prepare(`
  INSERT OR IGNORE INTO worker_availability (worker_profile_id, status)
  VALUES (@worker_profile_id, 'offline')
`);

// ── Transactional registration ────────────────────────────────────────────────

/**
 * Create a user + optional worker profile atomically.
 * Returns { userId, workerProfileId? }.
 */
export const createUserWithProfile = db.transaction(
  ({ name, phone, password_hash, role, workerData }) => {
    const userResult = insertUser.run({ name, phone, password_hash, role });
    const userId = userResult.lastInsertRowid;

    let workerProfileId = null;
    if (role === 'worker' && workerData) {
      const profileResult = insertWorkerProfile.run({
        user_id:    userId,
        city:       workerData.city       ?? '',
        pincode:    workerData.pincode    ?? '',
        experience: workerData.experience ?? null,
        languages:  JSON.stringify(workerData.languages ?? []),
        hourly_rate: workerData.rateType === 'hourly' ? (workerData.rate ?? null) : null,
        fixed_rate:  workerData.rateType === 'fixed'  ? (workerData.rate ?? null) : null,
        rate_type:   workerData.rateType  ?? 'hourly',
        bio:         workerData.bio       ?? null,
      });
      workerProfileId = profileResult.lastInsertRowid;

      // Link primary service
      if (workerData.serviceCategoryId) {
        insertWorkerService.run({
          worker_profile_id:   workerProfileId,
          service_category_id: workerData.serviceCategoryId,
        });
      }

      // Create availability record (defaults to 'offline')
      insertWorkerAvailability.run({ worker_profile_id: workerProfileId });
    }

    return { userId, workerProfileId };
  }
);
