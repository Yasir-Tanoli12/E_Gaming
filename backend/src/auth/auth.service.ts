import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthAction, UserRole } from '@prisma/client';

const REFRESH_TOKEN_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /** After admin OTP is verified — JWT + refresh cookies. */
  async completeAdminOtpSignIn(
    userId: string,
    ip?: string,
    userAgent?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('Account not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }
    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin access required');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
        emailVerified: true,
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

  async refreshTokens(refreshToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const record = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            role: true,
          },
        },
      },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (record.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Admin access required');
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
    const refreshHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
    );

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

  async validateUser(userId: string) {
    return this.prisma.withPoolRetry(() =>
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          lastLoginAt: true,
        },
      }),
    );
  }

  private async logAuth(
    userId: string,
    action: AuthAction,
    ip?: string,
    userAgent?: string,
  ) {
    await this.prisma.withPoolRetry(() =>
      this.prisma.authLog.create({
        data: {
          userId,
          action,
          ipAddress: ip ?? null,
          userAgent: userAgent ?? null,
        },
      }),
    );
  }
}
