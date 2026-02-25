import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}
  private readonly legacyNewsPath = join(
    process.cwd(),
    'data',
    'news-posters.json',
  );
  private bootstrapDone = false;
  private async withPoolRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      const code =
        typeof error === 'object' && error && 'code' in error
          ? String((error as { code?: string }).code)
          : '';
      if (code === 'P2024' && retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return this.withPoolRetry(fn, retries - 1);
      }
      throw error;
    }
  }

  private async bootstrapFromLegacyFile() {
    if (this.bootstrapDone) return;
    this.bootstrapDone = true;

    const count = await this.withPoolRetry(() => this.prisma.newsPoster.count());
    if (count > 0 || !existsSync(this.legacyNewsPath)) return;

    try {
      const legacyItems = JSON.parse(
        readFileSync(this.legacyNewsPath, 'utf-8'),
      ) as Array<{
        id?: string;
        title?: string | null;
        imageUrl: string;
        isActive?: boolean;
        createdAt?: string;
        updatedAt?: string;
      }>;

      if (!Array.isArray(legacyItems) || legacyItems.length === 0) return;

      await this.withPoolRetry(() =>
        this.prisma.newsPoster.createMany({
          data: legacyItems
            .filter((item) => !!item.imageUrl)
            .map((item) => ({
              id: item.id,
              title: item.title ?? null,
              imageUrl: item.imageUrl,
              isActive: item.isActive ?? true,
              createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
              updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
            })),
          skipDuplicates: true,
        }),
      );
    } catch {
      return;
    }
  }

  async getCurrent() {
    await this.bootstrapFromLegacyFile();
    return this.withPoolRetry(() =>
      this.prisma.newsPoster.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    );
  }

  async findAll() {
    await this.bootstrapFromLegacyFile();
    return this.withPoolRetry(() =>
      this.prisma.newsPoster.findMany({ orderBy: { createdAt: 'desc' } }),
    );
  }

  async create(dto: CreateNewsDto) {
    await this.bootstrapFromLegacyFile();
    return this.withPoolRetry(() =>
      this.prisma.newsPoster.create({
        data: {
          title: dto.title ?? null,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive ?? true,
        },
      }),
    );
  }

  async update(id: string, dto: UpdateNewsDto) {
    await this.bootstrapFromLegacyFile();
    const existing = await this.withPoolRetry(() =>
      this.prisma.newsPoster.findUnique({ where: { id } }),
    );
    if (!existing) throw new NotFoundException('News poster not found');
    return this.withPoolRetry(() =>
      this.prisma.newsPoster.update({
        where: { id },
        data: {
          title: dto.title ?? existing.title,
          imageUrl: dto.imageUrl ?? existing.imageUrl,
          isActive: dto.isActive ?? existing.isActive,
        },
      }),
    );
  }

  async remove(id: string) {
    await this.bootstrapFromLegacyFile();
    const existing = await this.withPoolRetry(() =>
      this.prisma.newsPoster.findUnique({ where: { id } }),
    );
    if (!existing) throw new NotFoundException('News poster not found');
    return this.withPoolRetry(() => this.prisma.newsPoster.delete({ where: { id } }));
  }
}
