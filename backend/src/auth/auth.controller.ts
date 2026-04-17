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
import * as express from 'express';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import {
  AuthCookiesInterceptor,
  clearAuthCookies,
} from './auth-cookies.interceptor';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
