import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validate-request.js';
import { createReviewSchema, listReviewsQuerySchema } from './reviews.schema.js';
import { create, list, workerReviews } from './reviews.controller.js';

export const reviewsRouter = Router();

// Public: get reviews for a specific worker
reviewsRouter.get('/worker/:workerId', workerReviews);

// Authenticated endpoints
reviewsRouter.post('/',
  requireAuth,
  validateRequest({ body: createReviewSchema }),
  create
);

reviewsRouter.get('/',
  requireAuth,
  validateRequest({ query: listReviewsQuerySchema }),
  list
);
