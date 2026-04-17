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

  private isDatabaseUnavailableError(exception: unknown): boolean {
    if (!(exception instanceof Error)) return false;
    const code =
      typeof exception === 'object' && exception !== null && 'code' in exception
        ? String((exception as { code?: string }).code ?? '')
        : '';
    if (code === 'P1001' || code === 'P1017' || code === 'P2024') {
      return true;
    }
    return (
      exception.message.includes("Can't reach database server") ||
      exception.message.includes('Server has closed the connection') ||
      exception.message.includes('Connection terminated unexpectedly')
    );
  }

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
      if (isProd && status === HttpStatus.INTERNAL_SERVER_ERROR) {
        message = 'An error occurred. Please try again later.';
        error = 'Internal Server Error';
      }
    } else if (this.isDatabaseUnavailableError(exception)) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      error = 'Service Unavailable';
      message = 'Database temporarily unavailable. Please try again shortly.';
      this.logger.error('Database unavailable while handling request.');
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
