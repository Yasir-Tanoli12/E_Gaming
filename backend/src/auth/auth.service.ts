import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthAction } from '@prisma/client';

const CODE_EXPIRY_MINUTES = 10;
const CODE_LENGTH = 6;
const FAILED_ATTEMPT_LIMIT = 5;
const LOCKOUT_MINUTES = 15;
const REFRESH_TOKEN_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  private generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private async createVerificationCode(
    email: string,
    type: 'EMAIL_VERIFY' | 'LOGIN_OTP' | 'PASSWORD_RESET',
    userId?: string,
  ) {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

    await this.prisma.verificationCode.create({
      data: { email, code, type, expiresAt, userId },
    });

    return code;
  }

  async register(dto: RegisterDto, ip?: string, userAgent?: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        name: dto.name ?? null,
        phone: dto.phone ?? null,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    const code = await this.createVerificationCode(user.email, 'EMAIL_VERIFY', user.id);
    await this.emailService.sendVerificationCode(user.email, code, 'EMAIL_VERIFY');

    await this.logAuth(user.id, AuthAction.SIGNUP, ip, userAgent);

    return {
      user,
      requiresVerification: true,
      message: 'Verification code sent to your email',
    };
  }

  async verifyEmail(email: string, code: string, ip?: string, userAgent?: string) {
    const record = await this.prisma.verificationCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        type: 'EMAIL_VERIFY',
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    if (new Date() > record.expiresAt) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.prisma.$transaction([
      this.prisma.verificationCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId! },
        data: { emailVerified: true },
      }),
    ]);

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: record.userId! },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        emailVerified: true,
      },
    });

    await this.logAuth(user.id, AuthAction.SIGNIN, ip, userAgent);

    return this.issueTokens(user);
  }

  async login(dto: LoginDto, ip?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      if (user) {
        await this.incrementFailedAttempts(user.id);
      }
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    if (user.lockedUntil && new Date() < user.lockedUntil) {
      throw new UnauthorizedException(
        `Account locked. Try again after ${user.lockedUntil.toISOString()}`,
      );
    }

    const requiresVerification = !user.emailVerified;

    if (requiresVerification) {
      const code = await this.createVerificationCode(user.email, 'EMAIL_VERIFY', user.id);
      await this.emailService.sendVerificationCode(user.email, code, 'EMAIL_VERIFY');
      return {
        requiresVerification: true,
        email: user.email,
        message: 'Verification code sent to your email',
      };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await this.logAuth(user.id, AuthAction.SIGNIN, ip, userAgent);

    return this.issueTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    });
  }

  async verifyLogin(email: string, code: string, ip?: string, userAgent?: string) {
    const record = await this.prisma.verificationCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        type: 'EMAIL_VERIFY',
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || !record.userId) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    if (new Date() > record.expiresAt) {
      throw new BadRequestException('Verification code has expired');
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: record.userId },
    });

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    await this.prisma.$transaction([
      this.prisma.verificationCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          lastLoginAt: new Date(),
          failedLoginAttempts: 0,
          lockedUntil: null,
        },
      }),
    ]);

    await this.logAuth(user.id, AuthAction.SIGNIN, ip, userAgent);

    return this.issueTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    });
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { message: 'If the email exists, a reset code has been sent' };
    }

    const code = await this.createVerificationCode(user.email, 'PASSWORD_RESET', user.id);
    await this.emailService.sendVerificationCode(user.email, code, 'PASSWORD_RESET');

    return { message: 'If the email exists, a reset code has been sent' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const record = await this.prisma.verificationCode.findFirst({
      where: {
        email: email.toLowerCase(),
        code,
        type: 'PASSWORD_RESET',
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!record || !record.userId) {
      throw new BadRequestException('Invalid or expired reset code');
    }
    if (new Date() > record.expiresAt) {
      throw new BadRequestException('Reset code has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.verificationCode.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
      }),
    ]);

    return { message: 'Password reset successfully' };
  }

  async refreshTokens(refreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const record = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens({
      id: record.user.id,
      email: record.user.email,
      name: record.user.name,
      phone: record.user.phone,
      role: record.user.role,
    });
  }

  private async issueTokens(user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, tokenHash: refreshHash, expiresAt },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }

  private async incrementFailedAttempts(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const attempts = user.failedLoginAttempts + 1;
    const lockedUntil =
      attempts >= FAILED_ATTEMPT_LIMIT
        ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
        : null;

    await this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: attempts, lockedUntil },
    });
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        lastLoginAt: true,
      },
    });
  }

  private async logAuth(
    userId: string,
    action: AuthAction,
    ip?: string,
    userAgent?: string,
  ) {
    await this.prisma.authLog.create({
      data: {
        userId,
        action,
        ipAddress: ip ?? null,
        userAgent: userAgent ?? null,
      },
    });
  }
}
