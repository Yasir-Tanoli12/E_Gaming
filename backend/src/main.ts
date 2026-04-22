import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ensureUploadsTree,
  getUploadsFilesystemRoot,
} from './common/uploads-filesystem-root';

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

  app.enableCors({
    origin: [
      'https://sweepstown.com',
      'https://www.sweepstown.com',
      'http://sweepstown.com',
      'http://www.sweepstown.com',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  ensureUploadsTree();
  const uploadsRoot = getUploadsFilesystemRoot();
  app.use('/uploads', express.static(uploadsRoot));

  const port = process.env.PORT || 3001;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`Listening on port ${port} (NODE_ENV=${nodeEnv ?? 'undefined'})`);
  logger.log(`Serving static files from ${uploadsRoot}`);
}

bootstrap();
