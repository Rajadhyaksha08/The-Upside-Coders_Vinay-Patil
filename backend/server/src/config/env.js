import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:5173'),
  DATABASE_PATH: z.string().min(1).default('./data/kaamconnect.sqlite'),
  SESSION_SECRET: z.string().min(16).default('kaamconnect-dev-secret-change-in-production'),
});

// Fail early in production if required secrets are missing or insecure.
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

if (
  parsed.data.NODE_ENV === 'production' &&
  parsed.data.SESSION_SECRET === 'kaamconnect-dev-secret-change-in-production'
) {
  console.error('❌ SESSION_SECRET must be changed from the default value in production.');
  process.exit(1);
}

export const env = {
  port: parsed.data.PORT,
  nodeEnv: parsed.data.NODE_ENV,
  clientOrigin: parsed.data.CLIENT_ORIGIN,
  databasePath: parsed.data.DATABASE_PATH,
  sessionSecret: parsed.data.SESSION_SECRET,
  isProd: parsed.data.NODE_ENV === 'production',
  isTest: parsed.data.NODE_ENV === 'test',
};
