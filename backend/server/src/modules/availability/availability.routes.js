import { Router } from 'express';
import { loadUser, requireAuth, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { updateAvailabilitySchema } from './availability.schema.js';
import { getMyAvailability, updateMyAvailability } from './availability.controller.js';

export const availabilityRouter = Router();

availabilityRouter.use(loadUser);
availabilityRouter.use(requireAuth);
availabilityRouter.use(requireRole('worker'));

// Nested under /api/workers/me/availability (router is mounted at /api/workers)
availabilityRouter.get('/me/availability',   getMyAvailability);
availabilityRouter.patch('/me/availability', validateRequest({ body: updateAvailabilitySchema }), updateMyAvailability);
