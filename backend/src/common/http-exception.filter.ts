import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const isProd = process.env.NODE_ENV === 'production';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const obj = exceptionResponse as Record<string, unknown>;
        const rawMsg = Array.isArray(obj.message)
          ? obj.message.join(', ')
          : obj.message;
        message =
          (typeof rawMsg === 'string' ? rawMsg : exception.message) ??
          'Internal server error';
        error = (typeof obj.error === 'string' ? obj.error : exception.name) ?? 'Error';
      } else {
        message = String(exceptionResponse);
      }
    } else if (exception instanceof Error) {
      message = isProd ? 'Internal server error' : exception.message;
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
      );
    }

    const body: Record<string, unknown> = {
      statusCode: status,
      error,
      message,
    };

    if (!isProd && exception instanceof Error && exception.stack) {
      (body as Record<string, string>).stack = exception.stack;
    }

    res.status(status).json(body);
  }
}
