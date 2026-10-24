import { asyncHandler } from '../../shared/utils/async-handler.js';
import { getAvailability, setAvailability } from './availability.service.js';

// GET /api/workers/me/availability
export const getMyAvailability = asyncHandler(async (req, res) => {
  const avail = getAvailability(req.session.userId);
  res.json({ availability: avail });
});

// PATCH /api/workers/me/availability
export const updateMyAvailability = asyncHandler(async (req, res) => {
  const { status } = req.validated.body;
  const avail = setAvailability(req.session.userId, status);
  res.json({ availability: avail });
});
