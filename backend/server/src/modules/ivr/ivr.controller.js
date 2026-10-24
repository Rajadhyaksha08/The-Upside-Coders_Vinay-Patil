import { asyncHandler } from '../../shared/utils/async-handler.js';
import * as svc from './ivr.service.js';

// POST /api/ivr/sessions
export const create = asyncHandler(async (req, res) => {
  const session = svc.createSession(req.validated.body);
  res.status(201).json({ session });
});

// GET /api/ivr/sessions/:id
export const get = asyncHandler(async (req, res) => {
  const session = svc.getSession(req.params.id);
  res.json({ session });
});

// POST /api/ivr/sessions/:id/event
export const event = asyncHandler(async (req, res) => {
  const result = svc.handleEvent(req.params.id, req.validated.body.input);
  res.json(result);
});
