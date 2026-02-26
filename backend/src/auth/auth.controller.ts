import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import * as express from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestResetDto, ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import {
  AuthCookiesInterceptor,
  clearAuthCookies,
} from './auth-cookies.interceptor';

@Throttle({ default: { limit: 10, ttl: 60000 } })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: { ip?: string; headers?: { 'user-agent'?: string } },
  ) {
    const ip = req.ip ?? req.headers?.['x-forwarded-for'];
    const userAgent = req.headers?.['user-agent'];
    return this.authService.register(dto, ip, userAgent);
  }

  @Public()
  @UseInterceptors(AuthCookiesInterceptor)
  @Post('verify-email')
  async verifyEmail(
    @Body() dto: VerifyEmailDto,
    @Req() req: { ip?: string; headers?: { 'user-agent'?: string } },
  ) {
    const ip = req.ip ?? req.headers?.['x-forwarded-for'];
    const userAgent = req.headers?.['user-agent'];
    return this.authService.verifyEmail(dto.email, dto.code, ip, userAgent);
  }

  @Public()
  @UseInterceptors(AuthCookiesInterceptor)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: { ip?: string; headers?: { 'user-agent'?: string } },
  ) {
    const ip = req.ip ?? req.headers?.['x-forwarded-for'];
    const userAgent = req.headers?.['user-agent'];
    return this.authService.login(dto, ip, userAgent);
  }

  @Public()
  @UseInterceptors(AuthCookiesInterceptor)
  @Post('verify-login')
  async verifyLogin(
    @Body() dto: VerifyEmailDto,
    @Req() req: { ip?: string; headers?: { 'user-agent'?: string } },
  ) {
    const ip = req.ip ?? req.headers?.['x-forwarded-for'];
    const userAgent = req.headers?.['user-agent'];
    return this.authService.verifyLogin(dto.email, dto.code, ip, userAgent);
  }

  @Public()
  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  @Public()
  @UseInterceptors(AuthCookiesInterceptor)
  @Post('refresh')
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: { cookies?: { eg_refresh_token?: string } },
  ) {
    const refreshToken =
      req.cookies?.eg_refresh_token ?? dto.refreshToken ?? '';
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new BadRequestException('Refresh token required');
    }
    return this.authService.refreshTokens(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res() res: express.Response) {
    clearAuthCookies(res);
    return res.status(200).json({ message: 'Logged out' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: { user: { id: string } }) {
    return this.authService.validateUser(req.user.id);
  }
}
