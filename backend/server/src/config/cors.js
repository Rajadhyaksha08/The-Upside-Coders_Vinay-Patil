import { env } from './env.js';

export const corsOptions = {
  origin: env.clientOrigin,
  credentials: true,            // required for session cookies
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
};
