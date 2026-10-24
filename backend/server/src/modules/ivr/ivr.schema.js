import { z } from 'zod';

// POST /api/ivr/sessions — start a new IVR session (provider webhook or simulator)
export const createSessionSchema = z.object({
  sessionId:   z.string().min(1).max(100),
  callerPhone: z.string().regex(/^\d{10,15}$/),
});

// POST /api/ivr/sessions/:id/event — advance the IVR state machine
export const sessionEventSchema = z.object({
  input: z.string().max(10),   // DTMF digit(s) pressed
});
