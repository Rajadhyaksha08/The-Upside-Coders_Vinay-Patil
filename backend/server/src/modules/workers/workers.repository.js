import { db } from '../../db/database.js';

// ── Public worker listing ─────────────────────────────────────────────────────

/**
 * Returns the SQL fragment common to all worker directory queries.
 * Joins worker_profiles, users, worker_availability, and aggregated services.
 */
const BASE_SELECT = `
  SELECT
    wp.id,
    wp.user_id,
    u.name,
    wp.city,
    wp.pincode,
    wp.bio,
    wp.experience,
    wp.working_hours,
    wp.languages,
    wp.hourly_rate,
    wp.fixed_rate,
    wp.rate_type,
    wp.aadhaar_verified,
    wp.platform_verified,
    wp.jobs_completed,
    wp.rating,
    wp.review_count,
    COALESCE(wa.status, 'offline') AS availability,
    wp.status,
    wp.created_at,
    wp.updated_at,
    (
      SELECT GROUP_CONCAT(sc.slug, ',')
      FROM worker_services ws2
      JOIN service_categories sc ON sc.id = ws2.service_category_id
      WHERE ws2.worker_profile_id = wp.id
    ) AS services_csv,
    (
      SELECT GROUP_CONCAT(sc.name, ',')
      FROM worker_services ws3
      JOIN service_categories sc ON sc.id = ws3.service_category_id
      WHERE ws3.worker_profile_id = wp.id
    ) AS service_names_csv
  FROM worker_profiles wp
  JOIN users u ON u.id = wp.user_id
  LEFT JOIN worker_availability wa ON wa.worker_profile_id = wp.id
`;

function rowToWorker(row) {
  if (!row) return null;
  return {
    id:               row.id,
    name:             row.name,
    city:             row.city,
    pincode:          row.pincode,
    bio:              row.bio,
    experience:       row.experience,
    workingHours:     row.working_hours,
    languages:        parseJsonArray(row.languages),
    hourlyRate:       row.hourly_rate,
    fixedRate:        row.fixed_rate,
    rateType:         row.rate_type,
    aadhaarVerified:  Boolean(row.aadhaar_verified),
    platformVerified: Boolean(row.platform_verified),
    jobsCompleted:    row.jobs_completed,
    rating:           row.rating,
    reviewCount:      row.review_count,
    availability:     row.availability,
    status:           row.status,
    services:         row.services_csv ? row.services_csv.split(',') : [],
    serviceNames:     row.service_names_csv ? row.service_names_csv.split(',') : [],
    createdAt:        row.created_at,
    updatedAt:        row.updated_at,
    // user_id intentionally omitted from public responses
  };
}

function parseJsonArray(val) {
  try {
    const parsed = JSON.parse(val || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ── Queries ──────────────────────────────────────────────────────────────────

export function listWorkers({ service, availability, city, pincode, sortBy, page, limit }) {
  const conditions = ["wp.status = 'active'"];
  const params = [];

  if (availability) {
    conditions.push('COALESCE(wa.status, ?) = ?');
    params.push('offline', availability);
  }
  if (city) {
    conditions.push('LOWER(wp.city) = LOWER(?)');
    params.push(city);
  }
  if (pincode) {
    conditions.push('wp.pincode = ?');
    params.push(pincode);
  }

  // Service filter via subquery
  let serviceJoin = '';
  if (service) {
    serviceJoin = `
      JOIN worker_services ws ON ws.worker_profile_id = wp.id
      JOIN service_categories sc ON sc.id = ws.service_category_id AND LOWER(sc.slug) = LOWER(?)
    `;
    params.unshift(service); // place before other params since JOIN comes first in FROM
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const orderMap = { rating: 'wp.rating DESC', price: 'COALESCE(wp.hourly_rate, wp.fixed_rate) ASC', jobs: 'wp.jobs_completed DESC' };
  const orderClause = `ORDER BY ${orderMap[sortBy] ?? 'wp.rating DESC'}`;

  const offset = (page - 1) * limit;
  const sql = `${BASE_SELECT} ${serviceJoin} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;

  const rows = db.prepare(sql).all(...params, limit, offset);
  return rows.map(rowToWorker);
}

export function countWorkers({ service, availability, city, pincode }) {
  const conditions = ["wp.status = 'active'"];
  const params = [];

  if (availability) {
    conditions.push('COALESCE(wa.status, ?) = ?');
    params.push('offline', availability);
  }
  if (city) {
    conditions.push('LOWER(wp.city) = LOWER(?)');
    params.push(city);
  }
  if (pincode) {
    conditions.push('wp.pincode = ?');
    params.push(pincode);
  }

  let serviceJoin = '';
  if (service) {
    serviceJoin = `
      JOIN worker_services ws ON ws.worker_profile_id = wp.id
      JOIN service_categories sc ON sc.id = ws.service_category_id AND LOWER(sc.slug) = LOWER(?)
    `;
    params.unshift(service);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT COUNT(*) AS total
    FROM worker_profiles wp
    JOIN users u ON u.id = wp.user_id
    LEFT JOIN worker_availability wa ON wa.worker_profile_id = wp.id
    ${serviceJoin}
    ${whereClause}
  `;

  const row = db.prepare(sql).get(...params);
  return row?.total ?? 0;
}

export function findWorkerById(id) {
  const row = db.prepare(`${BASE_SELECT} WHERE wp.id = ? AND wp.status != 'deleted'`).get(id);
  return rowToWorker(row);
}

export function findWorkerByUserId(userId) {
  const row = db.prepare(`${BASE_SELECT} WHERE wp.user_id = ?`).get(userId);
  return rowToWorker(row);
}

export function findRawProfileByUserId(userId) {
  return db.prepare('SELECT * FROM worker_profiles WHERE user_id = ?').get(userId);
}

// ── Update ───────────────────────────────────────────────────────────────────

export function updateWorkerProfile(profileId, fields) {
  const allowed = ['city', 'pincode', 'bio', 'experience', 'working_hours', 'languages',
                   'hourly_rate', 'fixed_rate', 'rate_type'];
  const setClauses = [];
  const values = [];

  for (const [key, val] of Object.entries(fields)) {
    if (allowed.includes(key)) {
      setClauses.push(`${key} = ?`);
      values.push(key === 'languages' ? JSON.stringify(val) : val);
    }
  }

  if (setClauses.length === 0) return;

  setClauses.push("updated_at = datetime('now')");
  values.push(profileId);

  db.prepare(`UPDATE worker_profiles SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
}

export function updateUserName(userId, name) {
  db.prepare("UPDATE users SET name = ?, updated_at = datetime('now') WHERE id = ?").run(name, userId);
}

export function deactivateWorker(profileId) {
  db.prepare("UPDATE worker_profiles SET status = 'inactive', updated_at = datetime('now') WHERE id = ?").run(profileId);
}
