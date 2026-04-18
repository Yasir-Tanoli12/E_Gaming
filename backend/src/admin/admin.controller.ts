import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { UserRole } from '@prisma/client';
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthCookiesInterceptor } from '../auth/auth-cookies.interceptor';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminOtpService } from './admin-otp.service';
import { RequestAdminOtpDto } from './dto/request-admin-otp.dto';
import { VerifyAdminOtpDto } from './dto/verify-admin-otp.dto';
import { PromoteAdminDto } from './dto/promote-admin.dto';

/** Per-email OTP limits are enforced in AdminOtpService; skip global IP throttler here. */
@SkipThrottle({ default: true })
@Controller('admin')
export class AdminController {
  constructor(private readonly adminOtpService: AdminOtpService) {}

  @Public()
  @Post('request-otp')
  requestOtp(@Body() dto: RequestAdminOtpDto) {
    return this.adminOtpService.requestOtp(dto.email);
  }

  @Public()
  @UseInterceptors(AuthCookiesInterceptor)
  @Post('verify-otp')
  verifyOtp(
    @Body() dto: VerifyAdminOtpDto,
    @Req() req: { ip?: string; headers?: { 'user-agent'?: string } },
  ) {
    const ip = req.ip ?? req.headers?.['x-forwarded-for'];
    const userAgent = req.headers?.['user-agent'];
    return this.adminOtpService.verifyOtp(dto.email, dto.otp, ip, userAgent);
  }

  @Public()
  @UseGuards(AdminAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('promote')
  promote(
    @Req() req: { user: { id: string } },
    @Body() dto: PromoteAdminDto,
  ) {
    return this.adminOtpService.promoteAdmin(req.user.id, dto.email);
  }
}
