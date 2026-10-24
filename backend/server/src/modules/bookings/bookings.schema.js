import { z } from 'zod';

// POST /api/bookings — create from an existing service request
export const createBookingSchema = z.object({
  serviceRequestId: z.coerce.number().int().positive(),
  workerId:         z.coerce.number().int().positive(),
  scheduledDate:    z.string().optional(),
  scheduledTime:    z.string().optional(),
  notes:            z.string().max(1000).optional(),
});

// POST /api/bookings/:id/accept (worker)
export const acceptBookingSchema = z.object({}).optional();

// POST /api/bookings/:id/status — generic status transition
export const updateStatusSchema = z.object({
  status: z.enum([
    'accepted', 'en_route', 'arrived', 'in_progress', 'completed',
  ]),
});

// POST /api/bookings/:id/cancel
export const cancelBookingSchema = z.object({
  reason: z.string().min(1).max(500),
});

// POST /api/bookings/:id/verify-otp
export const verifyOtpSchema = z.object({
  otp: z.string().length(4),
});

// GET /api/bookings?status=...&page=...
export const listBookingsQuerySchema = z.object({
  status: z.enum([
    'pending', 'accepted', 'en_route', 'arrived',
    'in_progress', 'completed', 'cancelled', 'disputed',
  ]).optional(),
  page:  z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});
