import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required',
  }),
  /** Direct Postgres (e.g. db.xxx.supabase.co:5432) — required for Prisma migrate with Supabase pooler */
  DIRECT_URL: Joi.string().optional(),
  JWT_SECRET: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required().min(32).messages({
      'any.required': 'JWT_SECRET is required in production (min 32 chars)',
      'string.min': 'JWT_SECRET must be at least 32 characters in production',
    }),
    otherwise: Joi.string()
      .optional()
      .default('fallback-dev-secret-only-for-local'),
  }),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  /** Comma-separated origins; when set, used for CORS instead of FRONTEND_URL only */
  CORS_ORIGINS: Joi.string().optional().allow(''),
  /** Public API base URL (no trailing slash) for generated asset links; optional behind reverse proxy */
  API_URL: Joi.string().uri().optional(),
  PUBLIC_API_URL: Joi.string().uri().optional(),
  /** Origin where `/uploads` is reachable in the browser when it differs from API_URL (e.g. apex site vs /api) */
  PUBLIC_UPLOADS_URL: Joi.string().uri().optional(),
  /** Express trust proxy (1 = first hop); set true in production behind Hostinger/nginx */
  TRUST_PROXY: Joi.boolean()
    .truthy('true', 'yes', '1')
    .falsy('false', 'no', '0')
    .default(false),
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_SECURE: Joi.boolean().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  MAIL_FROM: Joi.string().optional(),
  APP_NAME: Joi.string().optional(),
  /** Legacy; admins are stored in the `Admin` table (see seed / POST /admin/promote). */
  ADMIN_EMAIL: Joi.string().email().optional(),
  /** Gmail address for admin OTP (Google App Password in EMAIL_PASS) */
  EMAIL_USER: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().email().required().messages({
      'any.required': 'EMAIL_USER (Gmail) is required in production for admin OTP',
    }),
    otherwise: Joi.string().email().optional(),
  }),
  EMAIL_PASS: Joi.when('NODE_ENV', {
    is: 'production',
    then: Joi.string().required().messages({
      'any.required':
        'EMAIL_PASS (Gmail App Password) is required in production for admin OTP',
    }),
    otherwise: Joi.string().optional(),
  }),
  ADMIN_PASSWORD: Joi.string().optional(),
  PRISMA_MAX_RETRIES: Joi.number().integer().min(0).max(10).default(2),
  PRISMA_RETRY_BASE_DELAY_MS: Joi.number().integer().min(50).default(250),
  PRISMA_RETRY_MAX_DELAY_MS: Joi.number().integer().min(100).default(2500),
  PRISMA_LOG_QUERIES: Joi.boolean().default(false),
  PRISMA_FAIL_FAST_ON_STARTUP: Joi.boolean().default(true),
  /** Same project as DATABASE_URL when using Supabase Postgres */
  SUPABASE_URL: Joi.string().uri().optional(),
  /** Public anon key (JWT) — safe for frontend; use in SUPABASE_ANON_KEY for backend */
  SUPABASE_ANON_KEY: Joi.string().optional(),
  /** Server-only; bypasses RLS — never expose to the browser */
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().optional(),
})
  .unknown(true);

/** NestJS ConfigModule validate - receives loaded config, returns validated config */
export function validateEnv(config: Record<string, unknown>) {
  const { error, value } = envSchema.validate(config, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    throw new Error(`Environment validation failed: ${messages}`);
  }
  return value;
}
