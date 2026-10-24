import { AppError } from '../../shared/errors/app-error.js';
import { generateOtp } from '../../shared/utils/generate-otp.js';
import {
  getBookingById,
  listBookingsForUser,
  createBookingTx,
  updateBookingStatus,
  cancelBooking as cancelBookingRepo,
  verifyBookingOtp as verifyOtpRepo,
  completeBooking as completeBookingRepo,
  getBookingHistory,
} from './bookings.repository.js';
import { db } from '../../db/database.js';

// Valid status transitions
const VALID_TRANSITIONS = {
  pending:      ['accepted', 'cancelled'],
  accepted:     ['en_route', 'cancelled'],
  en_route:     ['arrived', 'cancelled'],
  arrived:      ['in_progress', 'cancelled'],
  in_progress:  ['completed', 'cancelled', 'disputed'],
  completed:    [],
  cancelled:    [],
  disputed:     ['completed', 'cancelled'],
};

export function create(customerId, data) {
  // Verify the service request belongs to this customer and is open/assigned
  const request = db.prepare(
    'SELECT * FROM service_requests WHERE id = ?'
  ).get(data.serviceRequestId);

  if (!request) {
    throw new AppError(404, 'Service request not found.', 'NOT_FOUND');
  }
  if (request.customer_id !== customerId) {
    throw new AppError(403, 'You can only book from your own requests.', 'FORBIDDEN');
  }
  if (!['open', 'assigned'].includes(request.status)) {
    throw new AppError(400, 'Request is no longer available for booking.', 'INVALID_STATE');
  }

  // Verify worker exists and is active
  const worker = db.prepare('SELECT * FROM worker_profiles WHERE id = ?').get(data.workerId);
  if (!worker || worker.status !== 'active') {
    throw new AppError(404, 'Worker not found or not active.', 'WORKER_NOT_FOUND');
  }

  // Check for duplicate active bookings
  const existing = db.prepare(`
    SELECT id FROM bookings
    WHERE service_request_id = ? AND status NOT IN ('cancelled', 'completed')
  `).get(data.serviceRequestId);
  if (existing) {
    throw new AppError(409, 'An active booking already exists for this request.', 'DUPLICATE_BOOKING');
  }

  // Generate arrival OTP
  const otp = generateOtp(4);
  const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const bookingId = createBookingTx({
    service_request_id: data.serviceRequestId,
    customer_id:        customerId,
    worker_id:          data.workerId,
    scheduled_date:     data.scheduledDate ?? null,
    scheduled_time:     data.scheduledTime ?? null,
    otp_code:           otp,
    otp_expires_at:     otpExpiry,
    notes:              data.notes ?? null,
  });

  return getBookingById(bookingId);
}

export function getById(id, userId, role) {
  const booking = getBookingById(id);
  if (!booking) {
    throw new AppError(404, 'Booking not found.', 'NOT_FOUND');
  }

  // Authorization: customer sees their own, worker sees their own, admin sees all
  if (role === 'admin') return booking;

  if (role === 'customer' && booking.customer_id !== userId) {
    throw new AppError(403, 'Access denied.', 'FORBIDDEN');
  }

  if (role === 'worker') {
    const profile = db.prepare('SELECT id FROM worker_profiles WHERE user_id = ?').get(userId);
    if (!profile || booking.worker_id !== profile.id) {
      throw new AppError(403, 'Access denied.', 'FORBIDDEN');
    }
  }

  return booking;
}

export function list(userId, role, query) {
  return listBookingsForUser(userId, role, query);
}

export function transitionStatus(id, newStatus, userId, role) {
  const booking = getBookingById(id);
  if (!booking) {
    throw new AppError(404, 'Booking not found.', 'NOT_FOUND');
  }

  // Auth check
  if (role === 'worker') {
    const profile = db.prepare('SELECT id FROM worker_profiles WHERE user_id = ?').get(userId);
    if (!profile || booking.worker_id !== profile.id) {
      throw new AppError(403, 'Only the assigned worker can update this booking.', 'FORBIDDEN');
    }
  } else if (role === 'customer' && booking.customer_id !== userId) {
    throw new AppError(403, 'Access denied.', 'FORBIDDEN');
  }

  // Validate transition
  const allowed = VALID_TRANSITIONS[booking.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new AppError(400,
      `Cannot transition from '${booking.status}' to '${newStatus}'.`,
      'INVALID_TRANSITION'
    );
  }

  return updateBookingStatus(id, newStatus, userId);
}

export function cancel(id, reason, userId, role) {
  const booking = getBookingById(id);
  if (!booking) {
    throw new AppError(404, 'Booking not found.', 'NOT_FOUND');
  }

  if (['completed', 'cancelled'].includes(booking.status)) {
    throw new AppError(400, 'Cannot cancel a completed or already-cancelled booking.', 'INVALID_STATE');
  }

  // Auth check
  let cancelledBy = role;
  if (role === 'customer' && booking.customer_id !== userId) {
    throw new AppError(403, 'Access denied.', 'FORBIDDEN');
  }
  if (role === 'worker') {
    const profile = db.prepare('SELECT id FROM worker_profiles WHERE user_id = ?').get(userId);
    if (!profile || booking.worker_id !== profile.id) {
      throw new AppError(403, 'Access denied.', 'FORBIDDEN');
    }
  }

  return cancelBookingRepo(id, reason, cancelledBy, userId);
}

export function verifyOtp(id, otp, userId) {
  const booking = getBookingById(id);
  if (!booking) {
    throw new AppError(404, 'Booking not found.', 'NOT_FOUND');
  }
  if (booking.customer_id !== userId) {
    throw new AppError(403, 'Only the customer can verify the OTP.', 'FORBIDDEN');
  }
  if (booking.otp_verified) {
    throw new AppError(400, 'OTP already verified.', 'ALREADY_VERIFIED');
  }
  if (booking.otp_code !== otp) {
    throw new AppError(400, 'Invalid OTP.', 'INVALID_OTP');
  }
  if (booking.otp_expires_at && new Date(booking.otp_expires_at) < new Date()) {
    throw new AppError(400, 'OTP has expired.', 'OTP_EXPIRED');
  }

  return verifyOtpRepo(id);
}

export function complete(id, finalAmount, userId, role) {
  const booking = getBookingById(id);
  if (!booking) {
    throw new AppError(404, 'Booking not found.', 'NOT_FOUND');
  }

  if (!['in_progress', 'arrived'].includes(booking.status)) {
    throw new AppError(400, 'Booking must be in progress to complete.', 'INVALID_STATE');
  }

  if (role === 'worker') {
    const profile = db.prepare('SELECT id FROM worker_profiles WHERE user_id = ?').get(userId);
    if (!profile || booking.worker_id !== profile.id) {
      throw new AppError(403, 'Only the assigned worker can complete this booking.', 'FORBIDDEN');
    }
  }

  return completeBookingRepo(id, finalAmount, userId);
}

export function history(id) {
  return getBookingHistory(id);
}
