import { asyncHandler } from '../../shared/utils/async-handler.js';
import * as svc from './bookings.service.js';

// POST /api/bookings
export const createBooking = asyncHandler(async (req, res) => {
  const booking = svc.create(req.currentUser.id, req.validated.body);
  res.status(201).json({ booking });
});

// GET /api/bookings
export const listBookings = asyncHandler(async (req, res) => {
  const result = svc.list(req.currentUser.id, req.currentUser.role, req.validated.query);
  res.json(result);
});

// GET /api/bookings/:id
export const getBooking = asyncHandler(async (req, res) => {
  const booking = svc.getById(
    Number(req.params.id), req.currentUser.id, req.currentUser.role
  );
  res.json({ booking });
});

// PATCH /api/bookings/:id/status
export const updateStatus = asyncHandler(async (req, res) => {
  const booking = svc.transitionStatus(
    Number(req.params.id), req.validated.body.status,
    req.currentUser.id, req.currentUser.role
  );
  res.json({ booking });
});

// POST /api/bookings/:id/cancel
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = svc.cancel(
    Number(req.params.id), req.validated.body.reason,
    req.currentUser.id, req.currentUser.role
  );
  res.json({ booking });
});

// POST /api/bookings/:id/verify-otp
export const verifyOtp = asyncHandler(async (req, res) => {
  const booking = svc.verifyOtp(
    Number(req.params.id), req.validated.body.otp, req.currentUser.id
  );
  res.json({ booking });
});

// POST /api/bookings/:id/complete
export const completeBooking = asyncHandler(async (req, res) => {
  const booking = svc.complete(
    Number(req.params.id), req.body.finalAmount ?? null,
    req.currentUser.id, req.currentUser.role
  );
  res.json({ booking });
});

// GET /api/bookings/:id/history
export const getHistory = asyncHandler(async (req, res) => {
  const history = svc.history(Number(req.params.id));
  res.json({ history });
});
