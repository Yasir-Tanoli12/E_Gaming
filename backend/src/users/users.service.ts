import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type AdminAllowlistEntry = {
  email: string;
  addedAt: string;
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  private readonly allowlistPath = join(
    process.cwd(),
    'data',
    'admin-allowlist.json',
  );

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private readAdminAllowlist(): AdminAllowlistEntry[] {
    try {
      if (!existsSync(this.allowlistPath)) return [];
      const raw = readFileSync(this.allowlistPath, 'utf-8');
      const parsed = JSON.parse(raw) as AdminAllowlistEntry[];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((x) => typeof x?.email === 'string')
        .map((x) => ({
          email: this.normalizeEmail(x.email),
          addedAt:
            typeof x?.addedAt === 'string'
              ? x.addedAt
              : new Date().toISOString(),
        }));
    } catch {
      return [];
    }
  }

  private writeAdminAllowlist(items: AdminAllowlistEntry[]) {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(this.allowlistPath, JSON.stringify(items, null, 2), 'utf-8');
  }

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

  getAdminAllowlist() {
    return this.readAdminAllowlist().sort((a, b) =>
      b.addedAt.localeCompare(a.addedAt),
    );
  }

  addAdminAllowlist(email: string) {
    const normalized = this.normalizeEmail(email);
    const items = this.readAdminAllowlist();
    if (items.some((x) => x.email === normalized)) {
      return { email: normalized, alreadyExists: true };
    }
    const next: AdminAllowlistEntry = {
      email: normalized,
      addedAt: new Date().toISOString(),
    };
    items.unshift(next);
    this.writeAdminAllowlist(items);
    return { ...next, alreadyExists: false };
  }

  removeAdminAllowlist(email: string) {
    const normalized = this.normalizeEmail(email);
    const items = this.readAdminAllowlist();
    const before = items.length;
    const filtered = items.filter((x) => x.email !== normalized);
    this.writeAdminAllowlist(filtered);
    return { removed: before !== filtered.length };
  }

  isEmailAllowedForAdminSignup(email: string) {
    const normalized = this.normalizeEmail(email);
    const items = this.readAdminAllowlist();
    return items.some((x) => x.email === normalized);
  }
}
