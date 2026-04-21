import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { normalizeUploadMediaUrl } from '../common/normalize-upload-media-url';

/** Bump when public payload shape changes (e.g. media URL normalization). */
const GAMES_CACHE_KEY = 'games:public:v3';
const TOP_GAMES_CACHE_KEY = 'games:top:v3';
const CACHE_TTL_MS = 60 * 1000;

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  private configPath = join(process.cwd(), 'data', 'site-config.json');

  private isDatabaseUnavailableError(error: unknown): boolean {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: string }).code ?? '')
        : '';
    if (code === 'P1001' || code === 'P1017' || code === 'P2024') {
      return true;
    }
    const message =
      error instanceof Error ? error.message : String(error ?? '').toString();
    return (
      message.includes("Can't reach database server") ||
      message.includes('Server has closed the connection') ||
      message.includes('Connection terminated unexpectedly')
    );
  }

  private readTopGameIds(): string[] {
    try {
      if (!existsSync(this.configPath)) return [];
      const raw = readFileSync(this.configPath, 'utf-8');
      const json = JSON.parse(raw) as { topGameIds?: string[] };
      return Array.isArray(json.topGameIds) ? json.topGameIds : [];
    } catch {
      return [];
    }
  }

  private async invalidateGamesCaches() {
    await this.cache.del(GAMES_CACHE_KEY);
    const ids = this.readTopGameIds();
    if (ids.length) {
      await this.cache.del(`${TOP_GAMES_CACHE_KEY}:${ids.join(',')}`);
    }
  }

  private writeTopGameIds(ids: string[]) {
    const dir = join(process.cwd(), 'data');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    let existing: Record<string, unknown> = {};
    if (existsSync(this.configPath)) {
      try {
        existing = JSON.parse(readFileSync(this.configPath, 'utf-8')) as Record<
          string,
          unknown
        >;
      } catch {
        existing = {};
      }
    }
    writeFileSync(
      this.configPath,
      JSON.stringify({ ...existing, topGameIds: ids }, null, 2),
      'utf-8',
    );
  }

  private mapGameMediaUrls<
    T extends {
      thumbnailUrl: string | null;
      videoUrl: string | null;
    },
  >(row: T): T {
    return {
      ...row,
      thumbnailUrl: normalizeUploadMediaUrl(row.thumbnailUrl),
      videoUrl: normalizeUploadMediaUrl(row.videoUrl),
    };
  }

  // Public: get active games for landing page (cached 60s)
  async findAll() {
    const cached = await this.cache.get<Awaited<ReturnType<typeof this.findAll>>>(GAMES_CACHE_KEY);
    if (cached) return cached;
    try {
      const result = await this.prisma.withPoolRetry(() =>
        this.prisma.game.findMany({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            videoUrl: true,
            gameLink: true,
            sortOrder: true,
          },
        }),
      );
      const mapped = result.map((g) => this.mapGameMediaUrls(g));
      await this.cache.set(GAMES_CACHE_KEY, mapped, CACHE_TTL_MS);
      return mapped;
    } catch (error) {
      if (this.isDatabaseUnavailableError(error)) {
        this.logger.warn('Database unavailable in games.findAll; returning empty list.');
        return [];
      }
      throw error;
    }
  }

  async findTopGames() {
    const ids = this.readTopGameIds();
    if (!ids.length) return [];
    const cacheKey = `${TOP_GAMES_CACHE_KEY}:${ids.join(',')}`;
    const cached = await this.cache.get<Awaited<ReturnType<typeof this.findTopGames>>>(cacheKey);
    if (cached) return cached;
    try {
      const result = await this.prisma.withPoolRetry(() =>
        this.prisma.game.findMany({
          where: { isActive: true, id: { in: ids } },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          take: 6,
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            videoUrl: true,
            gameLink: true,
            sortOrder: true,
          },
        }),
      );
      const mapped = result.map((g) => this.mapGameMediaUrls(g));
      await this.cache.set(cacheKey, mapped, CACHE_TTL_MS);
      return mapped;
    } catch (error) {
      if (this.isDatabaseUnavailableError(error)) {
        this.logger.warn(
          'Database unavailable in games.findTopGames; returning empty list.',
        );
        return [];
      }
      throw error;
    }
  }

  async setTopGames(ids: string[]) {
    const oldIds = this.readTopGameIds();
    if (oldIds.length) {
      await this.cache.del(`${TOP_GAMES_CACHE_KEY}:${oldIds.join(',')}`);
    }
    this.writeTopGameIds(ids);
    await this.cache.del(GAMES_CACHE_KEY);
    if (ids.length) {
      await this.cache.del(`${TOP_GAMES_CACHE_KEY}:${ids.join(',')}`);
    }
    return { topGameIds: ids };
  }

  // Admin: get all games including inactive
  async findAllAdmin() {
    const rows = await this.prisma.game.findMany({
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        videoUrl: true,
        gameLink: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return rows.map((g) => this.mapGameMediaUrls(g));
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        thumbnailUrl: true,
        videoUrl: true,
        gameLink: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return this.mapGameMediaUrls(game);
  }

  async create(dto: CreateGameDto) {
    const result = await this.prisma.game.create({
      data: {
        title: dto.title,
        description: dto.description ?? null,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        videoUrl: dto.videoUrl ?? null,
        gameLink: dto.gameLink,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
    await this.invalidateGamesCaches();
    return this.mapGameMediaUrls(result);
  }

  async update(id: string, dto: UpdateGameDto) {
    await this.findOne(id);
    const result = await this.prisma.game.update({
      where: { id },
      data: dto as Record<string, unknown>,
    });
    await this.invalidateGamesCaches();
    return this.mapGameMediaUrls(result);
  }

  async remove(id: string) {
    await this.findOne(id);
    const result = await this.prisma.game.delete({
      where: { id },
    });
    await this.invalidateGamesCaches();
    return result;
  }
}
