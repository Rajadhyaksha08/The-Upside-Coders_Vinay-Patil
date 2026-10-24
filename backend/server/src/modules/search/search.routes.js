import { Router } from 'express';
import { validateRequest } from '../../middleware/validate-request.js';
import { searchWorkersSchema } from './search.schema.js';
import { search } from './search.controller.js';

export const searchRouter = Router();

// Public endpoint — no auth required
searchRouter.get('/workers',
  validateRequest({ query: searchWorkersSchema }),
  search
);
