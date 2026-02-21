import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  // Public: get active games for landing page
  async findAll() {
    return this.prisma.game.findMany({
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
    });
  }

  // Admin: get all games including inactive
  async findAllAdmin() {
    return this.prisma.game.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
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
