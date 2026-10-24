import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.coerce.number().int().positive(),
  rating:    z.coerce.number().int().min(1).max(5),
  comment:   z.string().max(1000).optional(),
});

export const listReviewsQuerySchema = z.object({
  workerId: z.coerce.number().int().positive().optional(),
  page:     z.coerce.number().int().positive().optional().default(1),
  limit:    z.coerce.number().int().positive().max(50).optional().default(20),
});
