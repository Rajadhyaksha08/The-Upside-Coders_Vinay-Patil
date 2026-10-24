import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate-request.js';
import {
  createBookingSchema,
  updateStatusSchema,
  cancelBookingSchema,
  verifyOtpSchema,
  listBookingsQuerySchema,
} from './bookings.schema.js';
import {
  createBooking,
  listBookings,
  getBooking,
  updateStatus,
  cancelBooking,
  verifyOtp,
  completeBooking,
  getHistory,
} from './bookings.controller.js';

export const bookingsRouter = Router();

// All booking routes require authentication
bookingsRouter.use(requireAuth);

bookingsRouter.post('/',
  validateRequest({ body: createBookingSchema }),
  createBooking
);

bookingsRouter.get('/',
  validateRequest({ query: listBookingsQuerySchema }),
  listBookings
);

bookingsRouter.get('/:id', getBooking);

bookingsRouter.patch('/:id/status',
  validateRequest({ body: updateStatusSchema }),
  updateStatus
);

bookingsRouter.post('/:id/cancel',
  validateRequest({ body: cancelBookingSchema }),
  cancelBooking
);

bookingsRouter.post('/:id/verify-otp',
  validateRequest({ body: verifyOtpSchema }),
  verifyOtp
);

bookingsRouter.post('/:id/complete', completeBooking);

bookingsRouter.get('/:id/history', getHistory);
