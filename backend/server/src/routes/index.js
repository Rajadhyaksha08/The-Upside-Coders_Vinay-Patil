/**
 * Central route registry — mounts every feature router under /api.
 * All paths here are relative to the /api prefix applied in app.js.
 */
import { Router } from 'express';
import { healthRouter }       from '../modules/health/health.routes.js';
import { authRouter }         from '../modules/auth/auth.routes.js';
import { workersRouter }      from '../modules/workers/workers.routes.js';
import { availabilityRouter } from '../modules/availability/availability.routes.js';
import { requestsRouter }     from '../modules/requests/requests.routes.js';
import { bookingsRouter }     from '../modules/bookings/bookings.routes.js';
import { reviewsRouter }      from '../modules/reviews/reviews.routes.js';
import { ivrRouter }          from '../modules/ivr/ivr.routes.js';

export const router = Router();

router.use('/health',       healthRouter);
router.use('/auth',         authRouter);
router.use('/workers',      workersRouter);
// availability is nested under workers in the routes file itself
router.use('/workers',      availabilityRouter);
router.use('/requests',     requestsRouter);
router.use('/bookings',     bookingsRouter);
router.use('/reviews',      reviewsRouter);
router.use('/ivr',          ivrRouter);
