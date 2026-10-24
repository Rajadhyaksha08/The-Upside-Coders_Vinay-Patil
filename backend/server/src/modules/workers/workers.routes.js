import { Router } from 'express';
import { loadUser, requireAuth, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { listWorkersQuerySchema, updateProfileSchema } from './workers.schema.js';
import {
  listWorkers, getWorker, getOwnProfile,
  updateOwnProfile, deactivateOwnProfile,
} from './workers.controller.js';

export const workersRouter = Router();

// Apply loadUser to all worker routes so req.currentUser is populated
workersRouter.use(loadUser);

// Public routes
workersRouter.get('/',    validateRequest({ query: listWorkersQuerySchema }), listWorkers);

// Authenticated worker-only routes
// NOTE: /me must be defined BEFORE /:id so Express matches it first
workersRouter.get('/me',    requireAuth, requireRole('worker'), getOwnProfile);
workersRouter.patch('/me',  requireAuth, requireRole('worker'), validateRequest({ body: updateProfileSchema }), updateOwnProfile);
workersRouter.delete('/me', requireAuth, requireRole('worker'), deactivateOwnProfile);

// Public single-worker route
workersRouter.get('/:id',  getWorker);
