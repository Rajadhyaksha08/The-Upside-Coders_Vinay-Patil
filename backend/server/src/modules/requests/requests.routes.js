import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate-request.js';
import {
  createRequestSchema,
  updateRequestSchema,
  listRequestsQuerySchema,
  requestIdParamSchema,
  selectWorkerSchema,
} from './requests.schema.js';
import { create, list, getOne, update, selectWorker, cancel } from './requests.controller.js';

export const requestsRouter = Router();

// All request routes require authentication as a customer
requestsRouter.use(requireAuth);

// POST   /api/requests            — create a new service request
requestsRouter.post(
  '/',
  requireRole('customer'),
  validateRequest({ body: createRequestSchema }),
  create
);

// GET    /api/requests            — list my requests (with optional status filter + pagination)
requestsRouter.get(
  '/',
  requireRole('customer'),
  validateRequest({ query: listRequestsQuerySchema }),
  list
);

// GET    /api/requests/:id        — get one request
requestsRouter.get(
  '/:id',
  requireRole('customer'),
  validateRequest({ params: requestIdParamSchema }),
  getOne
);

// PATCH  /api/requests/:id        — update an open request
requestsRouter.patch(
  '/:id',
  requireRole('customer'),
  validateRequest({ params: requestIdParamSchema, body: updateRequestSchema }),
  update
);

// POST   /api/requests/:id/select-worker — assign a worker to the request
requestsRouter.post(
  '/:id/select-worker',
  requireRole('customer'),
  validateRequest({ params: requestIdParamSchema, body: selectWorkerSchema }),
  selectWorker
);

// POST   /api/requests/:id/cancel — cancel the request
requestsRouter.post(
  '/:id/cancel',
  requireRole('customer'),
  validateRequest({ params: requestIdParamSchema }),
  cancel
);
