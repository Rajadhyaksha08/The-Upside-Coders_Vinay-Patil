import { z } from 'zod';

// ── Create service request ──────────────────────────────────────────────────
export const createRequestSchema = z.object({
  serviceCategoryId: z.coerce.number().int().positive('Service category is required.'),
  title:             z.string().min(3, 'Title must be at least 3 characters.').max(200),
  description:       z.string().max(2000).optional(),
  budget:            z.coerce.number().int().nonnegative().optional(),
  address:           z.string().max(500).optional(),
  pincode:           z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits.').optional(),
  preferredDate:     z.string().max(30).optional(),
  preferredTime:     z.string().max(30).optional(),
});

// ── Update service request ──────────────────────────────────────────────────
export const updateRequestSchema = z.object({
  title:         z.string().min(3).max(200).optional(),
  description:   z.string().max(2000).optional(),
  budget:        z.coerce.number().int().nonnegative().optional(),
  address:       z.string().max(500).optional(),
  pincode:       z.string().regex(/^\d{6}$/).optional(),
  preferredDate: z.string().max(30).optional(),
  preferredTime: z.string().max(30).optional(),
}).refine(
  (d) => Object.keys(d).length > 0,
  { message: 'At least one field is required for update.' }
);

// ── Select worker for request ────────────────────────────────────────────────
export const selectWorkerSchema = z.object({
  workerId: z.coerce.number().int().positive('Worker ID is required.'),
});

// ── List requests query ──────────────────────────────────────────────────────
export const listRequestsQuerySchema = z.object({
  status: z.enum(['open', 'assigned', 'in_progress', 'completed', 'cancelled']).optional(),
  page:   z.coerce.number().int().positive().optional().default(1),
  limit:  z.coerce.number().int().positive().max(50).optional().default(20),
});

// ── Request ID param ─────────────────────────────────────────────────────────
export const requestIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});
