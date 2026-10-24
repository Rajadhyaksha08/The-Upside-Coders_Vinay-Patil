import { z } from 'zod';

// ── Shared primitives ────────────────────────────────────────────────────────

/** 10-digit Indian mobile number (digits only, no country code) */
const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number.');

/**
 * 4-digit PIN (matches the frontend OTPInput component which captures exactly
 * 4 digits for login). We allow 4–8 characters to give some flexibility if
 * the frontend ever extends the PIN length.
 */
const pinSchema = z
  .string()
  .min(4, 'PIN must be at least 4 digits.')
  .max(8, 'PIN must be at most 8 characters.')
  .regex(/^\d+$/, 'PIN must contain only digits.');

// ── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters.').max(100),
  phone:    phoneSchema,
  pin:      pinSchema,
  role:     z.enum(['customer', 'worker'], { message: "Role must be 'customer' or 'worker'." }),

  // Worker-only fields — optional when role is 'customer'
  city:        z.string().max(100).optional(),
  pincode:     z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits.').optional(),
  service:     z.string().min(1).max(50).optional(),    // primary service slug
  skills:      z.array(z.string().max(60)).max(20).optional(),
  experience:  z.string().max(50).optional(),
  languages:   z.array(z.string().max(30)).max(20).optional(),
  rateType:    z.enum(['hourly', 'fixed']).optional(),
  rate:        z.coerce.number().int().positive().optional(),
  bio:         z.string().max(1000).optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'worker') {
    if (!data.service) {
      ctx.addIssue({ path: ['service'], code: z.ZodIssueCode.custom, message: 'Service is required for worker registration.' });
    }
    if (!data.city) {
      ctx.addIssue({ path: ['city'], code: z.ZodIssueCode.custom, message: 'City is required for worker registration.' });
    }
    if (!data.pincode) {
      ctx.addIssue({ path: ['pincode'], code: z.ZodIssueCode.custom, message: 'PIN code is required for worker registration.' });
    }
  }
});

// ── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  phone: phoneSchema,
  pin:   pinSchema,
  role:  z.enum(['customer', 'worker', 'admin']).optional(),
});
