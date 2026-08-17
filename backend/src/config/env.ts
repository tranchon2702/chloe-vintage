import 'dotenv/config';
import { resolve } from 'node:path';
import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false'])
  .default('true')
  .transform((value) => value === 'true');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().max(65_535).default(4173),
  API_PREFIX: z.string().regex(/^\/[a-z0-9/-]+$/i).default('/api/v1'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  CONTACT_STORAGE_FILE: z.string().min(1).default('storage/contacts.ndjson'),
  CONTACT_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(10 * 60 * 1000),
  CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  CONTENT_STORAGE_FILE: z.string().min(1).default('storage/content.json'),
  CONTENT_MEDIA_DIRECTORY: z.string().min(1).default('storage/media'),
  ADMIN_PASSWORD: z.string().min(12).default('chloe-local-admin'),
  ADMIN_SESSION_HOURS: z.coerce.number().positive().max(168).default(12),
  SITE_URL: z.string().url().default('http://localhost:4173'),
  SERVE_FRONTEND: booleanString,
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.flatten().fieldErrors;
  throw new Error(`Invalid environment configuration: ${JSON.stringify(issues)}`);
}

const raw = parsed.data;

if (raw.NODE_ENV === 'production' && raw.ADMIN_PASSWORD === 'chloe-local-admin') {
  throw new Error('ADMIN_PASSWORD must be changed before starting in production.');
}

export const env = {
  ...raw,
  isDevelopment: raw.NODE_ENV === 'development',
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  corsOrigins: raw.CORS_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  contactStorageFile: resolve(process.cwd(), raw.CONTACT_STORAGE_FILE),
  contentStorageFile: resolve(process.cwd(), raw.CONTENT_STORAGE_FILE),
  contentMediaDirectory: resolve(process.cwd(), raw.CONTENT_MEDIA_DIRECTORY),
} as const;

export type Environment = typeof env;
