import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3001),
  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required',
  }),
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
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().optional(),
  SMTP_SECURE: Joi.boolean().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  MAIL_FROM: Joi.string().optional(),
  APP_NAME: Joi.string().optional(),
  ADMIN_EMAIL: Joi.string().email().optional(),
  ADMIN_PASSWORD: Joi.string().optional(),
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
