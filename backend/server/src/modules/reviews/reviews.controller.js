import { asyncHandler } from '../../shared/utils/async-handler.js';
import * as svc from './reviews.service.js';

export const create = asyncHandler(async (req, res) => {
  const review = svc.createReview(req.currentUser.id, req.validated.body);
  res.status(201).json({ review });
});

export const list = asyncHandler(async (req, res) => {
  const result = svc.listReviews(req.validated.query);
  res.json(result);
});

export const workerReviews = asyncHandler(async (req, res) => {
  const reviews = svc.getWorkerReviews(Number(req.params.workerId));
  res.json({ reviews });
});
