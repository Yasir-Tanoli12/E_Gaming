import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: { authLogs: true },
        },
      },
    });
  }

  async getAuthLogs(userId?: string) {
    const where = userId ? { userId } : {};
    return this.prisma.authLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          select: { id: true, email: true, phone: true, name: true },
        },
      },
    });
  }
}
