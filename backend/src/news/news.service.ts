import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, type NewsPoster } from '@prisma/client';

const NEWS_LIST_LIMIT_DEFAULT = 50;
const NEWS_LIST_LIMIT_MAX = 200;
const NEWS_CURRENT_CACHE_TTL_MS = 60 * 1000;
type CurrentNews = Pick<
  NewsPoster,
  'id' | 'title' | 'imageUrl' | 'linkUrl' | 'isActive' | 'createdAt' | 'updatedAt'
> | null;

@Injectable()
export class NewsService {
  constructor(private prisma: PrismaService) {}
  private currentNewsCache: { value: CurrentNews; expiresAt: number } | null =
    null;
  private readonly legacyNewsPath = join(
    process.cwd(),
    'data',
    'news-posters.json',
  );
  private bootstrapDone = false;
  private async bootstrapFromLegacyFile() {
    if (this.bootstrapDone) return;
    this.bootstrapDone = true;

    const count = await this.prisma.withPoolRetry(() => this.prisma.newsPoster.count());
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

      await this.prisma.withPoolRetry(() =>
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
    if (this.currentNewsCache && this.currentNewsCache.expiresAt > Date.now()) {
      return this.currentNewsCache.value;
    }
    const current = await this.prisma.withPoolRetry(() =>
      this.prisma.newsPoster.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          linkUrl: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    );
    this.currentNewsCache = {
      value: current,
      expiresAt: Date.now() + NEWS_CURRENT_CACHE_TTL_MS,
    };
    return current;
  }

  async findAll(page = 1, pageSize = NEWS_LIST_LIMIT_DEFAULT) {
    await this.bootstrapFromLegacyFile();
    const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
    const safePageSize = Number.isFinite(pageSize)
      ? Math.min(Math.max(1, Math.floor(pageSize)), NEWS_LIST_LIMIT_MAX)
      : NEWS_LIST_LIMIT_DEFAULT;
    return this.prisma.withPoolRetry(() =>
      this.prisma.newsPoster.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * safePageSize,
        take: safePageSize,
      }),
    );
  }

  async create(dto: CreateNewsDto) {
    await this.bootstrapFromLegacyFile();
    const created = await this.prisma.withPoolRetry(() =>
      this.prisma.newsPoster.create({
        data: {
          title: dto.title ?? null,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive ?? true,
        },
      }),
    );
    this.currentNewsCache = null;
    return created;
  }

  async update(id: string, dto: UpdateNewsDto) {
    await this.bootstrapFromLegacyFile();
    try {
      const updated = await this.prisma.withPoolRetry(() =>
        this.prisma.newsPoster.update({
          where: { id },
          data: {
            ...(dto.title !== undefined ? { title: dto.title } : {}),
            ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
            ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
          },
        }),
      );
      this.currentNewsCache = null;
      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('News poster not found');
      }
      throw error;
    }
  }

  async remove(id: string) {
    await this.bootstrapFromLegacyFile();
    try {
      const deleted = await this.prisma.withPoolRetry(() =>
        this.prisma.newsPoster.delete({ where: { id } }),
      );
      this.currentNewsCache = null;
      return deleted;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('News poster not found');
      }
      throw error;
    }
  }
}
