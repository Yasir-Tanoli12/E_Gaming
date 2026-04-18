import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response } from 'express';

const ACCESS_COOKIE = 'eg_access_token';
const REFRESH_COOKIE = 'eg_refresh_token';
const COOKIE_MAX_AGE_ACCESS = 15 * 60; // 15 min in seconds
const COOKIE_MAX_AGE_REFRESH = 7 * 24 * 60 * 60; // 7 days in seconds

function getCookieOptions(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
  };
}

@Injectable()
export class AuthCookiesInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const res = context.switchToHttp().getResponse<Response>();
    const opts = getCookieOptions(res);

    return next.handle().pipe(
      map((data: unknown) => {
        const body = data as Record<string, unknown>;
        if (
          body &&
          typeof body === 'object' &&
          typeof body.accessToken === 'string' &&
          typeof body.refreshToken === 'string'
        ) {
          res.cookie(ACCESS_COOKIE, body.accessToken, {
            ...opts,
            maxAge: COOKIE_MAX_AGE_ACCESS * 1000,
          });
          res.cookie(REFRESH_COOKIE, body.refreshToken, {
            ...opts,
            maxAge: COOKIE_MAX_AGE_REFRESH * 1000,
          });
          const { accessToken, refreshToken, ...rest } = body;
          return rest;
        }
        return data;
      }),
    );
  }
}

export function clearAuthCookies(res: Response): void {
  const opts = getCookieOptions(res);
  res.clearCookie(ACCESS_COOKIE, opts);
  res.clearCookie(REFRESH_COOKIE, opts);
}
