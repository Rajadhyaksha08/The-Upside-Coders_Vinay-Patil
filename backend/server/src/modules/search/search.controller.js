import { asyncHandler } from '../../shared/utils/async-handler.js';
import { searchWorkers } from './search.service.js';

export const search = asyncHandler(async (req, res) => {
  const result = searchWorkers(req.validated.query);
  res.json(result);
});
