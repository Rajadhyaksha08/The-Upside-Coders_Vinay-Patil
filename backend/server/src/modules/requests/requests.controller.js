import { asyncHandler } from '../../shared/utils/async-handler.js';
import {
  createServiceRequest,
  getCustomerRequests,
  getRequestById,
  updateServiceRequest,
  selectWorkerForRequest,
  cancelRequest,
} from './requests.service.js';

// POST /api/requests
export const create = asyncHandler(async (req, res) => {
  const request = createServiceRequest(req.currentUser.id, req.validated.body);
  res.status(201).json({ request });
});

// GET /api/requests
export const list = asyncHandler(async (req, res) => {
  const result = getCustomerRequests(req.currentUser.id, req.validated.query);
  res.json(result);
});

// GET /api/requests/:id
export const getOne = asyncHandler(async (req, res) => {
  const request = getRequestById(req.validated.params.id, req.currentUser.id);
  res.json({ request });
});

// PATCH /api/requests/:id
export const update = asyncHandler(async (req, res) => {
  const request = updateServiceRequest(req.validated.params.id, req.currentUser.id, req.validated.body);
  res.json({ request });
});

// POST /api/requests/:id/select-worker
export const selectWorker = asyncHandler(async (req, res) => {
  const request = selectWorkerForRequest(
    req.validated.params.id,
    req.currentUser.id,
    req.validated.body.workerId
  );
  res.json({ request });
});

// POST /api/requests/:id/cancel
export const cancel = asyncHandler(async (req, res) => {
  const request = cancelRequest(req.validated.params.id, req.currentUser.id);
  res.json({ request });
});
