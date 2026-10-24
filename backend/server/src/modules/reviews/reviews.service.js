import { AppError } from '../../shared/errors/app-error.js';
import { db } from '../../db/database.js';

// ── Create a review ──────────────────────────────────────────────────────────
export function createReview(reviewerId, { bookingId, rating, comment }) {
  // Check booking exists and is completed
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    throw new AppError(404, 'Booking not found.', 'NOT_FOUND');
  }
  if (booking.status !== 'completed') {
    throw new AppError(400, 'Can only review completed bookings.', 'INVALID_STATE');
  }
  if (booking.customer_id !== reviewerId) {
    throw new AppError(403, 'Only the customer who booked can leave a review.', 'FORBIDDEN');
  }

  // Check for duplicate review
  const existing = db.prepare('SELECT id FROM reviews WHERE booking_id = ?').get(bookingId);
  if (existing) {
    throw new AppError(409, 'A review already exists for this booking.', 'DUPLICATE_REVIEW');
  }

  const result = db.prepare(`
    INSERT INTO reviews (booking_id, reviewer_id, worker_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `).run(bookingId, reviewerId, booking.worker_id, rating, comment ?? null);

  // Update aggregate rating on worker_profiles
  const stats = db.prepare(`
    SELECT COUNT(*) AS cnt, AVG(rating) AS avg_rating
    FROM reviews WHERE worker_id = ?
  `).get(booking.worker_id);

  db.prepare(`
    UPDATE worker_profiles
    SET rating = ?, review_count = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    Math.round(stats.avg_rating * 10) / 10,
    stats.cnt,
    booking.worker_id
  );

  return db.prepare(`
    SELECT r.*, u.name AS reviewer_name
    FROM reviews r JOIN users u ON u.id = r.reviewer_id
    WHERE r.id = ?
  `).get(result.lastInsertRowid);
}

// ── List reviews for a worker ────────────────────────────────────────────────
export function listReviews({ workerId, page, limit }) {
  const offset = (page - 1) * limit;

  let where = '';
  const params = [];
  if (workerId) {
    where = 'WHERE r.worker_id = ?';
    params.push(workerId);
  }

  const total = db.prepare(`SELECT COUNT(*) AS cnt FROM reviews r ${where}`).get(...params).cnt;
  const reviews = db.prepare(`
    SELECT r.*, u.name AS reviewer_name
    FROM reviews r JOIN users u ON u.id = r.reviewer_id
    ${where}
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return { reviews, total, page, limit };
}

// ── Get reviews for a specific worker (public) ───────────────────────────────
export function getWorkerReviews(workerId) {
  return db.prepare(`
    SELECT r.*, u.name AS reviewer_name
    FROM reviews r JOIN users u ON u.id = r.reviewer_id
    WHERE r.worker_id = ?
    ORDER BY r.created_at DESC
    LIMIT 50
  `).all(workerId);
}
