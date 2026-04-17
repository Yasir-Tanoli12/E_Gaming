import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Enforces JWT auth on routes that are also marked @Public() (so the global
 * JwtAuthGuard skips validation). Uses the same "jwt" Passport strategy as
 * JwtStrategy — admin OTP sign-in issues tokens via AuthService.issueTokens.
 */
@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest<TUser>(
    err: unknown,
    user: TUser | false,
    _info?: unknown,
    _context?: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Admin authentication required');
    }
    return user;
  }
}
