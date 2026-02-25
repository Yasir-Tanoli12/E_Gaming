import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  private configPath = join(process.cwd(), 'data', 'site-config.json');

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

  // Public: get active games for landing page
  async findAll() {
    return this.prisma.withPoolRetry(() =>
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
  }

  async findTopGames() {
    const ids = this.readTopGameIds();
    if (!ids.length) return [];
    return this.prisma.withPoolRetry(() =>
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
  }

  setTopGames(ids: string[]) {
    this.writeTopGameIds(ids);
    return { topGameIds: ids };
  }

  // Admin: get all games including inactive
  async findAllAdmin() {
    return this.prisma.game.findMany({
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
    return game;
  }

  async create(dto: CreateGameDto) {
    return this.prisma.game.create({
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
  }

  async update(id: string, dto: UpdateGameDto) {
    await this.findOne(id);
    return this.prisma.game.update({
      where: { id },
      data: dto as Record<string, unknown>,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.game.delete({
      where: { id },
    });
  }
}
