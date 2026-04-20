import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { join } from 'path';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const config = app.get(ConfigService);
  const trustProxy = config.get<boolean>('TRUST_PROXY');
  const nodeEnv = config.get<string>('NODE_ENV');
  if (trustProxy || nodeEnv === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.enableShutdownHooks();

  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser());
  app.use(compression());
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOriginsRaw = config.get<string>('CORS_ORIGINS') ?? '';
  const configuredOrigins = corsOriginsRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const defaultFrontendOrigin =
    config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  const allowedOrigins = configuredOrigins.length
    ? configuredOrigins
    : [defaultFrontendOrigin];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header) plus configured browser origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  await app.listen(process.env.PORT || 3001);
  const logger = new Logger('Bootstrap');
  logger.log(
    `Listening on port ${process.env.PORT || 3001} (NODE_ENV=${nodeEnv ?? 'undefined'})`,
  );
}
bootstrap();
