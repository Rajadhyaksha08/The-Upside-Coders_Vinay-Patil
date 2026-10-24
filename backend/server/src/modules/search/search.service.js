import { db } from '../../db/database.js';

export function searchWorkers(filters) {
  const {
    service, city, pincode, availability,
    minRating, maxRate, language,
    sortBy, page, limit
  } = filters;

  const conditions = ["wp.status = 'active'", "u.status = 'active'"];
  const params = [];

  if (service) {
    conditions.push(`sc.slug = ?`);
    params.push(service.toLowerCase());
  }

  if (city) {
    conditions.push(`wp.city LIKE ?`);
    params.push(`%${city}%`);
  }

  if (pincode) {
    conditions.push(`wp.pincode = ?`);
    params.push(pincode);
  }

  if (availability) {
    conditions.push(`COALESCE(wa.status, 'offline') = ?`);
    params.push(availability);
  }

  if (minRating != null) {
    conditions.push(`wp.rating >= ?`);
    params.push(minRating);
  }

  if (maxRate != null) {
    conditions.push(`(wp.hourly_rate <= ? OR wp.fixed_rate <= ?)`);
    params.push(maxRate, maxRate);
  }

  if (language) {
    conditions.push(`wp.languages LIKE ?`);
    params.push(`%${language}%`);
  }

  const where = conditions.length > 0
    ? 'WHERE ' + conditions.join(' AND ')
    : '';

  let orderBy = 'wp.rating DESC';
  if (sortBy === 'price') orderBy = 'COALESCE(wp.hourly_rate, wp.fixed_rate, 9999) ASC';
  if (sortBy === 'jobs') orderBy = 'wp.jobs_completed DESC';
  if (sortBy === 'reviews') orderBy = 'wp.review_count DESC';

  const offset = (page - 1) * limit;

  // Count query
  const countSql = `
    SELECT COUNT(DISTINCT wp.id) AS cnt
    FROM worker_profiles wp
    JOIN users u ON u.id = wp.user_id
    LEFT JOIN worker_availability wa ON wa.worker_profile_id = wp.id
    LEFT JOIN worker_services ws ON ws.worker_profile_id = wp.id
    LEFT JOIN service_categories sc ON sc.id = ws.service_category_id
    ${where}
  `;
  const total = db.prepare(countSql).get(...params).cnt;

  // Data query
  const dataSql = `
    SELECT DISTINCT
      wp.id,
      wp.user_id,
      u.name,
      wp.city,
      wp.pincode,
      wp.bio,
      wp.experience,
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
      GROUP_CONCAT(DISTINCT sc.name) AS services,
      GROUP_CONCAT(DISTINCT sc.slug) AS service_slugs,
      GROUP_CONCAT(DISTINCT sc.icon) AS service_icons
    FROM worker_profiles wp
    JOIN users u ON u.id = wp.user_id
    LEFT JOIN worker_availability wa ON wa.worker_profile_id = wp.id
    LEFT JOIN worker_services ws ON ws.worker_profile_id = wp.id
    LEFT JOIN service_categories sc ON sc.id = ws.service_category_id
    ${where}
    GROUP BY wp.id
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const workers = db.prepare(dataSql).all(...params, limit, offset).map(w => ({
    ...w,
    languages: JSON.parse(w.languages || '[]'),
    services:  w.services ? w.services.split(',') : [],
    service_slugs: w.service_slugs ? w.service_slugs.split(',') : [],
    service_icons: w.service_icons ? w.service_icons.split(',') : [],
    aadhaar_verified: !!w.aadhaar_verified,
    platform_verified: !!w.platform_verified,
  }));

  return { workers, total, page, limit };
}
