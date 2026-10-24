import { db } from '../../db/database.js';

// ── Prepared statements ──────────────────────────────────────────────────────

const insertBooking = db.prepare(`
  INSERT INTO bookings
    (service_request_id, customer_id, worker_id, status,
     scheduled_date, scheduled_time, otp_code, otp_expires_at, notes)
  VALUES
    (@service_request_id, @customer_id, @worker_id, 'pending',
     @scheduled_date, @scheduled_time, @otp_code, @otp_expires_at, @notes)
`);

const findById = db.prepare(`
  SELECT b.*,
         u_c.name  AS customer_name,
         u_c.phone AS customer_phone,
         u_w.name  AS worker_name,
         sr.title  AS request_title,
         sc.name   AS service_name,
         sc.icon   AS service_icon
  FROM bookings b
  JOIN users u_c ON u_c.id = b.customer_id
  JOIN worker_profiles wp ON wp.id = b.worker_id
  JOIN users u_w ON u_w.id = wp.user_id
  JOIN service_requests sr ON sr.id = b.service_request_id
  JOIN service_categories sc ON sc.id = sr.service_category_id
  WHERE b.id = ?
`);

const updateStatus = db.prepare(`
  UPDATE bookings
  SET status = @status, updated_at = datetime('now')
  WHERE id = @id
`);

const updateCancel = db.prepare(`
  UPDATE bookings
  SET status = 'cancelled', cancellation_reason = @reason,
      cancelled_by = @cancelled_by, updated_at = datetime('now')
  WHERE id = @id
`);

const updateOtpVerified = db.prepare(`
  UPDATE bookings
  SET otp_verified = 1, status = 'arrived', updated_at = datetime('now')
  WHERE id = @id
`);

const updateComplete = db.prepare(`
  UPDATE bookings
  SET status = 'completed', actual_end = datetime('now'),
      final_amount = @final_amount, updated_at = datetime('now')
  WHERE id = @id
`);

const updateActualStart = db.prepare(`
  UPDATE bookings
  SET status = 'in_progress', actual_start = datetime('now'),
      updated_at = datetime('now')
  WHERE id = @id
`);

const insertStatusHistory = db.prepare(`
  INSERT INTO booking_status_history (booking_id, old_status, new_status, changed_by, reason)
  VALUES (@booking_id, @old_status, @new_status, @changed_by, @reason)
`);

// ── Exported functions ───────────────────────────────────────────────────────

export function getBookingById(id) {
  return findById.get(id);
}

export function listBookingsForUser(userId, role, { status, page, limit }) {
  const offset = (page - 1) * limit;
  const col = role === 'worker' ? 'b.worker_id' : 'b.customer_id';

  // For workers, join to find their worker_profile_id
  let idValue = userId;
  if (role === 'worker') {
    const profile = db.prepare('SELECT id FROM worker_profiles WHERE user_id = ?').get(userId);
    if (!profile) return { bookings: [], total: 0, page, limit };
    idValue = profile.id;
  }

  let where = `WHERE ${col} = ?`;
  const params = [idValue];
  if (status) {
    where += ' AND b.status = ?';
    params.push(status);
  }

  const total = db.prepare(`SELECT COUNT(*) AS cnt FROM bookings b ${where}`).get(...params).cnt;
  const bookings = db.prepare(`
    SELECT b.*,
           u_c.name AS customer_name,
           u_w.name AS worker_name,
           sr.title AS request_title,
           sc.name  AS service_name,
           sc.icon  AS service_icon
    FROM bookings b
    JOIN users u_c ON u_c.id = b.customer_id
    JOIN worker_profiles wp ON wp.id = b.worker_id
    JOIN users u_w ON u_w.id = wp.user_id
    JOIN service_requests sr ON sr.id = b.service_request_id
    JOIN service_categories sc ON sc.id = sr.service_category_id
    ${where}
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return { bookings, total, page, limit };
}

export const createBookingTx = db.transaction((data) => {
  const result = insertBooking.run(data);
  const bookingId = result.lastInsertRowid;

  // Update the service request status
  db.prepare(`
    UPDATE service_requests SET status = 'assigned', selected_worker_id = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(data.worker_id, data.service_request_id);

  insertStatusHistory.run({
    booking_id:  bookingId,
    old_status:  null,
    new_status:  'pending',
    changed_by:  data.customer_id,
    reason:      'Booking created',
  });

  return bookingId;
});

export function updateBookingStatus(id, newStatus, changedBy, reason = null) {
  const booking = findById.get(id);
  if (!booking) return null;

  const oldStatus = booking.status;

  if (newStatus === 'in_progress') {
    updateActualStart.run({ id });
  } else {
    updateStatus.run({ id, status: newStatus });
  }

  insertStatusHistory.run({
    booking_id: id,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: changedBy,
    reason,
  });

  return findById.get(id);
}

export function cancelBooking(id, reason, cancelledBy, userId) {
  const booking = findById.get(id);
  if (!booking) return null;

  const oldStatus = booking.status;
  updateCancel.run({ id, reason, cancelled_by: cancelledBy });

  insertStatusHistory.run({
    booking_id: id,
    old_status: oldStatus,
    new_status: 'cancelled',
    changed_by: userId,
    reason,
  });

  return findById.get(id);
}

export function verifyBookingOtp(id) {
  const booking = findById.get(id);
  if (!booking) return null;

  updateOtpVerified.run({ id });

  insertStatusHistory.run({
    booking_id: id,
    old_status: booking.status,
    new_status: 'arrived',
    changed_by: null,
    reason:     'OTP verified',
  });

  return findById.get(id);
}

export function completeBooking(id, finalAmount, changedBy) {
  const booking = findById.get(id);
  if (!booking) return null;

  updateComplete.run({ id, final_amount: finalAmount ?? booking.final_amount });

  insertStatusHistory.run({
    booking_id: id,
    old_status: booking.status,
    new_status: 'completed',
    changed_by: changedBy,
    reason:     'Booking completed',
  });

  return findById.get(id);
}

export function getBookingHistory(bookingId) {
  return db.prepare(`
    SELECT * FROM booking_status_history
    WHERE booking_id = ? ORDER BY created_at ASC
  `).all(bookingId);
}

// Admin: list all bookings
export function listAllBookings({ status, page, limit }) {
  const offset = (page - 1) * limit;
  let where = '';
  const params = [];
  if (status) {
    where = 'WHERE b.status = ?';
    params.push(status);
  }
  const total = db.prepare(`SELECT COUNT(*) AS cnt FROM bookings b ${where}`).get(...params).cnt;
  const bookings = db.prepare(`
    SELECT b.*,
           u_c.name AS customer_name,
           u_w.name AS worker_name,
           sr.title AS request_title,
           sc.name  AS service_name
    FROM bookings b
    JOIN users u_c ON u_c.id = b.customer_id
    JOIN worker_profiles wp ON wp.id = b.worker_id
    JOIN users u_w ON u_w.id = wp.user_id
    JOIN service_requests sr ON sr.id = b.service_request_id
    JOIN service_categories sc ON sc.id = sr.service_category_id
    ${where}
    ORDER BY b.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  return { bookings, total, page, limit };
}
