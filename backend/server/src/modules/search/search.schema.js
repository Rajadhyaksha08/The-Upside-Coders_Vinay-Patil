import { z } from 'zod';

export const searchWorkersSchema = z.object({
  service:      z.string().optional(),
  city:         z.string().max(100).optional(),
  pincode:      z.string().regex(/^\d{6}$/).optional(),
  availability: z.enum(['available', 'busy', 'offline']).optional(),
  minRating:    z.coerce.number().min(0).max(5).optional(),
  maxRate:      z.coerce.number().int().positive().optional(),
  language:     z.string().max(30).optional(),
  sortBy:       z.enum(['rating', 'price', 'jobs', 'reviews']).optional().default('rating'),
  page:         z.coerce.number().int().positive().optional().default(1),
  limit:        z.coerce.number().int().positive().max(50).optional().default(20),
});
