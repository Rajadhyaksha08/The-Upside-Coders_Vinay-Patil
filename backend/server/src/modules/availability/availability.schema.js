import { z } from 'zod';

export const updateAvailabilitySchema = z.object({
  status: z.enum(['available', 'busy', 'offline'], {
    errorMap: () => ({ message: "Status must be 'available', 'busy', or 'offline'." }),
  }),
});
