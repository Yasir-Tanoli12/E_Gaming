import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import * as express from 'express';
import { ConfigService } from '@nestjs/config';
import {
  ensureUploadsTree,
  getUploadsFilesystemRoot,
} from './common/uploads-filesystem-root';

const BODY_PARSER_LIMIT = '500mb';
/** Allow large/slow uploads end-to-end (Node default requestTimeout is often 5 minutes). */
const HTTP_UPLOAD_WINDOW_MS = 60 * 60 * 1000;

function shouldCompressResponse(
  req: express.Request,
  res: express.Response,
): boolean {
  // Upload endpoints return tiny JSON responses; skipping compression saves CPU.
  const contentType = req.headers['content-type'] ?? '';
  if (typeof contentType === 'string' && contentType.includes('multipart/form-data')) {
    return false;
  }
  return compression.filter(req, res);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn', 'log']
        : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.useBodyParser('json', { limit: BODY_PARSER_LIMIT });
  app.useBodyParser('urlencoded', { limit: BODY_PARSER_LIMIT, extended: true });

  const config = app.get(ConfigService);
  const trustProxy = config.get<boolean>('TRUST_PROXY');
  const nodeEnv = config.get<string>('NODE_ENV');
  if (trustProxy || nodeEnv === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.enableShutdownHooks();
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser());
  app.use(compression({ filter: shouldCompressResponse }));
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

  const httpServer = app.getHttpServer();
  httpServer.requestTimeout = HTTP_UPLOAD_WINDOW_MS;
  httpServer.headersTimeout = HTTP_UPLOAD_WINDOW_MS + 120_000;

  const logger = new Logger('Bootstrap');
  logger.log(`Listening on port ${port} (NODE_ENV=${nodeEnv ?? 'undefined'})`);
  logger.log(`Serving static files from ${uploadsRoot}`);
  logger.log(
    `HTTP server timeouts: requestTimeout=${httpServer.requestTimeout}ms headersTimeout=${httpServer.headersTimeout}ms`,
  );
}

bootstrap();
