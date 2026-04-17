import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

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

  async updateRole(userId: string, newRole: UserRole, currentUserId: string) {
    const currentUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: currentUserId },
      select: { role: true },
    });
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }
    const targetUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true, id: true },
    });
    if (targetUser.id === currentUserId && newRole === UserRole.USER) {
      throw new ForbiddenException('You cannot demote yourself');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true,
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
