import { z } from 'zod';

// ── GET /api/workers query filters ───────────────────────────────────────────

export const listWorkersQuerySchema = z.object({
  service:      z.string().optional(),          // service slug
  availability: z.enum(['available', 'busy', 'offline']).optional(),
  city:         z.string().max(100).optional(),
  pincode:      z.string().regex(/^\d{6}$/).optional(),
  sortBy:       z.enum(['rating', 'price', 'jobs']).optional().default('rating'),
  page:         z.coerce.number().int().positive().optional().default(1),
  limit:        z.coerce.number().int().positive().max(50).optional().default(20),
});

// ── PATCH /api/workers/me ─────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name:        z.string().min(2).max(100).optional(),
  city:        z.string().max(100).optional(),
  pincode:     z.string().regex(/^\d{6}$/).optional(),
  bio:         z.string().max(1000).optional(),
  experience:  z.string().max(50).optional(),
  languages:   z.array(z.string().max(30)).max(20).optional(),
  hourly_rate: z.coerce.number().int().nonnegative().optional(),
  fixed_rate:  z.coerce.number().int().nonnegative().optional(),
  rate_type:   z.enum(['hourly', 'fixed']).optional(),
}).refine(
  (d) => Object.keys(d).length > 0,
  { message: 'At least one field is required for update.' }
);
