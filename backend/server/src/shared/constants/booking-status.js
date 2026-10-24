/**
 * Canonical booking status values — single source of truth for backend
 * and shared with frontend constants.
 */
export const BOOKING_STATUS = Object.freeze({
  PENDING:     'pending',
  ACCEPTED:    'accepted',
  EN_ROUTE:    'en_route',
  ARRIVED:     'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
  DISPUTED:    'disputed',
});

/**
 * Allowed availability status values for workers.
 */
export const AVAILABILITY_STATUS = Object.freeze({
  AVAILABLE: 'available',
  BUSY:      'busy',
  OFFLINE:   'offline',
});
