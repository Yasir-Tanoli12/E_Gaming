import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { AuthService } from '../auth/auth.service';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const OTP_BCRYPT_ROUNDS = 10;
const MAX_VERIFY_ATTEMPTS = 5;
/** Max OTP emails per address per rolling minute (cache key window). */
const OTP_REQUESTS_PER_EMAIL_PER_MINUTE = 5;

@Injectable()
export class AdminOtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private otpRequestRateKey(email: string): string {
    const minute = Math.floor(Date.now() / 60_000);
    return `admin:otp-req:${email}:${minute}`;
  }

  private async assertOtpRequestRateLimit(email: string): Promise<void> {
    const key = this.otpRequestRateKey(email);
    const count = (await this.cache.get<number>(key)) ?? 0;
    if (count >= OTP_REQUESTS_PER_EMAIL_PER_MINUTE) {
      throw new HttpException(
        'Too many OTP requests for this email. Try again in about a minute.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    await this.cache.set(key, count + 1, 120_000);
  }

  private generateOtp(): string {
    return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  private async isListedAdmin(email: string): Promise<boolean> {
    const row = await this.prisma.admin.findUnique({
      where: { email },
    });
    return Boolean(row);
  }

  /** User row for JWT / refresh tokens; must be ADMIN. */
  private async ensureAdminUser(adminEmail: string) {
    let user = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });
    if (!user) {
      const passwordHash = await bcrypt.hash(
        crypto.randomBytes(32).toString('hex'),
        12,
      );
      user = await this.prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          name: 'Admin',
          role: UserRole.ADMIN,
          emailVerified: true,
        },
      });
    } else if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'This account is not an admin. If you were demoted, ask an admin to invite you again.',
      );
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }
    return user;
  }

  async requestOtp(email: string) {
    const normalized = email.trim().toLowerCase();
    const sameResponse = {
      message: 'If this account is authorized, a sign-in code was sent.',
    };

    if (!(await this.isListedAdmin(normalized))) {
      return sameResponse;
    }

    await this.assertOtpRequestRateLimit(normalized);
    await this.ensureAdminUser(normalized);

    const plain = this.generateOtp();
    const otpHash = await bcrypt.hash(plain, OTP_BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await this.prisma.adminOTP.deleteMany({ where: { email: normalized } });
    await this.prisma.adminOTP.create({
      data: { email: normalized, otp: otpHash, expiresAt },
    });

    try {
      await this.emailService.sendAdminOtpEmail(normalized, plain, expiresAt);
    } catch (e) {
      await this.prisma.adminOTP.deleteMany({ where: { email: normalized } });
      if (e instanceof ServiceUnavailableException) {
        throw e;
      }
      const message =
        e instanceof Error ? e.message : 'Failed to send admin OTP email';
      const isProd = process.env.NODE_ENV === 'production';
      throw new ServiceUnavailableException(
        isProd
          ? 'Could not complete sign-in email. Please try again later.'
          : message,
      );
    }

    return sameResponse;
  }

  async verifyOtp(
    email: string,
    otp: string,
    ip?: string,
    userAgent?: string,
  ) {
    const normalized = email.trim().toLowerCase();
    if (!(await this.isListedAdmin(normalized))) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    const adminUser = await this.ensureAdminUser(normalized);

    const record = await this.prisma.adminOTP.findFirst({
      where: { email: normalized },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired code');
    }

    if (new Date() > record.expiresAt) {
      await this.prisma.adminOTP.delete({ where: { id: record.id } });
      throw new BadRequestException('Code has expired');
    }

    const match = await bcrypt.compare(otp.trim(), record.otp);
    if (!match) {
      const attempts = record.attempts + 1;
      if (attempts >= MAX_VERIFY_ATTEMPTS) {
        await this.prisma.adminOTP.delete({ where: { id: record.id } });
        throw new ForbiddenException(
          'Too many invalid attempts. Request a new code.',
        );
      }
      await this.prisma.adminOTP.update({
        where: { id: record.id },
        data: { attempts },
      });
      throw new UnauthorizedException('Invalid code');
    }

    await this.prisma.adminOTP.delete({ where: { id: record.id } });

    return this.authService.completeAdminOtpSignIn(
      adminUser.id,
      ip,
      userAgent,
    );
  }

  async promoteAdmin(actorUserId: string, rawEmail: string) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
    });
    if (!actor || actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can promote other admins');
    }

    const email = rawEmail.trim().toLowerCase();
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const existing = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('This email already has admin access');
    }

    await this.prisma.admin.create({
      data: { email },
    });

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      const passwordHash = await bcrypt.hash(
        crypto.randomBytes(32).toString('hex'),
        12,
      );
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          name: 'Admin',
          role: UserRole.ADMIN,
          emailVerified: true,
        },
      });
    } else {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.ADMIN, emailVerified: true },
      });
    }

    return {
      message: 'Admin access granted. This email can now sign in with OTP.',
      email,
    };
  }
}
